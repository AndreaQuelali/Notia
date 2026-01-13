"use client";

import React from "react";
import { Plus, Trash2, SquareStack } from "lucide-react";

export default function TableTools({
  top,
  visible = true,
  onAddRow,
  onAddCol,
  onDeleteRow,
  onDeleteCol,
  onMergeCells,
}: {
  top: number;
  visible?: boolean;
  onAddRow: () => void;
  onAddCol: () => void;
  onDeleteRow: () => void;
  onDeleteCol: () => void;
  onMergeCells: () => void;
}) {
  if (!visible) return null;
  return (
    <div
      className="absolute left-12 z-20 select-none"
      style={{ top }}
      aria-label="Table tools"
      onMouseDown={(e) => {
        // Avoid losing selection/caret inside the editor when clicking the toolbar
        e.preventDefault();
      }}
    >
      <div className="flex items-center gap-1 rounded-md border bg-background shadow-sm px-1 py-0.5">
        <button
          type="button"
          className="px-2 h-7 text-sm rounded hover:bg-muted"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddRow();
          }}
          title="Add row"
        >
          <Plus className="inline-block w-3.5 h-3.5 mr-1" /> Row
        </button>
        <button
          type="button"
          className="px-2 h-7 text-sm rounded hover:bg-muted"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddCol();
          }}
          title="Add column"
        >
          <Plus className="inline-block w-3.5 h-3.5 mr-1" /> Col
        </button>
        <button
          type="button"
          className="px-2 h-7 text-sm rounded hover:bg-muted"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteRow();
          }}
          title="Delete row"
        >
          <Trash2 className="inline-block w-3.5 h-3.5 mr-1" /> Row
        </button>
        <button
          type="button"
          className="px-2 h-7 text-sm rounded hover:bg-muted"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteCol();
          }}
          title="Delete column"
        >
          <Trash2 className="inline-block w-3.5 h-3.5 mr-1" /> Col
        </button>
        <button
          type="button"
          className="px-2 h-7 text-sm rounded hover:bg-muted"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMergeCells();
          }}
          title="Merge cells"
        >
          <SquareStack className="inline-block w-3.5 h-3.5 mr-1" /> Merge
        </button>
      </div>
    </div>
  );
}
