// components/tag-dropdown.tsx
import { cn } from "@/lib/utils";
import { TAGS } from "@/types/types";

interface TagDropdownProps {
  selectedIndex: number;
  onSelect: (tagLabel: string) => void;
}

export function TagDropdown({ selectedIndex, onSelect }: TagDropdownProps) {
  return (
    <div className="absolute top-full left-0 right-0 mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
      <div className="p-2">
        {TAGS.map((tag, index) => (
          <button
            key={tag.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(tag.label)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150",
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
