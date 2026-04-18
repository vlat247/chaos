"use client";
import { useState, useRef, useCallback } from "react";
import { Settings, LogOut, List, Plus } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { useAuth } from "@/hooks/use-auth";
import { SmartInput } from "./smart-input";
import { NoteCard } from "./note-card";
import { SettingsSidebar } from "./settings-sidebar";
import { NotesSidebar } from "./notes-sidebar";
import { AuthModal } from "./auth-modal";
import { SearchModal } from "./search-modal";
import { AppleNotesEditor } from "./apple-notes-editor";
import { Search } from "lucide-react";
import { useEffect } from "react";

export function CaptureInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesSidebarOpen, setNotesSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleNoteClick = useCallback((noteId: string) => {
    const el = document.getElementById(`note-${noteId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-white/40");
      setTimeout(() => el.classList.remove("ring-2", "ring-white/40"), 1500);
    }
  }, []);

  const { user, isLoading: authLoading, error: authError, signIn, signUp, signOut, isAuthenticated } = useAuth();
  const {
    notes,
    addNote,
    deleteNote,
    saveEdit,
    togglePin,
    clearAllNotes,
  } = useNotes(isAuthenticated);

  const openEditor = (note: Note | null = null) => {
    setActiveNote(note);
    setIsEditorOpen(true);
  };

  const handleEditorSave = async (content: string, isPublic: boolean, id?: string) => {
    if (id) {
      await saveEdit(id, content, isPublic);
    } else {
      await addNote(content, undefined, isPublic);
    }
  };

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
        <div className="flex-none h-[25vh] flex flex-col items-center justify-center px-4 relative">
          {/* Top left: notes sidebar toggle */}
          <div className="absolute top-6 left-6">
            <button
              onClick={() => setNotesSidebarOpen(true)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Browse notes by tag"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

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
              onClick={() => openEditor(null)}
              className="p-2 rounded-lg text-amber-500/80 hover:text-amber-400 hover:bg-white/10 transition-colors"
              title="New Apple Note"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Search notes (⌘K)"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          <div className="w-full max-w-3xl" onClick={() => openEditor(null)}>
            <div className="w-full px-6 py-4 rounded-4xl bg-white/5 backdrop-blur-lg border border-white/10 text-white/40 text-lg font-sans cursor-text hover:bg-white/10 transition-all">
              Capture anything... 
            </div>
          </div>

          {notes.length === 0 && (
            <div className="mt-8 text-white/30 text-sm animate-pulse">
              Click to create your first public note
            </div>
          )}
        </div>

        {/* ZONE B: List Area */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-12 sidebar-scroll">
          <div className="w-full max-w-3xl mx-auto space-y-4">
            {notes.map((note) => (
              <div key={note.id} id={`note-${note.id}`} className="transition-all duration-300 rounded-xl">
                <NoteCard
                  note={note}
                  onDelete={() => deleteNote(note.id)}
                  onStartEdit={() => openEditor(note)}
                  onTogglePin={() => togglePin(note.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Sidebar */}
      <NotesSidebar
        isOpen={notesSidebarOpen}
        onClose={() => setNotesSidebarOpen(false)}
        notes={notes}
        onNoteClick={handleNoteClick}
      />

      {/* Settings Sidebar */}
      <SettingsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onClear={clearAllNotes}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        notes={notes}
        onSelect={handleNoteClick}
      />

      {/* Apple Notes Editor */}
      <AppleNotesEditor
        isOpen={isEditorOpen}
        initialNote={activeNote}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleEditorSave}
        onDelete={deleteNote}
      />
    </div>
  );
}

