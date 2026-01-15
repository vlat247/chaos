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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  // Update dropdown visibility based on typing
  useEffect(() => {
    setShowDropdown(value.length > 0);
    setSelectedIndex(0);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 1. Tag Shortcuts (Ctrl + 1..N)
    if (e.metaKey || e.ctrlKey) {
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= TAGS.length) {
        e.preventDefault();
        const tag = TAGS[num - 1];
        setValue((prev) => `${prev} ${tag.label}`);
        return;
      }
    }

    // 2. Dropdown Navigation (Only if dropdown is open)
    if (showDropdown) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % TAGS.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + TAGS.length) % TAGS.length);
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const tag = TAGS[selectedIndex];
        setValue((prev) => `${prev} ${tag.label}`);
        return;
      }
    }

    // 3. Submission Logic
    if (e.key === "Enter") {
      // If Shift is NOT pressed -> Submit
      if (!e.shiftKey) {
        e.preventDefault(); // Prevent creating a new line
        if (value.trim()) {
          onCapture(value);
          setValue("");
          setShowDropdown(false);
          // Reset height manually after submit
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
          }
        }
      }
      // If Shift IS pressed -> Do nothing (Browser inserts new line naturally)
    }
  };

  return (
    <div className="relative w-full max-w-2xl group">
      {/* Visual Flair (Glows) */}
      <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-3xl blur-xl opacity-60 group-focus-within:opacity-80 transition-opacity" />

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Capture anything..."
        rows={1}
        className="w-full px-6 py-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/40 text-lg font-sans focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] resize-none overflow-hidden"
        style={{ minHeight: "60px" }}
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(tag.label)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl",
              "transition-all duration-150",
              selectedIndex === index
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <span className={cn("font-mono text-sm tracking-tight", tag.color)}>
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
