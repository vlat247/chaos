"use client";

import { X } from "lucide-react";

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export function SettingsSidebar({
  isOpen,
  onClose,
  onClear,
}: SettingsSidebarProps) {
  // If not open, render nothing (or you can keep it in DOM for animations if using a library)
  if (!isOpen) return null;

  const handleClearChaos = () => {
    if (window.confirm("Are you sure you want to clear all notes?")) {
      onClear();
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-white/10 z-50 shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Settings</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <button
              onClick={handleClearChaos}
              className="w-full px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 font-medium"
            >
              Clear Chaos
            </button>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <p className="text-center text-white/40 text-sm font-mono">
              Chaos Solver v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
