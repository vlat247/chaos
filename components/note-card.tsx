import { X } from "lucide-react";
import ReactMarkdown from "react-markdown"; // 1. Import library
import { Note } from "@/types/types";

interface NoteCardProps {
  note: Note;
  isEditing: boolean;
  editValue: string;
  setEditValue: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
}

export function NoteCard({
  note,
  isEditing,
  editValue,
  setEditValue,
  onSave,
  onCancel,
  onDelete,
  onStartEdit,
}: NoteCardProps) {
  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
        {/* Changed Input to Textarea to support multi-line Markdown editing */}
        <textarea
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // Prevent new line on Enter
              onSave();
            }
            if (e.key === "Escape") onCancel();
          }}
          className="w-full h-auto min-h-[60px] px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white resize-none focus:outline-none focus:border-white/40"
        />
        <div className="text-xs text-white/40 flex justify-between">
          <span>Markdown supported</span>
          <span>Enter to save • Esc to cancel</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDoubleClick={onStartEdit}
      className="group relative w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 transition-colors"
    >
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering edit when deleting
          onDelete();
        }}
        className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all z-10"
      >
        <X className="w-4 h-4 text-white/70 hover:text-white" />
      </button>

      {/* 2. Markdown Rendering Container */}
      <div className="text-lg leading-relaxed break-words">
        <ReactMarkdown
          components={{
            // Styling overrides for Tailwind
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
            // Code block styling (optional addition)
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

      <span className="block mt-3 text-xs text-white/30 font-mono">
        {note.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
