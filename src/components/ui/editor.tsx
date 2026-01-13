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
    handleCommand("insertHTML", html + `<p><br></p>`);
  };

  const insertAndBreak = (html: string) => {
    handleCommand("insertHTML", html + `<p><br></p>`);
  };

  const pickLocalFile = (accept: string): Promise<string | undefined> =>
    new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return resolve(undefined);
        const url = URL.createObjectURL(file);
        resolve(url);
      };
      input.click();
    });

  const getAncestor = (node: Node | null, tag: string): HTMLElement | null => {
    let el: Node | null = node instanceof HTMLElement ? node : node?.parentElement || null;
    const upper = tag.toUpperCase();
    while (el) {
      if ((el as HTMLElement).tagName === upper) return el as HTMLElement;
      el = (el as HTMLElement).parentElement;
    }
    return null;
  };

  const addTableRow = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return insertBlock("table");
    const range = sel.getRangeAt(0);
    const table = getAncestor(range.startContainer, "TABLE") as HTMLTableElement | null;
    if (!table) return insertBlock("table");
    const tbody = table.tBodies[0] || table.createTBody();
    const rows = tbody.rows;
    const cols = rows[0]?.cells.length || 1;
    const tr = document.createElement("tr");
    for (let i = 0; i < cols; i++) {
      const td = document.createElement("td");
      td.className = "border p-2";
      td.innerHTML = "&nbsp;";
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  };

  const addTableColumn = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return insertBlock("table");
    const range = sel.getRangeAt(0);
    const table = getAncestor(range.startContainer, "TABLE") as HTMLTableElement | null;
    if (!table) return insertBlock("table");
    const rows = table.tBodies[0]?.rows || table.rows;
    Array.from(rows).forEach((row) => {
      const td = document.createElement("td");
      td.className = "border p-2";
      td.innerHTML = "&nbsp;";
      row.appendChild(td);
    });
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

  const insertBlock = async (type: BlockType) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    placeCaretAtEnd(editorRef.current);
    switch (type) {
      case "text":
        insertAndBreak(`<p>Text</p>`);
        break;
      case "h1":
        insertAndBreak(`<h1 class='text-3xl font-bold my-2'>Heading 1</h1>`);
        break;
      case "h2":
        insertAndBreak(`<h2 class='text-2xl font-semibold my-2'>Heading 2</h2>`);
        break;
      case "h3":
        insertAndBreak(`<h3 class='text-xl font-semibold my-2'>Heading 3</h3>`);
        break;
      case "bulleted":
        insertAndBreak(`<ul class='list-disc pl-6 my-2'><li>List item</li></ul>`);
        break;
      case "numbered":
        insertAndBreak(`<ol class='list-decimal pl-6 my-2'><li>List item</li></ol>`);
        break;
      case "todo":
        insertTodoItem();
        break;
      case "toggle":
        insertAndBreak(
          `<details class='my-2'><summary class='cursor-pointer select-none'>Toggle list</summary><ul class='list-disc pl-6 my-2'><li>Item</li></ul></details>`
        );
        break;
      case "page": {
        const newPage = createPage();
        // Insert a link that, when clicked, cambia a esa página
        insertAndBreak(
          `<div class='my-2'><a href='#page-${newPage.id}' data-page-id='${newPage.id}' class='inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted'><span>📄</span><span>${newPage.title}</span></a></div>`
        );
        break;
      }
      case "callout":
        insertAndBreak(
          `<div class='my-2 flex items-start gap-2 rounded-md border p-3 bg-muted'><span>💡</span><div>Callout</div></div>`
        );
        break;
      case "quote":
        insertAndBreak(
          `<blockquote class='border-l pl-4 italic my-2'>Quote</blockquote>`
        );
        break;
      case "table":
        insertAndBreak(
          `<table class='my-3 w-full border-collapse'><tbody>
            <tr><td class='border p-2'>&nbsp;</td><td class='border p-2'>&nbsp;</td><td class='border p-2'>&nbsp;</td></tr>
            <tr><td class='border p-2'>&nbsp;</td><td class='border p-2'>&nbsp;</td><td class='border p-2'>&nbsp;</td></tr>
          </tbody></table>`
        );
        break;
      case "divider":
        insertAndBreak(`<hr class='my-4 border-gray-700' />`);
        break;
      case "image": {
        const url = await pickLocalFile("image/*");
        const src = url ?? window.prompt("Pega la URL de la imagen");
        if (src) insertAndBreak(`<img src='${src}' class='max-w-full rounded-md my-2' />`);
        break;
      }
      case "icon": {
        const emoji = window.prompt("Pega un emoji (icono)", "⭐");
        if (emoji) insertAndBreak(`<span class='text-3xl'>${emoji}</span>`);
        break;
      }
      case "music": {
        const url = await pickLocalFile("audio/*");
        const src = url ?? window.prompt("Pega la URL del audio");
        if (src) insertAndBreak(`<audio controls class='my-2'><source src='${src}' /></audio>`);
        break;
      }
      case "link": {
        const href = window.prompt("URL del enlace", "https://");
        if (href) {
          const text = window.prompt("Texto a mostrar", href) || href;
          insertAndBreak(`<a href='${href}' target='_blank' rel='noopener' class='underline text-blue-500'>${text}</a>`);
        }
        break;
      }
      case "video": {
        const url = await pickLocalFile("video/*");
        const src = url ?? window.prompt("Pega la URL del video");
        if (src) insertAndBreak(`<video controls class='w-full max-w-xl rounded-md my-2'><source src='${src}' /></video>`);
        break;
      }
      case "table-row":
        addTableRow();
        break;
      case "table-col":
        addTableColumn();
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

  // Delegate link clicks to navigate to pages
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const a = t.closest("a[data-page-id]") as HTMLAnchorElement | null;
      if (a) {
        e.preventDefault();
        const id = a.getAttribute("data-page-id");
        if (id) setCurrentPageId(id);
      }
    };
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, [setCurrentPageId]);

  return (
    <div className="w-full max-w-2xl border border-gray-700 rounded-lg bg-background relative">
      <BlockMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        top={plusTop}
        visible={focused || menuOpen}
        onSelect={(t) => insertBlock(t)}
      />
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
