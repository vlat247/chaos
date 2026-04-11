"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";

// --- Types ---
interface Tag {
  name: string;
}

interface TagRibbonProps {
  tags: Tag[];
  onSelect: (tag: Tag) => void;
  onHoverChange: (index: number | null, isPreview: boolean) => void;
  onClickOutside: () => void;
}

interface SmartInputProps {
  onCapture: (text: string) => void;
}

// Tag configuration
const INITIAL_TAGS: Tag[] = [
  { name: "work" },
  { name: "personal" },
  { name: "ideas" },
  { name: "todo" },
  { name: "important" },
  { name: "later" },
  { name: "explore" },
];

// --- Components ---

function TagRibbon({
  tags,
  onSelect,
  onHoverChange,
  onClickOutside,
}: TagRibbonProps) {
  // Explicitly type the Refs as HTMLDivElements
  const ribbonRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // "as Node" assertion is required because e.target is technically EventTarget
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClickOutside]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Prevent default browser swipe navigation
    // Note: e.preventDefault() on passive events (like scroll) can be tricky in React 18+,
    // but works here for non-passive synthetic events.
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
    <div
      ref={containerRef}
      className="absolute left-0 right-0 top-full mt-4 z-50"
    >
      <div
        ref={ribbonRef}
        onWheel={handleWheel}
        className="flex flex-row gap-2 overflow-x-auto px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.15)] scrollbar-hide animate-slideUp transform-gpu"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tags.map((tag, index) => {
          const isHighlighted = index === hoveredIndex;

          return (
            <button
              key={tag.name}
              onClick={() => onSelect(tag)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              type="button"
              className={`
                px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200
                ${
                  isHighlighted
                    ? "text-white bg-white/20 scale-105 shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }
              `}
            >
              #{tag.name}
            </button>
          );
        })}
      </div>
      {/* styled-jsx is specific to Next.js; if using generic React, move to CSS module */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export function SmartInput({ onCapture }: SmartInputProps) {
  const [showRibbon, setShowRibbon] = useState(false);
  const [tags, setTags] = useState<Tag[]>(INITIAL_TAGS);
  const [hasContent, setHasContent] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const hashStartRef = useRef<number | null>(null);

  const getTextContent = (): string => {
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
      range.collapse(false); // false means collapse to end

      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const applyHashPreview = (tagName: string | null, isPreview: boolean) => {
    if (!editorRef.current || hashStartRef.current === null) return;

    const text = getTextContent();
    const beforeHash = text.substring(0, hashStartRef.current);
    const afterHash = text.substring(hashStartRef.current);
    const hashWord = afterHash.match(/^#\w*/)?.[0] || "#";
    const remaining = afterHash.substring(hashWord.length);

    // Note: Manipulating innerHTML directly in React is usually an anti-pattern,
    // but acceptable here for a lightweight contentEditable highlighter.
    if (isPreview && tagName) {
      editorRef.current.innerHTML = `${beforeHash}<span class="text-white">#${tagName}</span><span class="text-white/30">${remaining}</span>`;
    } else {
      editorRef.current.innerHTML = `${beforeHash}<span class="text-white">${hashWord}</span>${remaining}`;
    }
    moveCursorToEnd();
  };

  const handleInput = () => {
    const text = getTextContent();
    const isNotEmpty = text.trim().length > 0;

    if (isNotEmpty !== hasContent) {
      setHasContent(isNotEmpty);
    }

    const sel = window.getSelection();
    const cursorPos = sel?.anchorOffset || 0;

    // Logic to detect if we are typing a hash
    const beforeCursor = text.substring(0, cursorPos);
    const lastHashIndex = beforeCursor.lastIndexOf("#");

    if (lastHashIndex !== -1) {
      const afterHash = text.substring(lastHashIndex + 1, cursorPos);
      // Only show ribbon if there are no spaces after hash and length is reasonable
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
      const tag = tags[index];
      applyHashPreview(tag.name, isPreview);
    } else {
      applyHashPreview(null, false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (showRibbon && e.key === "Escape") {
      e.preventDefault();
      handleCloseRibbon();
    } else if (showRibbon && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Create custom tag from typed text
      const text = getTextContent();

      // Safety check for hashStartRef
      if (hashStartRef.current !== null) {
        const afterHash = text.substring(hashStartRef.current);
        const customTagMatch = afterHash.match(/^#(\w+)/);

        if (customTagMatch) {
          const customTagName = customTagMatch[1];
          const newTag: Tag = { name: customTagName };

          // Add to tags if doesn't exist
          if (!tags.some((t) => t.name === customTagName)) {
            setTags((prev) => [...prev, newTag]);
          }

          handleTagSelect(newTag);
        }
      }
    } else if (!showRibbon && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCloseRibbon = () => {
    if (hashStartRef.current !== null) {
      const text = getTextContent();
      const beforeHash = text.substring(0, hashStartRef.current);
      const afterHash = text.substring(hashStartRef.current);
      const remaining = afterHash.replace(/^#\w*/, "#");

      setTextContent(`${beforeHash}${remaining}`);
    }
    setShowRibbon(false);
    hashStartRef.current = null;
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
    setHasContent(true);
    editorRef.current?.focus();
  };

  const handleSubmit = () => {
    const text = getTextContent().trim();
    if (text) {
      onCapture(text);
      setTextContent("");
      setHasContent(false);
      setShowRibbon(false);
      hashStartRef.current = null;
    }
  };

  return (
    <div className="relative w-full max-w-2xl group">
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-3xl blur-lg opacity-60 group-focus-within:opacity-80 transition-opacity duration-500 will-change-[opacity,transform] transform-gpu" />

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="w-full px-6 py-4 pr-14 rounded-4xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder:text-white/40 text-lg font-sans focus:outline-none focus:ring-2 focus:ring-white/30 transition-[box-shadow,background-color,border-color,opacity] duration-300 shadow-[0_0_30px_rgba(255,255,255,0.08)] overflow-y-auto max-h-[150px] min-h-[60px] transform-gpu"
          data-placeholder="Capture anything..."
          // Suppress React warning for contentEditable with dynamic content
          suppressContentEditableWarning={true}
          style={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!hasContent}
          type="button"
          className="absolute right-3 bottom-3 md:bottom-3 h-10 w-10 flex items-center justify-center rounded-full bg-white text-black shadow-lg transform-gpu transition-all duration-150 ease-out hover:scale-110 hover:shadow-xl hover:bg-white/90 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {showRibbon && (
          <TagRibbon
            tags={tags}
            onSelect={handleTagSelect}
            onHoverChange={handleHoverChange}
            onClickOutside={handleCloseRibbon}
          />
        )}
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}
