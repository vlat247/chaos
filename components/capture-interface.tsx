"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { SmartInput } from "./smart-input";
import { NoteCard } from "./note-card";
import { SettingsSidebar } from "./settings-sidebar"; // You create this similarly

export function CaptureInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The hook logic remains, but now it feeds cleanly into child components
  const {
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
  } = useNotes();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black/50">
      <div className="relative z-10 flex flex-col h-full">
        {/* ZONE A: Input Area */}
        <div className="flex-none h-[35vh] flex flex-col items-center justify-center px-4 relative">
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-6 right-6 p-2 rounded-lg text-white/60 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </button>

          <SmartInput onCapture={addNote} />

          {notes.length === 0 && (
            <div className="mt-8 text-white/30 text-sm animate-pulse">
              Press{" "}
              <kbd className="font-mono bg-white/5 px-2 border border-white/10">
                Enter
              </kbd>{" "}
              to save
            </div>
          )}
        </div>

        {/* ZONE B: List Area */}
        <div className="flex-1 overflow-y-auto px-4 pt-8 pb-12">
          <div className="w-full max-w-2xl mx-auto space-y-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isEditing={editingId === note.id}
                editValue={editValue}
                setEditValue={setEditValue}
                onSave={() => saveEdit(note.id)}
                onCancel={cancelEdit}
                onDelete={() => deleteNote(note.id)}
                onStartEdit={() => startEditing(note)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}

      <SettingsSidebar
        isOpen={sidebarOpen} // State from parent
        onClose={() => setSidebarOpen(false)} // Control from parent
        onClear={clearAllNotes} // Function from hook
      />
    </div>
  );
}
