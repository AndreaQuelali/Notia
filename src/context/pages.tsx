"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Page = {
  id: string;
  title: string;
  icon?: string | null;
  content?: string;
  createdAt: number;
  parentId: string | null;
  trashedAt?: number;
};

type PagesContextType = {
  pages: Page[];
  currentPageId: string;
  currentPage: Page;
  createPage: () => Page;
  createChildPage: (parentId: string) => Page;
  duplicatePage: (id: string) => Page | null;
  movePage: (id: string, newParentId: string | null) => void;
  trashPage: (id: string) => void;
  setCurrentPageId: (id: string) => void;
  updatePageTitle: (id: string, title: string) => void;
  updatePageIcon: (id: string, icon: string | null) => void;
  updatePageContent: (id: string, content: string) => void;
};

const STORAGE_KEY = "notia_pages_v1";

const PagesContext = createContext<PagesContextType | null>(null);

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function PagesProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageId, setCurrentPageId] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as { pages: any[]; currentPageId?: string };
        if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
          const migrated = parsed.pages.map((p) => ({
            id: p.id,
            title: p.title ?? "New page",
            icon: p.icon ?? null,
            content: p.content ?? "",
            createdAt: p.createdAt ?? Date.now(),
            parentId: p.parentId ?? null,
            trashedAt: p.trashedAt,
          })) as Page[];
          setPages(migrated);
          const firstActive = migrated.find((pp) => !pp.trashedAt) || migrated[0];
          setCurrentPageId(parsed.currentPageId || firstActive.id);
          return;
        }
      }
    } catch {}

    const first: Page = {
      id: uuid(),
      title: "New page",
      icon: null,
      content: "",
      createdAt: Date.now(),
      parentId: null,
    };
    setPages([first]);
    setCurrentPageId(first.id);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (pages.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ pages, currentPageId }));
    } catch {}
  }, [pages, currentPageId]);

  const createPage = useCallback((): Page => {
    const page: Page = {
      id: uuid(),
      title: "New page",
      icon: null,
      content: "",
      createdAt: Date.now(),
      parentId: null,
    };
    setPages((prev) => [page, ...prev]);
    setCurrentPageId(page.id);
    return page;
  }, []);

  const createChildPage = useCallback((parentId: string): Page => {
    const page: Page = {
      id: uuid(),
      title: "New page",
      icon: null,
      content: "",
      createdAt: Date.now(),
      parentId,
    };
    setPages((prev) => [page, ...prev]);
    setCurrentPageId(page.id);
    return page;
  }, []);

  const duplicatePage = useCallback((id: string): Page | null => {
    const base = pages.find((p) => p.id === id);
    if (!base) return null;
    const page: Page = {
      ...base,
      id: uuid(),
      title: base.title ? `${base.title} (Copy)` : "New page (Copy)",
      createdAt: Date.now(),
      trashedAt: undefined,
    };
    setPages((prev) => [page, ...prev]);
    setCurrentPageId(page.id);
    return page;
  }, [pages]);

  const movePage = useCallback(
    (id: string, newParentId: string | null) => {
      if (newParentId === id) return;

      const childrenByParent = new Map<string | null, string[]>();
      for (const p of pages) {
        if (!childrenByParent.has(p.parentId)) childrenByParent.set(p.parentId, []);
        childrenByParent.get(p.parentId)!.push(p.id);
      }

      const stack = [...(childrenByParent.get(id) ?? [])];
      const descendants = new Set<string>();
      while (stack.length) {
        const curr = stack.pop()!;
        if (descendants.has(curr)) continue;
        descendants.add(curr);
        const kids = childrenByParent.get(curr) ?? [];
        for (const k of kids) stack.push(k);
      }

      if (newParentId && descendants.has(newParentId)) return;

      setPages((prev) => prev.map((p) => (p.id === id ? { ...p, parentId: newParentId } : p)));
    },
    [pages]
  );

  const trashPage = useCallback((id: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, trashedAt: Date.now() } : p)));
    setCurrentPageId((curr) => {
      if (curr === id) {
        const next = pages.find((p) => p.id !== id && !p.trashedAt);
        return next ? next.id : "";
      }
      return curr;
    });
  }, [pages]);

  const updatePageTitle = useCallback((id: string, title: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, title } : p)));
  }, []);

  const updatePageIcon = useCallback((id: string, icon: string | null) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, icon } : p)));
  }, []);

  const updatePageContent = useCallback((id: string, content: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, content } : p)));
  }, []);

  const activePages = useMemo(() => pages.filter((p) => !p.trashedAt), [pages]);

  const currentPage = useMemo(() => {
    return activePages.find((p) => p.id === currentPageId) || activePages[0];
  }, [activePages, currentPageId]);

  const value = useMemo(
    () => ({
      pages: activePages,
      currentPageId,
      currentPage,
      createPage,
      createChildPage,
      duplicatePage,
      movePage,
      trashPage,
      setCurrentPageId,
      updatePageTitle,
      updatePageIcon,
      updatePageContent,
    }),
    [activePages, currentPageId, currentPage, createPage, createChildPage, duplicatePage, movePage, trashPage, updatePageTitle, updatePageIcon, updatePageContent]
  );

  return <PagesContext.Provider value={value}>{children}</PagesContext.Provider>;
}

export function usePages() {
  const ctx = useContext(PagesContext);
  if (!ctx) throw new Error("usePages must be used within PagesProvider");
  return ctx;
}
