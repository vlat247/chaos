"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, X, Calendar, Hash, CornerDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Note } from "@/types/types";
import { format } from "date-fns";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelect: (noteId: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  notes,
  onSelect,
}: SearchModalProps) {
  const [search, setSearch] = useState("");

  // Handle keyboard events for closing
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onClose]);

  const filteredNotes = notes.filter((note) =>
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-3xl bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <Command className="flex flex-col w-full h-full max-h-[60vh]">
              <div className="flex items-center px-4 border-b border-white/5">
                <Search className="w-5 h-5 text-white/40 mr-3" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search notes, tags, or content..."
                  className="w-full py-4 bg-transparent text-white placeholder:text-white/30 focus:outline-none text-lg"
                  autoFocus
                />
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <Command.List className="overflow-y-auto p-2 sidebar-scroll">
                <Command.Empty className="py-12 text-center">
                  <p className="text-white/40 text-sm">No notes found matching your search.</p>
                </Command.Empty>

                {filteredNotes.length > 0 && (
                  <Command.Group heading="Notes" className="px-2 py-3 text-xs font-medium text-white/30 uppercase tracking-wider">
                    {filteredNotes.map((note) => (
                      <Command.Item
                        key={note.id}
                        onSelect={() => {
                          onSelect(note.id);
                          onClose();
                        }}
                        className="group flex flex-col gap-1 p-3 rounded-xl cursor-default select-none aria-selected:bg-white/10 transition-colors mt-1 hover:bg-white/5"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-white/90 line-clamp-2 text-sm leading-relaxed">
                            {note.content}
                          </p>
                          <CornerDownLeft className="w-3.5 h-3.5 text-white/10 group-aria-selected:text-white/40 opacity-0 group-aria-selected:opacity-100 transition-opacity flex-shrink-0 ml-4" />
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(note.timestamp), "MMM d, yyyy")}
                          </div>
                          
                          {/* Tags Preview */}
                          <div className="flex gap-1.5">
                            {Array.from(note.content.matchAll(/#(\w+)/g))
                              .slice(0, 3)
                              .map((match, i) => (
                                <span key={i} className="flex items-center gap-0.5 text-[10px] text-sky-400 font-medium bg-sky-400/10 px-1.5 py-0.5 rounded">
                                  <Hash className="w-2.5 h-2.5" />
                                  {match[1]}
                                </span>
                              ))}
                          </div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
