// components/smart-input.tsx
"use client";

import { ArrowUp } from "lucide-react";
import { useSmartInput } from "@/hooks/use-smart-input";
import { TagDropdown } from "./tag-dropdown";

interface SmartInputProps {
  onCapture: (text: string) => void;
}

export function SmartInput({ onCapture }: SmartInputProps) {
  // 1. One line to initialize all logic
  const {
    value,
    setValue,
    showDropdown,
    selectedIndex,
    textareaRef,
    handleKeyDown,
    submit,
  } = useSmartInput({ onCapture });

  return (
    <div className="relative w-full max-w-2xl group">
      {/* Visual Flair */}
      <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-3xl blur-xl opacity-60 group-focus-within:opacity-80 transition-opacity" />

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Capture anything..."
          rows={1}
          className="w-full px-6 py-4 pr-14 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/40 text-lg font-sans focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] resize-none overflow-y-auto max-h-[150px]"
          style={{ minHeight: "60px" }}
        />

        <button
          onClick={submit}
          className="absolute right-3 bottom-3 p-2.5 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!value.trim()}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      {showDropdown && (
        <TagDropdown
          selectedIndex={selectedIndex}
          onSelect={(tag) => setValue((prev) => prev + " " + tag)}
        />
      )}
    </div>
  );
}
