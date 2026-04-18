"use client";
import { useState, useEffect, useRef } from "react";
import { X, Share2, Globe, Lock, Trash2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Note } from "@/types/types";

interface AppleNotesEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, isPublic: boolean, id?: string) => void;
  onDelete?: (id: string) => void;
  initialNote?: Note | null;
}

export function AppleNotesEditor({ isOpen, onClose, onSave, onDelete, initialNote }: AppleNotesEditorProps) {
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
      if (initialNote) {
        setContent(initialNote.content);
        setIsPublic(initialNote.isPublic ?? true);
      } else {
        setContent("");
        setIsPublic(true);
      }
      setIsSaved(false);
    }
  }, [isOpen, initialNote]);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content, isPublic, initialNote?.id);
      setIsSaved(true);
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      onClose();
    }
  };

  const handleDelete = () => {
    if (initialNote?.id && onDelete) {
      if (window.confirm("Move this note to trash?")) {
        onDelete(initialNote.id);
        onClose();
      }
    } else {
      // For a new unsaved note, just close/discard
      setContent("");
      onClose();
    }
  };

  const handleShare = () => {
    setIsPublic(!isPublic);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 outline-none"
      >
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-md" 
          onClick={handleSave}
        />
        
        <motion.div 
          className="relative w-full max-w-4xl h-[80vh] bg-[#1c1c1e] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Paper Texture Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
            style={{ 
              backgroundImage: `url('/apple_notes_texture_1776356756800.png')`,
              backgroundSize: '400px'
            }}
          />

          {/* Header Toolbar */}
          <div className="flex-none h-14 px-6 flex items-center justify-between border-b border-white/5 bg-[#1c1c1e]/80 backdrop-blur-sm relative z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleSave}
                className="text-[#eb9b34] hover:text-[#ffb24d] font-medium transition-colors flex items-center gap-1"
              >
                {isSaved ? <Check className="w-5 h-5" /> : "Done"}
              </button>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={handleShare}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                  isPublic 
                    ? "bg-[#eb9b34]/20 text-[#eb9b34]" 
                    : "text-white/40 hover:text-white"
                }`}
                title={isPublic ? "Public link enabled" : "Make public"}
              >
                {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span className="text-sm font-medium">{isPublic ? "Public" : "Private"}</span>
              </button>
              
              <button 
                onClick={handleDelete}
                className="text-white/40 hover:text-red-400 transition-colors"
                title="Discard"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative z-10 p-8 md:p-12 overflow-y-auto custom-scrollbar">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="New Note"
              className="w-full h-full bg-transparent text-white/90 text-2xl md:text-3xl font-light resize-none focus:outline-none placeholder:text-white/10 leading-relaxed"
            />
          </div>

          {/* Footer Info */}
          <div className="flex-none h-10 px-8 flex items-center justify-center text-[10px] text-white/20 uppercase tracking-widest pointer-events-none">
            {isPublic ? "Publicly Shared" : "Private Note"} • {new Date().toLocaleDateString()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
