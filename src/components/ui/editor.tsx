"use client";

import { useEffect, useRef, useState } from "react";
import { usePages } from "@/context/pages";
import BlockMenu, { BlockType } from "@/components/ui/block-menu";

export default function RichTextEditor() {
  const { currentPage, updatePageContent, createPage, setCurrentPageId } = usePages();
  const editorRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [plusTop, setPlusTop] = useState(12);
  const [focused, setFocused] = useState(false);

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertTodoItem = () => {
    const html = `<div class="flex items-center gap-2"><input type="checkbox" class="h-4 w-4" /><span>To-do</span></div>`;
    handleCommand("insertHTML", html);
  };

  const placeCaretAtEnd = (el: HTMLElement) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const insertBlock = (type: BlockType) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    placeCaretAtEnd(editorRef.current);
    switch (type) {
      case "text":
        handleCommand("insertHTML", `<p>Text</p>`);
        break;
      case "h1":
        handleCommand("insertHTML", `<h1 class='text-3xl font-bold my-2'>Heading 1</h1>`);
        break;
      case "h2":
        handleCommand("insertHTML", `<h2 class='text-2xl font-semibold my-2'>Heading 2</h2>`);
        break;
      case "h3":
        handleCommand("insertHTML", `<h3 class='text-xl font-semibold my-2'>Heading 3</h3>`);
        break;
      case "bulleted":
        handleCommand("insertHTML", `<ul class='list-disc pl-6 my-2'><li>List item</li></ul>`);
        break;
      case "numbered":
        handleCommand("insertHTML", `<ol class='list-decimal pl-6 my-2'><li>List item</li></ol>`);
        break;
      case "todo":
        insertTodoItem();
        break;
      case "toggle":
        handleCommand(
          "insertHTML",
          `<details class='my-2'><summary class='cursor-pointer select-none'>Toggle list</summary><ul class='list-disc pl-6 my-2'><li>Item</li></ul></details>`
        );
        break;
      case "page": {
        const newPage = createPage();
        // Insert a simple link-like reference
        handleCommand(
          "insertHTML",
          `<div class='my-2'><a href='#' data-page-id='${newPage.id}' class='inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted'><span>📄</span><span>${newPage.title}</span></a></div>`
        );
        setCurrentPageId(newPage.id);
        break;
      }
      case "callout":
        handleCommand(
          "insertHTML",
          `<div class='my-2 flex items-start gap-2 rounded-md border p-3 bg-muted'><span>💡</span><div>Callout</div></div>`
        );
        break;
      case "quote":
        handleCommand(
          "insertHTML",
          `<blockquote class='border-l pl-4 italic my-2'>Quote</blockquote>`
        );
        break;
      case "table":
        handleCommand(
          "insertHTML",
          `<table class='my-3 w-full border-collapse'><tbody>
            <tr><td class='border p-2'>A1</td><td class='border p-2'>B1</td><td class='border p-2'>C1</td></tr>
            <tr><td class='border p-2'>A2</td><td class='border p-2'>B2</td><td class='border p-2'>C2</td></tr>
          </tbody></table>`
        );
        break;
      case "divider":
        handleCommand("insertHTML", `<hr class='my-4 border-gray-700' />`);
        break;
    }
    setMenuOpen(false);
  };

  // Load current page content into the editor
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = currentPage?.content || "";
    // Reset plus position on page change
    setTimeout(updatePlusPosition, 0);
  }, [currentPage?.id]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    updatePageContent(currentPage.id, html);
    updatePlusPosition();
  };

  const updatePlusPosition = () => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0).cloneRange();
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    const top = Math.max(12, rect.top - editorRect.top + 0);
    setPlusTop(top);
  };

  return (
    <div className="w-full max-w-2xl bg-background relative flex items-center">
      {/* Options */}
      <div className="px-4">
      <BlockMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        top={plusTop}
        visible={focused || menuOpen}
        onSelect={(t) => insertBlock(t)}
      />
      </div>
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 text-lg focus:outline-none"
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => {
          setFocused(true);
          updatePlusPosition();
        }}
        onBlur={() => {
          // Defer to allow trigger to open the menu before hiding the plus
          setTimeout(() => {
            if (!menuOpen) setFocused(false);
          }, 0);
        }}
        onKeyDown={(e) => {
          if (e.key === "/") {
            e.preventDefault();
            setMenuOpen(true);
          }
          if (e.key === "Escape") {
            setMenuOpen(false);
          }
        }}
        onKeyUp={updatePlusPosition}
        onMouseUp={updatePlusPosition}
        data-placeholder="Write '/' for commands..."
      />

      {/* Placeholder style for contentEditable */}
      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: gray;
        }
      `}</style>
    </div>
  );
}
