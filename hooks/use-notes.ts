// hooks/use-notes.ts
"use client";

import { useState, useEffect } from "react";
import { Note } from "@/types/types";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  // Edit Mode States (Moved here because they control data manipulation)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // --- Load Logic ---
  useEffect(() => {
    const savedNotes = localStorage.getItem("chaos-notes");
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp),
        }));
        setNotes(parsed);
      } catch (e) {
        console.error("Failed to load notes", e);
      }
    }
  }, []);

  // --- Save Logic ---
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem("chaos-notes", JSON.stringify(notes));
    }
    // Optional: Add else { localStorage.removeItem... } if you want
  }, [notes]);

  // --- Actions ---
  const addNote = (content: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const deleteNote = (id: string) => {
    const newNotes = notes.filter((n) => n.id !== id);
    setNotes(newNotes);
    if (newNotes.length === 0) localStorage.removeItem("chaos-notes");
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditValue(note.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = (id: string) => {
    if (editValue.trim() === "") {
      deleteNote(id);
    } else {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, content: editValue } : note
        )
      );
    }
    setEditingId(null);
    setEditValue("");
  };

  // Expose everything the UI needs
  return {
    notes,
    editingId,
    editValue,
    setEditValue, // UI needs this for the input field
    addNote,
    deleteNote,
    startEditing,
    cancelEdit,
    saveEdit,
  };
}
