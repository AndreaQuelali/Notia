"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Page = {
  id: string;
  title: string;
  icon?: string | null;
  content?: string; 
  createdAt: number;
};

type PagesContextType = {
  pages: Page[];
  currentPageId: string;
  currentPage: Page;
  createPage: () => Page;
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
        const parsed = JSON.parse(raw) as { pages: Page[]; currentPageId?: string };
        if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
          setPages(parsed.pages);
          setCurrentPageId(parsed.currentPageId || parsed.pages[0].id);
          return;
        }
      }
    } catch {}

    // Initialize with a default page
    const first: Page = {
      id: uuid(),
      title: "New page",
      icon: null,
      content: "",
      createdAt: Date.now(),
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
    };
    setPages((prev) => [page, ...prev]);
    setCurrentPageId(page.id);
    return page;
  }, []);

  const updatePageTitle = useCallback((id: string, title: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, title } : p)));
  }, []);

  const updatePageIcon = useCallback((id: string, icon: string | null) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, icon } : p)));
  }, []);

  const updatePageContent = useCallback((id: string, content: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, content } : p)));
  }, []);

  const currentPage = useMemo(() => {
    return pages.find((p) => p.id === currentPageId) || pages[0];
  }, [pages, currentPageId]);

  const value = useMemo(
    () => ({
      pages,
      currentPageId,
      currentPage,
      createPage,
      setCurrentPageId,
      updatePageTitle,
      updatePageIcon,
      updatePageContent,
    }),
    [pages, currentPageId, currentPage, createPage, updatePageTitle, updatePageIcon, updatePageContent]
  );

  return <PagesContext.Provider value={value}>{children}</PagesContext.Provider>;
}

export function usePages() {
  const ctx = useContext(PagesContext);
  if (!ctx) throw new Error("usePages must be used within PagesProvider");
  return ctx;
}
