"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const tags = [
  { label: "#idea", shortcut: "⌘1", color: "text-amber-400" },
  { label: "#todo", shortcut: "⌘2", color: "text-emerald-400" },
  { label: "#project", shortcut: "⌘3", color: "text-sky-400" },
  { label: "#note", shortcut: "⌘4", color: "text-pink-400" },
];

// 1. Define what a "Note" looks like
interface Note {
  id: string;
  content: string;
  timestamp: Date;
}

export function CaptureInterface() {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 2. This is the "Database" (stored in memory for now)
  const [notes, setNotes] = useState<Note[]>([]);
  // --- NEW: Load from browser memory on startup ---
  useEffect(() => {
    const savedNotes = localStorage.getItem("chaos-notes");
    if (savedNotes) {
      try {
        // We parse the JSON back into objects
        // We also need to fix the "Date" because JSON turns dates into strings
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
  // --- NEW: Save to browser memory whenever notes change ---
  useEffect(() => {
    // Only save if we actually have notes (or if we explicitly want to save empty)
    // This prevents overwriting data on the very first render
    if (notes.length > 0) {
      localStorage.setItem("chaos-notes", JSON.stringify(notes));
    }
  }, [notes]);

  const inputRef = useRef<HTMLInputElement>(null);

  const isTyping = inputValue.length > 0;

  useEffect(() => {
    setShowDropdown(isTyping);
    setSelectedIndex(0);
  }, [isTyping]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // --- NEW LOGIC: Handle Enter Key ---
      if (e.key === "Enter") {
        if (inputValue.trim() === "") return; // Don't save empty notes

        e.preventDefault();

        // Create the new note object
        const newNote: Note = {
          id: Date.now().toString(),
          content: inputValue,
          timestamp: new Date(),
        };

        // Add to the top of the list
        setNotes((prev) => [newNote, ...prev]);

        // Reset the input
        setInputValue("");
        setShowDropdown(false);
        return;
      }
      // -----------------------------------

      if (e.metaKey || e.ctrlKey) {
        const num = Number.parseInt(e.key);
        if (num >= 1 && num <= tags.length) {
          e.preventDefault();
          const tag = tags[num - 1];
          setInputValue((prev) => `${prev} ${tag.label}`);
        }
      }

      if (showDropdown) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % tags.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + tags.length) % tags.length);
        } else if (e.key === "Tab") {
          e.preventDefault();
          const tag = tags[selectedIndex];
          setInputValue((prev) => `${prev} ${tag.label}`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDropdown, selectedIndex, inputValue]); // Added inputValue to dependencies

  const handleTagClick = (tag: string) => {
    setInputValue((prev) => `${prev} ${tag}`);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-2xl px-4 flex flex-col items-center">
      {/* Floating Input Container */}
      <div className="relative w-full z-10">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-full blur-xl opacity-60" />
        <div className="absolute -inset-0.5 bg-white/10 rounded-full blur-md" />

        {/* Input Bar */}
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
          <div className="absolute top-full left-0 right-0 mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2">
              {tags.map((tag, index) => (
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

      {/* Footer Instructions */}
      <div className="mt-8 flex items-center gap-2 text-white/30 text-sm">
        <span>Press</span>
        <kbd className="font-mono text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-white/50">
          Enter
        </kbd>
        <span>to save</span>
      </div>

      {/* --- NEW SECTION: Display the Notes --- */}
      <div className="w-full mt-12 space-y-4">
        {notes.length > 0 && (
          <div className="text-white/40 text-xs font-mono uppercase tracking-widest pl-2">
            Recent Thoughts
          </div>
        )}

        {notes.map((note) => (
          <div
            key={note.id}
            // Add this line below:
            onDoubleClick={() => {
              const newNotes = notes.filter((n) => n.id !== note.id);
              setNotes(newNotes);
              // Also update local storage immediately if list becomes empty
              if (newNotes.length === 0) localStorage.removeItem("chaos-notes");
            }}
            // Keep the className and other stuff the same...
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in duration-300 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <p className="text-lg leading-relaxed">{note.content}</p>
              <span className="text-xs text-white/30 font-mono whitespace-nowrap pt-1">
                {note.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* -------------------------------------- */}
    </div>
  );
}
