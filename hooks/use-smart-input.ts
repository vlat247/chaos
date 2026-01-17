// hooks/use-smart-input.ts
import { useState, useEffect, useRef } from "react";
import { TAGS } from "@/types/types";
import { setDefaultCACertificates } from "tls";

interface UseSmartInputProps {
  onCapture: (text: string) => void;
}

export function useSmartInput({ onCapture }: UseSmartInputProps) {
  const [value, setValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Auto-resize Logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 1. Reset height to calculate correct scrollHeight
      textarea.style.height = "auto";

      // 2. Calculate new height
      const newHeight = textarea.scrollHeight;

      // 3. Apply height
      textarea.style.height = `${newHeight}px`;

      // 4. THE FIX: Only show scrollbar if we hit the limit
      // We compare newHeight with your max-height (150px)
      if (newHeight >= 150) {
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.overflowY = "hidden";
      }
    }
  }, [value]);

  // 2. Dropdown Logic
  useEffect(() => {
    setShowDropdown(value.length > 0);
    setSelectedIndex(0);
  }, [value]);

  // 3. The Complex Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMobile = window.innerWidth < 768;

    // Tag Shortcuts
    if (e.metaKey || e.ctrlKey) {
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= TAGS.length) {
        e.preventDefault();
        setValue((prev) => `${prev} ${TAGS[num - 1].label}`);
        return;
      }
    }

    // Dropdown Navigation
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

    // Submission
    if (e.key === "Enter") {
      if (!isMobile && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    }
  };

  const submit = () => {
    if (value.trim()) {
      onCapture(value);
      setValue("");
      setShowDropdown(false);
      // Reset height
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  return {
    value,
    setValue,
    showDropdown,
    selectedIndex,
    textareaRef,
    handleKeyDown,
    submit,
  };
}
