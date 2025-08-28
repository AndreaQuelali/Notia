"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, Underline, Smile, Cpu } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import ChatBot from "./chatbot";
export default function RichTextEditor() {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  return (
    <div className="w-full max-w-2xl border border-gray-700 rounded-lg bg-background relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-gray-700 p-2">
        <Toggle onClick={() => handleCommand("bold")} aria-label="Bold">
          <Bold className="w-4 h-4" />
        </Toggle>
        <Toggle onClick={() => handleCommand("italic")} aria-label="Italic">
          <Italic className="w-4 h-4" />
        </Toggle>
        <Toggle onClick={() => handleCommand("underline")} aria-label="Underline">
          <Underline className="w-4 h-4" />
        </Toggle>
        <Toggle onClick={() => setShowEmojiPicker(!showEmojiPicker)} aria-label="Emoji">
          <Smile className="w-4 h-4" />
        </Toggle>
        {/* Toggle del chat */}
        <Toggle onClick={() => setOpenChat(!openChat)} aria-label="AI Chat">
          <Cpu className="w-4 h-4" />
        </Toggle>
      </div>

      {/* Editor */}
      <div
        contentEditable
        className="min-h-[200px] p-4 text-lg focus:outline-none"
        suppressContentEditableWarning
      />

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute mt-2 z-50">
          <EmojiPicker
            onEmojiClick={(emojiData) => handleCommand("insertText", emojiData.emoji)}
          />
        </div>
      )}

      {/* Chat Bot */}
      {openChat && (
        <div className="absolute bottom-0 right-0 w-96 max-h-[400px] border border-gray-700 bg-background rounded-lg shadow-lg z-50">
          <ChatBot />
        </div>
      )}
    </div>
  );
}
