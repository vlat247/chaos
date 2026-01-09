//this is how note looks like
export interface Note {
  id: string;
  content: string;
  timestamp: Date;
}

export const TAGS = [
  { label: "#idea", shortcut: "⌘1", color: "text-amber-400" },
  { label: "#todo", shortcut: "⌘2", color: "text-emerald-400" },
  { label: "#project", shortcut: "⌘3", color: "text-sky-400" },
  { label: "#note", shortcut: "⌘4", color: "text-pink-400" },
];
