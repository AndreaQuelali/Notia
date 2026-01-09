"use client";

import { useEffect, useRef, useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, Underline, Smile, Cpu, ListTodo } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import ChatBot from "./chatbot";
import { usePages } from "@/context/pages";

export default function RichTextEditor() {
  const { currentPage, updatePageContent } = usePages();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertTodoItem = () => {
    const html = `<div class="flex items-center gap-2"><input type="checkbox" class="h-4 w-4" /><span>To-do</span></div>`;
    handleCommand("insertHTML", html);
  };

  // Load current page content into the editor
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = currentPage?.content || "";
  }, [currentPage?.id]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    updatePageContent(currentPage.id, html);
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
        <Toggle onClick={insertTodoItem} aria-label="Checklist">
          <ListTodo className="w-4 h-4" />
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
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 text-lg focus:outline-none"
        suppressContentEditableWarning
        onInput={handleInput}
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
