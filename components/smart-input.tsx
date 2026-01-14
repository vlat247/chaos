"use client";

import { useState, useEffect, useRef } from "react";
import { TAGS } from "@/types/types";
import { cn } from "@/lib/utils";

interface SmartInputProps {
  onCapture: (text: string) => void;
}

export function SmartInput({ onCapture }: SmartInputProps) {
  const [value, setValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Isolate the keyboard logic here
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Tag Shortcuts (Ctrl + 1..N)
      if (e.metaKey || e.ctrlKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= TAGS.length) {
          e.preventDefault();
          const tag = TAGS[num - 1];
          setValue((prev) => `${prev} ${tag.label}`);
        }
      }

      // 2. Dropdown Navigation
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
          setValue((prev) => `${prev} ${tag.label}`);
        }
      }

      // 3. Submission
      if (e.key === "Enter" && value.trim()) {
        e.preventDefault();
        onCapture(value);
        setValue("");
        setShowDropdown(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [value, showDropdown, selectedIndex, onCapture]);

  // Update dropdown visibility based on typing
  useEffect(() => {
    setShowDropdown(value.length > 0);
    setSelectedIndex(0);
  }, [value]);

  return (
    <div className="relative w-full max-w-2xl">
      {/* Visual Flair (Glows) */}
      <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-full blur-xl opacity-60" />

      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Capture anything..."
        className="w-full px-6 py-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/40 text-lg font-sans focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
      />

      {showDropdown && (
        <TagDropdown
          selectedIndex={selectedIndex}
          onSelect={(tag) => setValue((prev) => prev + " " + tag)}
        />
      )}
    </div>
  );
}

interface TagDropdownProps {
  selectedIndex: number;
  onSelect: (tagLabel: string) => void;
}

function TagDropdown({ selectedIndex, onSelect }: TagDropdownProps) {
  return (
    <div className="absolute top-full left-0 right-0 mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
      <div className="p-2">
        {TAGS.map((tag, index) => (
          <button
            key={tag.label}
            // STOP PROPAGATION: Important so clicking a tag doesn't blur the input immediately in weird ways
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(tag.label)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl",
              "transition-all duration-150",
              // Highlight if it's the selected index OR if hovered (handled by CSS hover)
              selectedIndex === index
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <span
              className={cn(
                "font-mono text-sm tracking-tight",
                tag.color // Assuming your tag object has a color class string
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
  );
}
