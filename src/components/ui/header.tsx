"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import PageCover from "./cover";

export default function PageHeader() {
  const [icon, setIcon] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [title, setTitle] = useState("");

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCover(url);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Cover */}
      <div className="relative w-full h-48 bg-muted flex items-center justify-center rounded-md overflow-hidden">
        <PageCover />

       
      </div>

      {/* Icon & Title */}
      <div className="flex items-center gap-4 mt-4">
        <div className="relative">
          {icon ? (
            <span
              className="text-5xl cursor-pointer"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {icon}
            </span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex items-center gap-1"
            >
              <Smile className="w-4 h-4" /> Add icon
            </Button>
          )}

          {showEmojiPicker && (
            <div className="absolute z-50 mt-2">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setIcon(emojiData.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Editable title */}
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setTitle(e.currentTarget.textContent || "")}
          className="text-4xl font-bold focus:outline-none flex-1"
          data-placeholder="New page"
        />
      </div>

      {/* Placeholder style */}
      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: gray;
        }
      `}</style>
    </div>
  );
}
