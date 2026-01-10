"use client";

import { useState, useEffect, useRef } from "react";
import { X, Settings } from "lucide-react";

// 1. Сначала определяем, как выглядит паспорт "Заметки"
interface Note {
  id: string;
  content: string;
  timestamp: Date;
}

const TAGS = [
  { label: "#idea", shortcut: "⌘1", color: "text-blue-400" },
  { label: "#todo", shortcut: "⌘2", color: "text-green-400" },
  { label: "#note", shortcut: "⌘3", color: "text-yellow-400" },
  { label: "#question", shortcut: "⌘4", color: "text-purple-400" },
];

function useNotes() {
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

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// ... Дальше идет твой CaptureInterface (он в порядке)

export function CaptureInterface() {
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

  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const isTyping = inputValue.length > 0;

  useEffect(() => {
    setShowDropdown(isTyping);
    setSelectedIndex(0);
  }, [isTyping]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !editingId) {
        if (inputValue.trim() === "") return;
        e.preventDefault();
        addNote(inputValue);
        setInputValue("");
        setShowDropdown(false);
        return;
      }

      if (e.metaKey || e.ctrlKey) {
        const num = Number.parseInt(e.key);
        if (num >= 1 && num <= TAGS.length) {
          e.preventDefault();
          const tag = TAGS[num - 1];
          setInputValue((prev) => `${prev} ${tag.label}`);
        }
      }

      if (showDropdown) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % TAGS.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + TAGS.length) % TAGS.length);
        } else if (e.key === "Tab") {
          e.preventDefault();
          const tag = TAGS[selectedIndex];
          setInputValue((prev) => `${prev} ${tag.label}`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDropdown, selectedIndex, inputValue, editingId, addNote]);

  const handleTagClick = (tag: string) => {
    setInputValue((prev) => `${prev} ${tag}`);
    inputRef.current?.focus();
  };

  const handleClearChaos = () => {
    if (window.confirm("Are you sure you want to clear all notes?")) {
      clearAllNotes();
      setSidebarOpen(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950">
      {/* Main Layout Container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* ZONE A: Fixed Input Area (Top ~35%) */}
        <div className="flex-none h-[35vh] flex flex-col items-center justify-center px-4 relative">
          {/* Settings Icon */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-6 right-6 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="Open settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="w-full max-w-2xl">
            {/* Floating Input Container */}
            <div className="relative w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-full blur-xl opacity-60" />
              <div className="absolute -inset-0.5 bg-white/10 rounded-full blur-md" />

              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Capture anything..."
                  className={cn(
                    "w-full px-6 py-4 rounded-full",
                    "bg-white/10 backdrop-blur-xl",
                    "border border-white/20",
                    "text-white placeholder:text-white/40",
                    "text-lg font-sans",
                    "focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40",
                    "transition-all duration-300",
                    "shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                  )}
                />
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-2">
                    {TAGS.map((tag, index) => (
                      <button
                        key={tag.label}
                        onClick={() => handleTagClick(tag.label)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl",
                          "transition-all duration-150",
                          selectedIndex === index
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span
                          className={cn(
                            "font-mono text-sm tracking-tight",
                            tag.color
                          )}
                        >
                          {tag.label}
                        </span>
                        <kbd className="font-mono text-xs text-white/30 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                          {tag.shortcut}
                        </kbd>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Conditional Footer Instructions */}
            {notes.length === 0 && (
              <div className="mt-8 flex items-center justify-center gap-2 text-white/30 text-sm animate-pulse">
                <span>Press</span>
                <kbd className="font-mono text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-white/50">
                  Enter
                </kbd>
                <span>to save</span>
              </div>
            )}
          </div>
        </div>

        {/* ZONE B: Scrollable Notes Area (Bottom ~65%) */}
        <div className="flex-1 relative overflow-hidden">
          {/* Gradient Fade Overlay - Matches bg-zinc-950 */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-zinc-950 to-transparent z-10 pointer-events-none" />

          {/* Scrollable Container */}
          <div className="h-full overflow-y-auto px-4 pt-8 pb-12">
            <div className="w-full max-w-2xl mx-auto space-y-4">
              {notes.length > 0 && (
                <div className="text-white/40 text-xs font-mono uppercase tracking-widest pl-2 mb-6">
                  Recent Thoughts
                </div>
              )}

              {notes.map((note) => (
                <div
                  key={note.id}
                  onDoubleClick={() => {
                    if (editingId !== note.id) startEditing(note);
                  }}
                  className="group relative w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in duration-300 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  {editingId === note.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(note.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-lg focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      <div className="flex gap-2 text-xs text-white/40">
                        <span>Press Enter to save • Esc to cancel</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        aria-label="Delete note"
                      >
                        <X className="w-4 h-4 text-white transition-all duration-200 hover:scale-125 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      </button>
                      <div className="flex justify-between items-start gap-4 pr-8">
                        <p className="text-lg leading-relaxed">
                          {note.content}
                        </p>
                        <span className="text-xs text-white/30 font-mono whitespace-nowrap pt-1">
                          {note.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sidebar Drawer */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-white/10 z-50 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">Settings</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <button
                  onClick={handleClearChaos}
                  className="w-full px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 font-medium"
                >
                  Clear Chaos
                </button>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10">
                <p className="text-center text-white/40 text-sm font-mono">
                  Chaos Solver v1.0
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
