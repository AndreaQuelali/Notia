"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Table as TableIcon,
  Minus,
  FileText,
  ChevronDown,
  Image as ImageIcon,
  Link as LinkIcon,
  Music2,
  Video,
  Trash2,
  SquareStack,
} from "lucide-react";

export type BlockType =
  | "text"
  | "h1"
  | "h2"
  | "h3"
  | "bulleted"
  | "numbered"
  | "todo"
  | "toggle"
  | "page"
  | "callout"
  | "quote"
  | "table"
  | "divider"
  | "image"
  | "icon"
  | "music"
  | "link"
  | "video"
  | "table-row"
  | "table-col"
  | "delete-row"
  | "delete-col"
  | "merge-cells";

export default function BlockMenu({
  open,
  onOpenChange,
  top,
  visible,
  onSelect,
  inTable = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  top: number;
  visible: boolean;
  onSelect: (type: BlockType) => void;
  inTable?: boolean;
}) {
  const [filter, setFilter] = useState("");

  const items: { key: BlockType; label: string; icon: React.ElementType }[] = [
    { key: "text", label: "Text", icon: Type },
    { key: "h1", label: "Heading 1", icon: Heading1 },
    { key: "h2", label: "Heading 2", icon: Heading2 },
    { key: "h3", label: "Heading 3", icon: Heading3 },
    { key: "bulleted", label: "Bulleted list", icon: List },
    { key: "numbered", label: "Numbered list", icon: ListOrdered },
    { key: "todo", label: "To-do", icon: ListTodo },
    { key: "toggle", label: "Toggle list", icon: ChevronDown },
    { key: "page", label: "Page", icon: FileText },
    { key: "callout", label: "Callout", icon: Plus },
    { key: "quote", label: "Quote", icon: Quote },
    { key: "table", label: "Table", icon: TableIcon },
    { key: "divider", label: "Divider", icon: Minus },
    { key: "image", label: "Image", icon: ImageIcon },
    { key: "icon", label: "Icon", icon: Plus },
    { key: "music", label: "Music", icon: Music2 },
    { key: "link", label: "Link", icon: LinkIcon },
    { key: "video", label: "Video", icon: Video },
    { key: "table-row", label: "Add row", icon: Plus },
    { key: "table-col", label: "Add column", icon: Plus },
    { key: "delete-row", label: "Delete row", icon: Trash2 },
    { key: "delete-col", label: "Delete column", icon: Trash2 },
    { key: "merge-cells", label: "Merge cells", icon: SquareStack },
  ];

  const filtered = items
    .filter((i) => i.label.toLowerCase().includes(filter.toLowerCase()))
    .filter((i) =>
      inTable
        ? true
        : ![
            "table-row",
            "table-col",
            "delete-row",
            "delete-col",
            "merge-cells",
          ].includes(i.key)
    );

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={`absolute left-2 size-7 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center border border-transparent z-10 ${visible ? "" : "invisible"}`}
          aria-label="Add block"
          type="button"
          style={{ top }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <div className="px-2 py-1.5">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Type to filter..."
            className="w-full h-8 px-2 rounded-md bg-background border"
          />
        </div>
        <DropdownMenuSeparator />
        {filtered.map((i) => (
          <DropdownMenuItem key={i.key} onSelect={() => onSelect(i.key)}>
            <i.icon className="w-4 h-4" />
            <span>{i.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
