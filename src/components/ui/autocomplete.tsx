"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onAccept: (text: string) => void;
}

export default function Autocomplete({ editorRef, onAccept }: Props) {
  const [suggestion, setSuggestion] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchSuggestion = useCallback(async (text: string) => {
    if (!text.trim()) {
      setSuggestion("");
      setVisible(false);
      return;
    }
    setLoading(true);
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await fetch("/api/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed");
      const { suggestion: s } = await res.json();
      if (typeof s === "string" && s.trim()) {
        setSuggestion(s);
        setVisible(true);
      } else {
        setSuggestion("");
        setVisible(false);
      }
    } catch (e) {
      
      if ((e as any).name !== "AbortError") {
        console.error("Autocomplete error:", e);
        setSuggestion("");
        setVisible(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const editorRect = editorRef.current.getBoundingClientRect();
    const rect = range.getBoundingClientRect();
    if (rect && rect.width >= 0) {
      setPos({
        top: Math.max(0, rect.top - editorRect.top),
        left: Math.max(0, rect.left - editorRect.left),
      });
    }

    const endNode = range.endContainer;
    const endOffset = range.endOffset;
    const textContent = endNode.textContent?.slice(0, endOffset) ?? "";
    
    if (textContent.length > 0) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchSuggestion(textContent);
      }, 600);
    } else {
      setSuggestion("");
      setVisible(false);
    }
  }, [fetchSuggestion]);

  const accept = useCallback(() => {
    if (!suggestion || !editorRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.insertNode(document.createTextNode(suggestion));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    onAccept(editorRef.current.innerHTML);
    setSuggestion("");
    setVisible(false);
  }, [suggestion, onAccept]);

  const dismiss = useCallback(() => {
    setSuggestion("");
    setVisible(false);
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && visible) {
        e.preventDefault();
        accept();
      }
      if (e.key === "Escape" && visible) {
        e.preventDefault();
        dismiss();
      }
    };

    editor.addEventListener("input", handleInput);
    editor.addEventListener("keyup", handleInput);
    editor.addEventListener("mouseup", handleInput);
    editor.addEventListener("keydown", onKeyDown);
    return () => {
      editor.removeEventListener("input", handleInput);
      editor.removeEventListener("keyup", handleInput);
      editor.removeEventListener("mouseup", handleInput);
      editor.removeEventListener("keydown", onKeyDown);
    };
  }, [handleInput, visible, accept, dismiss]);

  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute z-50 px-2 py-1 text-sm text-muted-foreground bg-background border rounded-md shadow-md pointer-events-none select-none">
      {loading ? "..." : suggestion}
      <span className="ml-1 text-xs text-muted-foreground/60">(Tab to accept)</span>
    </div>
  );
}
