"use client";

import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  WheelEvent,
} from "react";
import { ArrowUp } from "lucide-react";

// --- Types ---
interface Tag {
  name: string;
  color: string;
}

interface TagRibbonProps {
  onSelect: (tag: Tag) => void;
  onHoverChange: (index: number | null, isPreview: boolean) => void;
}

interface SmartInputProps {
  onCapture: (text: string) => void;
}

// --- Configuration ---
const TAGS: Tag[] = [
  { name: "work", color: "text-blue-500" },
  { name: "urgent", color: "text-red-500" },
  { name: "personal", color: "text-purple-500" },
  { name: "ideas", color: "text-yellow-500" },
  { name: "meeting", color: "text-green-500" },
  { name: "todo", color: "text-orange-500" },
  { name: "important", color: "text-pink-500" },
  { name: "later", color: "text-gray-500" },
  { name: "research", color: "text-cyan-500" },
  { name: "project", color: "text-indigo-500" },
];

// --- Components ---

function TagRibbon({ onSelect, onHoverChange }: TagRibbonProps) {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    // Intercept vertical scroll and turn it into horizontal scroll
    if (ribbonRef.current) {
      ribbonRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    onHoverChange(index, true);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    onHoverChange(null, false);
  };

  return (
    <div className="absolute left-0 right-0 top-full mt-6 z-50">
      <div
        ref={ribbonRef}
        onWheel={handleWheel}
        className="flex flex-row gap-2 overflow-x-auto px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.15)] scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {TAGS.map((tag, index) => {
          const isHighlighted = index === hoveredIndex;

          return (
            <button
              key={tag.name}
              onClick={() => onSelect(tag)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              className={`
                px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200
                ${
                  isHighlighted
                    ? `${tag.color} bg-white/20 scale-105 shadow-lg`
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }
              `}
            >
              #{tag.name}
            </button>
          );
        })}
      </div>
      {/* Inline styles for hiding scrollbar in Webkit browsers */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export function SmartInput({ onCapture }: SmartInputProps) {
  const [showRibbon, setShowRibbon] = useState(false);

  // Refs need types in TS
  const editorRef = useRef<HTMLDivElement>(null);
  const hashStartRef = useRef<number | null>(null);

  const getTextContent = () => {
    return editorRef.current?.textContent || "";
  };

  const setTextContent = (text: string) => {
    if (editorRef.current) {
      editorRef.current.textContent = text;
      moveCursorToEnd();
    }
  };

  const moveCursorToEnd = () => {
    if (!editorRef.current) return;
    const range = document.createRange();
    const sel = window.getSelection();
    if (editorRef.current.childNodes.length > 0) {
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  const applyHashColor = (
    color: string,
    tagName: string | null,
    isPreview: boolean
  ) => {
    if (!editorRef.current || hashStartRef.current === null) return;

    const text = getTextContent();
    const beforeHash = text.substring(0, hashStartRef.current);
    const afterHash = text.substring(hashStartRef.current);

    // Regex to find the word starting with #
    const match = afterHash.match(/^#\w*/);
    const hashWord = match ? match[0] : "#";
    const remaining = afterHash.substring(hashWord.length);

    // Using innerHTML is dangerous usually, but necessary for simple highlighting without a heavy library
    if (isPreview && tagName) {
      editorRef.current.innerHTML = `${beforeHash}<span class="${color}">#${tagName}</span><span class="text-white/30">${remaining}</span>`;
    } else {
      editorRef.current.innerHTML = `${beforeHash}<span class="${color}">${hashWord}</span>${remaining}`;
    }
    moveCursorToEnd();
  };

  const handleInput = () => {
    const text = getTextContent();
    const selection = window.getSelection();
    if (!selection) return;

    const cursorPos = selection.anchorOffset;

    // Find the last # before cursor
    const beforeCursor = text.substring(0, cursorPos);
    const lastHashIndex = beforeCursor.lastIndexOf("#");

    if (lastHashIndex !== -1) {
      const afterHash = text.substring(lastHashIndex + 1, cursorPos);
      // Valid if no spaces and reasonably short
      if (!afterHash.includes(" ") && afterHash.length < 20) {
        setShowRibbon(true);
        hashStartRef.current = lastHashIndex;
      } else {
        setShowRibbon(false);
        hashStartRef.current = null;
      }
    } else {
      setShowRibbon(false);
      hashStartRef.current = null;
    }
  };

  const handleHoverChange = (index: number | null, isPreview: boolean) => {
    if (index !== null) {
      const tag = TAGS[index];
      applyHashColor(tag.color, tag.name, isPreview);
    } else {
      applyHashColor("text-white", null, false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (showRibbon && e.key === "Escape") {
      e.preventDefault();
      setShowRibbon(false);
      hashStartRef.current = null;
    } else if (!showRibbon && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTagSelect = (tag: Tag) => {
    if (hashStartRef.current !== null) {
      const text = getTextContent();
      const beforeHash = text.substring(0, hashStartRef.current);
      const afterHash = text.substring(hashStartRef.current);
      const remaining = afterHash.replace(/^#\w*/, "");

      setTextContent(`${beforeHash}#${tag.name} ${remaining}`);
    }
    setShowRibbon(false);
    hashStartRef.current = null;
    editorRef.current?.focus();
  };

  const handleSubmit = () => {
    const text = getTextContent().trim();
    if (text) {
      onCapture(text);
      setTextContent("");
      setShowRibbon(false);
      hashStartRef.current = null;
    }
  };

  return (
    <div className="relative w-full max-w-2xl group">
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-3xl blur-xl opacity-60 group-focus-within:opacity-80 transition-opacity" />

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning={true} // Crucial for React + ContentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="w-full px-6 py-4 pr-14 rounded-4xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/40 text-lg font-sans focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-y-auto max-h-[150px] min-h-[60px]"
          data-placeholder="Capture anything... Type # for tags"
          style={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!editorRef.current?.textContent?.trim()} // Safer check
          className="absolute right-3 bottom-4 md:bottom-3 h-10 w-10 flex items-center justify-center rounded-full bg-white text-black shadow-lg transform-gpu transition-all duration-150 ease-out hover:scale-110 hover:shadow-xl hover:bg-white/90 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {showRibbon && (
          <TagRibbon
            onSelect={handleTagSelect}
            onHoverChange={handleHoverChange}
          />
        )}
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(255, 255, 255, 0.4);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
