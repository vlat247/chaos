"use client";

import { useMemo, useState } from "react";
import { X, Hash, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { Note, TAGS } from "@/types/types";

interface NotesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onNoteClick: (noteId: string) => void;
}

// Build a color map from the existing TAGS array
const TAG_COLOR_MAP: Record<string, string> = {};
for (const tag of TAGS) {
  const name = tag.label.replace("#", "");
  TAG_COLOR_MAP[name] = tag.color; // e.g. "text-amber-400"
}

// Background pill variants matching the text colors
const TAG_BG_MAP: Record<string, string> = {
  idea: "bg-amber-400/15",
  todo: "bg-emerald-400/15",
  project: "bg-sky-400/15",
  note: "bg-pink-400/15",
};

function extractTags(content: string): string[] {
  const regex = /(?:^|\s)#(\w+)/g;
  const tags: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const tag = match[1].toLowerCase();
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags;
}

function truncate(text: string, max: number): string {
  // Strip markdown-ish formatting for preview
  const clean = text.replace(/[#*_~`>]/g, "").trim();
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}

export function NotesSidebar({
  isOpen,
  onClose,
  notes,
  onNoteClick,
}: NotesSidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const { tagGroups, untagged } = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    const noTag: Note[] = [];

    for (const note of notes) {
      const tags = extractTags(note.content);
      if (tags.length === 0) {
        noTag.push(note);
      } else {
        for (const tag of tags) {
          if (!groups[tag]) groups[tag] = [];
          groups[tag].push(note);
        }
      }
    }

    // Sort tags: known tags first (in TAGS order), then custom alphabetically
    const knownOrder = TAGS.map((t) => t.label.replace("#", ""));
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const ai = knownOrder.indexOf(a);
      const bi = knownOrder.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });

    const sorted: Record<string, Note[]> = {};
    for (const key of sortedKeys) sorted[key] = groups[key];

    return { tagGroups: sorted, untagged: noTag };
  }, [notes]);

  const toggleCollapse = (tag: string) => {
    setCollapsed((prev: Record<string, boolean>) => ({ ...prev, [tag]: !prev[tag] }));
  };

  const handleNoteClick = (noteId: string) => {
    onNoteClick(noteId);
    onClose();
  };

  if (!isOpen) return null;

  const tagColor = (tag: string) => TAG_COLOR_MAP[tag] || "text-white/60";
  const tagBg = (tag: string) => TAG_BG_MAP[tag] || "bg-white/10";

  const tagEntries: [string, Note[]][] = Object.entries(tagGroups);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 h-full w-80 bg-zinc-900 border-r border-white/10 z-50 shadow-2xl animate-in slide-in-from-left duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-white/60" />
              <h2 className="text-xl font-semibold text-white">Notes</h2>
              <span className="ml-1 text-sm text-white/40 font-mono">
                {notes.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close notes sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto sidebar-scroll">
            <div className="p-4 space-y-1">
              {/* Tag Groups */}
              {tagEntries.map(([tag, tagNotes]) => (
                <div key={tag}>
                  {/* Tag header */}
                  <button
                    onClick={() => toggleCollapse(tag)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {collapsed[tag] ? (
                      <ChevronRight className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm font-medium px-2 py-0.5 rounded-md ${tagColor(tag)} ${tagBg(tag)}`}
                    >
                      #{tag}
                    </span>
                    <span className="text-xs text-white/30 font-mono ml-auto">
                      {tagNotes.length}
                    </span>
                  </button>

                  {/* Note list */}
                  {!collapsed[tag] && (
                    <div className="ml-5 border-l border-white/5 pl-3 space-y-0.5 mb-2">
                      {tagNotes.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => handleNoteClick(note.id)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors truncate"
                        >
                          {truncate(note.content, 45)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Untagged section */}
              {untagged.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleCollapse("__untagged__")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {collapsed["__untagged__"] ? (
                      <ChevronRight className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                    )}
                    <FileText className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-sm text-white/50 font-medium">
                      Untagged
                    </span>
                    <span className="text-xs text-white/30 font-mono ml-auto">
                      {untagged.length}
                    </span>
                  </button>

                  {!collapsed["__untagged__"] && (
                    <div className="ml-5 border-l border-white/5 pl-3 space-y-0.5 mb-2">
                      {untagged.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => handleNoteClick(note.id)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors truncate"
                        >
                          {truncate(note.content, 45)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {notes.length === 0 && (
                <div className="py-12 text-center">
                  <Hash className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/30">No notes yet</p>
                  <p className="text-xs text-white/20 mt-1">
                    Use #tags in your notes to organize them
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <p className="text-center text-white/30 text-xs">
              Use{" "}
              <kbd className="font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-white/50">
                #tag
              </kbd>{" "}
              in notes to organize
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
