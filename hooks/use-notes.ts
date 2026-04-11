"use client";
import { useState, useEffect, useCallback } from "react";
import { Note } from "@/types/types";

interface DbNote {
  id: number;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

function mapDbNoteToNote(dbNote: DbNote): Note {
  return {
    id: String(dbNote.id),
    content: dbNote.content,
    timestamp: new Date(dbNote.created_at),
    isPinned: dbNote.is_pinned,
  };
}

export function useNotes(isAuthenticated: boolean) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notes from the database on mount or when auth changes
  const fetchNotes = useCallback(async () => {
    if (!isAuthenticated) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data: DbNote[] = await res.json();
        setNotes(data.map(mapDbNoteToNote));
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes, isAuthenticated]);

  const addNote = async (content: string) => {
    // Optimistic update
    const tempNote: Note = {
      id: `temp-${Date.now()}`,
      content,
      timestamp: new Date(),
      isPinned: false,
    };
    setNotes((prev) => [tempNote, ...prev]);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, is_pinned: false }),
      });

      if (res.ok) {
        const savedNote: DbNote = await res.json();
        // Replace temp note with saved note
        setNotes((prev) =>
          prev.map((n) => (n.id === tempNote.id ? mapDbNoteToNote(savedNote) : n))
        );
      } else {
        // Rollback on error
        setNotes((prev) => prev.filter((n) => n.id !== tempNote.id));
        console.error("Failed to save note");
      }
    } catch (error) {
      // Rollback on error
      setNotes((prev) => prev.filter((n) => n.id !== tempNote.id));
      console.error("Failed to save note:", error);
    }
  };

  const deleteNote = async (id: string) => {
    const noteToDelete = notes.find((n) => n.id === id);
    // Optimistic update
    setNotes((prev) => prev.filter((note) => note.id !== id));

    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok && noteToDelete) {
        // Rollback on error
        setNotes((prev) => [...prev, noteToDelete]);
        console.error("Failed to delete note");
      }
    } catch (error) {
      if (noteToDelete) {
        setNotes((prev) => [...prev, noteToDelete]);
      }
      console.error("Failed to delete note:", error);
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditValue(note.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (id: string) => {
    const originalNote = notes.find((n) => n.id === id);
    // Optimistic update
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, content: editValue } : note
      )
    );
    setEditingId(null);
    setEditValue("");

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editValue }),
      });

      if (!res.ok && originalNote) {
        // Rollback on error
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? originalNote : n))
        );
        console.error("Failed to update note");
      }
    } catch (error) {
      if (originalNote) {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? originalNote : n))
        );
      }
      console.error("Failed to update note:", error);
    }
  };

  const togglePin = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const newPinState = !note.isPinned;
    // Optimistic update
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isPinned: newPinState } : n
      )
    );

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_pinned: newPinState }),
      });

      if (!res.ok) {
        // Rollback on error
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, isPinned: !newPinState } : n
          )
        );
        console.error("Failed to toggle pin");
      }
    } catch (error) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isPinned: !newPinState } : n
        )
      );
      console.error("Failed to toggle pin:", error);
    }
  };

  const clearAllNotes = async () => {
    const oldNotes = [...notes];
    // Optimistic update
    setNotes([]);

    try {
      const res = await fetch("/api/notes", { method: "DELETE" });
      if (!res.ok) {
        // Rollback on error
        setNotes(oldNotes);
        console.error("Failed to clear notes");
      }
    } catch (error) {
      setNotes(oldNotes);
      console.error("Failed to clear notes:", error);
    }
  };

  // Sort notes: pinned first, then by timestamp
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return {
    notes: sortedNotes,
    isLoading,
    editingId,
    editValue,
    setEditValue,
    addNote,
    deleteNote,
    startEditing,
    cancelEdit,
    saveEdit,
    togglePin,
    clearAllNotes,
  };
}
