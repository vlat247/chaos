"use client";
import { useState } from "react";
import { Settings, LogOut } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { useAuth } from "@/hooks/use-auth";
import { SmartInput } from "./smart-input";
import { NoteCard } from "./note-card";
import { SettingsSidebar } from "./settings-sidebar";
import { AuthModal } from "./auth-modal";

export function CaptureInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    togglePin,
    clearAllNotes,
  } = useNotes();

  const { user, isLoading: authLoading, error: authError, signIn, signUp, signOut, isAuthenticated } = useAuth();

  // Show auth modal if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <AuthModal
        onSignIn={signIn}
        onSignUp={signUp}
        isLoading={authLoading}
        error={authError}
      />
    );
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black/50">
        <div className="text-white/50 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black/50">
      <div className="relative z-10 flex flex-col h-full">
        {/* ZONE A: Input Area */}
        <div className="flex-none h-[35vh] flex flex-col items-center justify-center px-4 relative">
          {/* Top right buttons */}
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              onClick={signOut}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title={`Sign out (${user?.email})`}
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
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
                onTogglePin={() => togglePin(note.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <SettingsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onClear={clearAllNotes}
      />
    </div>
  );
}

