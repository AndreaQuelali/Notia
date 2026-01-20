"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { usePages } from "@/context/pages";
import BlockMenu, { BlockType } from "@/components/ui/block-menu";
import EmojiPicker from "emoji-picker-react";
import TableTools from "@/components/ui/table-tools";
import Autocomplete from "@/components/ui/autocomplete";

export default function RichTextEditor() {
  const { currentPage, updatePageContent, createPage, setCurrentPageId } = usePages();
  const editorRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [plusTop, setPlusTop] = useState(12);
  const [focused, setFocused] = useState(false);
  const [inTable, setInTable] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [textColorPickerOpen, setTextColorPickerOpen] = useState(false);
  const draggedBlockRef = useRef<HTMLElement | null>(null);
  const lastRangeRef = useRef<Range | null>(null);

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

  const persistEditorContent = () => {
    if (!editorRef.current) return;
    updatePageContent(currentPage.id, editorRef.current.innerHTML);
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

  const getEditorBlockAncestor = (node: Node | null): HTMLElement | null => {
    const root = editorRef.current;
    if (!root) return null;
    let el: HTMLElement | null = node instanceof HTMLElement ? node : node?.parentElement || null;
    while (el && el !== root) {
      const tag = el.tagName.toUpperCase();
      if (
        [
          "P",
          "H1",
          "H2",
          "H3",
          "UL",
          "OL",
          "BLOCKQUOTE",
          "TABLE",
          "DETAILS",
          "HR",
          "IMG",
          "DIV",
          "AUDIO",
          "VIDEO",
          "A",
        ].includes(tag)
      ) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  };

  const getSelectionBlock = (): HTMLElement | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return getEditorBlockAncestor(sel.anchorNode);
  };

  const handleDragStart = (e: DragEvent<HTMLButtonElement>) => {
    const block = getSelectionBlock();
    if (!block || !editorRef.current) return;
    draggedBlockRef.current = block;
    try {
      e.dataTransfer.setData("text/plain", block.outerHTML);
    } catch {
      // ignore
    }
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!draggedBlockRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    const root = editorRef.current;
    const dragged = draggedBlockRef.current;
    if (!root || !dragged) return;
    e.preventDefault();

    const elAtPoint = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const target = elAtPoint ? getEditorBlockAncestor(elAtPoint) : null;

    if (target && target !== dragged && root.contains(target)) {
      const targetRect = target.getBoundingClientRect();
      const insertAfter = e.clientY > targetRect.top + targetRect.height / 2;
      const refNode = insertAfter ? target.nextSibling : target;
      root.insertBefore(dragged, refNode);
    } else {
      root.appendChild(dragged);
    }

    draggedBlockRef.current = null;
    updatePlusPosition();
    persistEditorContent();
  };

  const applyTextColor = (color: string) => {
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("foreColor", false, color);
    persistEditorContent();
  };

  const addTableRow = () => {
    restoreSelection();
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const table = getAncestor(range.startContainer, "TABLE") as HTMLTableElement | null;
    if (!table) return;
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
    updatePlusPosition();
    persistEditorContent();
  };

  const addTableColumn = () => {
    restoreSelection();
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const table = getAncestor(range.startContainer, "TABLE") as HTMLTableElement | null;
    if (!table) return;
    const rows = table.tBodies[0]?.rows || table.rows;
    Array.from(rows).forEach((row) => {
      const td = document.createElement("td");
      td.className = "border p-2";
      td.innerHTML = "&nbsp;";
      row.appendChild(td);
    });
    updatePlusPosition();
    persistEditorContent();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    lastRangeRef.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const range = lastRangeRef.current;
    if (!range) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const deleteTableRow = () => {
    restoreSelection();
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const tr = getAncestor(range.startContainer, "TR");
    tr?.parentElement?.removeChild(tr);
    updatePlusPosition();
    persistEditorContent();
  };

  const deleteTableColumn = () => {
    restoreSelection();
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const td = getAncestor(range.startContainer, "TD") as HTMLTableCellElement | null;
    if (!td) return;
    const table = getAncestor(td, "TABLE") as HTMLTableElement | null;
    if (!table) return;
    const cellIndex = td.cellIndex;
    const rows = table.tBodies[0]?.rows || table.rows;
    Array.from(rows).forEach((row) => row.cells[cellIndex]?.remove());
    updatePlusPosition();
    persistEditorContent();
  };

  const mergeCells = () => {
    restoreSelection();
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const td = getAncestor(range.startContainer, "TD") as HTMLTableCellElement | null;
    if (!td) return;
    const next = td.nextElementSibling as HTMLTableCellElement | null;
    const prev = td.previousElementSibling as HTMLTableCellElement | null;
    const target = next || prev;
    if (!target) return;
    td.colSpan = (td.colSpan || 1) + ((target.colSpan as number) || 1);
    td.innerHTML = `${td.innerHTML} ${target.innerHTML}`;
    target.remove();
    updatePlusPosition();
    persistEditorContent();
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
    const preserveSelection =
      type === "table-row" ||
      type === "table-col" ||
      type === "delete-row" ||
      type === "delete-col" ||
      type === "merge-cells" ||
      type === "text-color";
    if (!preserveSelection) {
      placeCaretAtEnd(editorRef.current);
    } else {
      restoreSelection();
    }
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
      case "text-color": {
        setTextColorPickerOpen(true);
        break;
      }
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
        setIconPickerOpen(true);
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
      case "delete-row":
        deleteTableRow();
        break;
      case "delete-col":
        deleteTableColumn();
        break;
      case "merge-cells":
        mergeCells();
        break;
    }
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = currentPage?.content || "";
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
    lastRangeRef.current = range.cloneRange();
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    const top = Math.max(12, rect.top - editorRect.top + 0);
    setPlusTop(top);
    const table = getAncestor(range.startContainer, "TABLE");
    setInTable(!!table);
  };

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
    <div spellCheck={true} lang="en" className="w-full max-w-2xl rounded-lg bg-background relative flex items-center">
      <div className="px-4">
        <BlockMenu
          open={menuOpen}
          onOpenChange={setMenuOpen}
          top={plusTop}
          visible={focused || menuOpen}
          inTable={inTable}
          onSelect={(t) => insertBlock(t)}
        />
      </div>
      <button
        className={`absolute left-10 size-7 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center border border-transparent z-10 cursor-grab active:cursor-grabbing ${
          focused || menuOpen ? "" : "invisible"
        }`}
        aria-label="Move block"
        type="button"
        style={{ top: plusTop }}
        draggable
        onDragStart={handleDragStart}
        onMouseDown={saveSelection}
      >
        ⋮⋮
      </button>
      <TableTools
        top={plusTop}
        visible={inTable && (focused || menuOpen)}
        onAddRow={addTableRow}
        onAddCol={addTableColumn}
        onDeleteRow={deleteTableRow}
        onDeleteCol={deleteTableColumn}
        onMergeCells={mergeCells}
      />
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 text-lg focus:outline-none"
        suppressContentEditableWarning
        onInput={handleInput}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
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
            setTextColorPickerOpen(false);
          }
        }}
        onKeyUp={updatePlusPosition}
        onMouseDown={updatePlusPosition}
        onMouseUp={updatePlusPosition}
        data-placeholder="Write '/' for commands..."
      />

      <Autocomplete
        editorRef={editorRef}
        onAccept={(html) => {
          updatePageContent(currentPage.id, html);
          updatePlusPosition();
        }}
      />

      {iconPickerOpen && (
        <div className="absolute z-50" style={{ top: plusTop + 10, left: 48 }}>
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              insertAndBreak(`<span class='text-3xl'>${emojiData.emoji}</span>`);
              setIconPickerOpen(false);
            }}
          />
        </div>
      )}

      {textColorPickerOpen && (
        <div className="absolute z-50" style={{ top: plusTop + 10, left: 48 }}>
          <input
            type="color"
            onChange={(e) => {
              applyTextColor(e.target.value);
              setTextColorPickerOpen(false);
              setMenuOpen(false);
            }}
            onBlur={() => setTextColorPickerOpen(false)}
          />
        </div>
      )}

      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: gray;
        }
      `}</style>
    </div>
  );
}
