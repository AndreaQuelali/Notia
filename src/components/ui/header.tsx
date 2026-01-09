"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import PageCover from "./cover";
import { usePages } from "@/context/pages";

export default function PageHeader() {
  const { currentPage, updatePageTitle, updatePageIcon } = usePages();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  // Load title only when page changes; do not control as React children to avoid caret jump.
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.innerText = currentPage?.title || "";
    }
  }, [currentPage?.id]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Cover */}
      <div className="relative w-full h-48 bg-muted flex items-center justify-center rounded-md overflow-hidden">
        <PageCover />
      </div>

      {/* Icon & Title */}
      <div className="flex items-center gap-4 mt-4">
        <div className="relative">
          {currentPage?.icon ? (
            <span
              className="text-5xl cursor-pointer"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {currentPage.icon}
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
                  updatePageIcon(currentPage.id, emojiData.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Editable title */}
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            const t = e.currentTarget.textContent || "";
            updatePageTitle(currentPage.id, t);
          }}
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
