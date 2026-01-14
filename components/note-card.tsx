import { X } from "lucide-react";
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
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onCancel();
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
        />
        <div className="text-xs text-white/40">
          Press Enter to save • Esc to cancel
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
        onClick={onDelete}
        className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100"
      >
        <X className="w-4 h-4 text-white" />
      </button>
      <p className="text-lg leading-relaxed">{note.content}</p>
      <span className="text-xs text-white/30 font-mono">
        {note.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
