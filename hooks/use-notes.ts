// hooks/use-notes.ts
"use client";

import { useState, useEffect } from "react";
import { Note } from "@/types/types";

export function useNotes() {
  // Указываем, что notes - это массив паспортов Note (<Note[]>)
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // content должен быть строкой (string)
  const addNote = (content: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  // id должен быть строкой (string)
  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  // note должен соответствовать интерфейсу Note
  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditValue(note.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // id - строка
  const saveEdit = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, content: editValue } : note
      )
    );
    setEditingId(null);
    setEditValue("");
  };

  const clearAllNotes = () => {
    setNotes([]);
  };

  return {
    notes,
    editingId,
    editValue,
    setEditValue,
    addNote,
    deleteNote,
    startEditing,
    cancelEdit,
    saveEdit,
    clearAllNotes,
  };
}
