import { X, Pin } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Note } from "@/types/types";
import remarkBreaks from "remark-breaks";
import { useRef, useEffect, useState } from "react";
import { ImageModal } from "./image-modal";

interface NoteCardProps {
  note: Note;
  onDelete: () => void;
  onStartEdit: () => void;
  onTogglePin: () => void;
}

export function NoteCard({
  note,
  onDelete,
  onStartEdit,
  onTogglePin,
}: NoteCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      onDoubleClick={onStartEdit}
      className={`group relative w-full p-4 rounded-xl text-white/90 hover:bg-white/10 transition-all ${
        note.isPinned
          ? "bg-white/10 border-2 border-amber-500/50 shadow-lg shadow-amber-500/10"
          : "bg-white/5 border border-white/10"
      }`}
    >
      {/* Bottom Left: Time */}
      <div className="absolute bottom-3 left-4 text-xs text-white/40 font-mono">
        {formatTime(note.timestamp)}
      </div>

      {/* Bottom Right: Date */}
      <div className="absolute bottom-3 right-4 text-xs text-white/40 font-mono">
        {formatDate(note.timestamp)}
      </div>

      {/* Right Angle: Pin & Delete Buttons */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1.5 rounded-md transition-all ${
            note.isPinned
              ? "bg-amber-500/20 text-amber-400 opacity-100"
              : "opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/70 hover:text-white"
          }`}
          title={note.isPinned ? "Unpin note" : "Pin note"}
        >
          <Pin
            className={`w-4 h-4 transition-transform ${
              note.isPinned ? "fill-current" : ""
            }`}
          />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4 text-white/70 hover:text-white" />
        </button>
      </div>

      {/* Content with proper spacing */}
      <div className="text-lg leading-relaxed break-words pb-8">
        {note.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-white/10 bg-black/20">
            <img
              src={note.imageUrl}
              alt="Attached image"
              onClick={() => setIsImageModalOpen(true)}
              className="w-full h-auto max-h-[400px] object-cover hover:scale-[1.02] transition-transform duration-500 cursor-zoom-in"
              onError={(e) => {
                console.error(`Failed to load image for note ${note.id}:`, note.imageUrl);
              }}
            />
          </div>
        )}

        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={note.imageUrl || ""}
        />
        <ReactMarkdown
          remarkPlugins={[remarkBreaks]}
          components={{
            p: ({ node, ...props }) => (
              <p className="mb-2 last:mb-0" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-all cursor-pointer relative z-10"
                {...props}
              />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-bold text-white" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic text-white/80" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-5 space-y-1 my-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />
            ),
            code: ({ node, ...props }) => (
              <code
                className="bg-white/10 rounded px-1 py-0.5 text-sm font-mono text-pink-300"
                {...props}
              />
            ),
          }}
        >
          {note.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
