"use client";

import { Home, Inbox, Search, Settings, Users, Plus, FileText, MoreHorizontal, Copy, Pencil, ArrowRight, Trash, ChevronRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { usePages } from "@/context/pages";

const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Team",
    url: "#",
    icon: Users,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { pages, currentPageId, setCurrentPageId, createPage, createChildPage, duplicatePage, movePage, trashPage, updatePageTitle } = usePages();

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const pagesById = useMemo(() => {
    const m = new Map<string, (typeof pages)[number]>();
    for (const p of pages) m.set(p.id, p);
    return m;
  }, [pages]);

  const childrenByParentId = useMemo(() => {
    const m = new Map<string | null, (typeof pages)[number][]>();
    for (const p of pages) {
      const key = p.parentId ?? null;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(p);
    }
    for (const [k, arr] of m.entries()) {
      arr.sort((a, b) => b.createdAt - a.createdAt);
      m.set(k, arr);
    }
    return m;
  }, [pages]);

  const rootPages = useMemo(() => childrenByParentId.get(null) ?? [], [childrenByParentId]);

  const isDescendant = useCallback(
    (nodeId: string, possibleAncestorId: string) => {
      let curr = pagesById.get(nodeId)?.parentId ?? null;
      while (curr) {
        if (curr === possibleAncestorId) return true;
        curr = pagesById.get(curr)?.parentId ?? null;
      }
      return false;
    },
    [pagesById]
  );

  const renderPageNode = useCallback(
    (p: (typeof pages)[number], depth: number) => {
      const kids = childrenByParentId.get(p.id) ?? [];
      const hasChildren = kids.length > 0;
      const isExpanded = expandedIds[p.id] ?? true;
      const paddingLeft = 8 + depth * 14;

      const candidateParents = rootPages
        .filter((x) => x.id !== p.id)
        .filter((x) => !isDescendant(x.id, p.id));

      return (
        <SidebarMenuItem key={p.id}>
          <SidebarMenuButton
            isActive={p.id === currentPageId}
            className="cursor-pointer"
            onClick={() => setCurrentPageId(p.id)}
            tooltip={p.title}
            style={{ paddingLeft }}
          >
            {hasChildren ? (
              <span
                className="mr-1 inline-flex items-center justify-center"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpandedIds((prev) => ({ ...prev, [p.id]: !(prev[p.id] ?? true) }));
                }}
              >
                {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              </span>
            ) : (
              <span className="mr-1 inline-flex size-4" />
            )}

            {p.icon ? <span className="text-lg leading-none">{p.icon}</span> : <FileText />}
            <span>{p.title || "Untitled"}</span>
          </SidebarMenuButton>

          <SidebarMenuAction
            showOnHover
            className="right-7 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              createChildPage(p.id);
              setExpandedIds((prev) => ({ ...prev, [p.id]: true }));
            }}
            aria-label="Add sub-page"
          >
            <Plus />
          </SidebarMenuAction>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction
                showOnHover
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                aria-label="Open page menu"
              >
                <MoreHorizontal />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={4} className="w-56">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  duplicatePage(p.id);
                }}
              >
                <Copy />
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const title = window.prompt("Rename page", p.title || "Untitled");
                  if (title !== null) updatePageTitle(p.id, title);
                }}
              >
                <Pencil />
                <span>Rename</span>
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <ArrowRight className="size-5 text-gray-400 mr-1" />
                  <span>Move to</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-64">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      movePage(p.id, null);
                    }}
                  >
                    <span>Root</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {candidateParents.map((parent) => (
                    <DropdownMenuItem
                      key={parent.id}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        movePage(p.id, parent.id);
                        setExpandedIds((prev) => ({ ...prev, [parent.id]: true }));
                      }}
                    >
                      <span>{parent.title || "Untitled"}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  trashPage(p.id);
                }}
              >
                <Trash />
                <span>Move to Trash</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasChildren && isExpanded ? (
            <SidebarMenuSub>
              {kids.map((child) => (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton
                    href="#"
                    isActive={child.id === currentPageId}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPageId(child.id);
                    }}
                    style={{ paddingLeft: 8 + (depth + 1) * 14 }}
                  >
                    {child.icon ? <span className="text-lg leading-none">{child.icon}</span> : <FileText />}
                    <span>{child.title || "Untitled"}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          ) : null}
        </SidebarMenuItem>
      );
    },
    [childrenByParentId, createChildPage, currentPageId, duplicatePage, expandedIds, isDescendant, movePage, pagesById, rootPages, setCurrentPageId, trashPage, updatePageTitle]
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarContent>
        {/* Header row with brand and persistent trigger */}
        <div className="flex items-center justify-between p-2">
          <div className="my-3 transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 overflow-hidden ml-3">
            <Image src="/logo_notia.png" alt="icon" width={100} height={70} />
          </div>
          <SidebarTrigger className="shrink-0 cursor-pointer" />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="sr-only">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Private</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="cursor-pointer" onClick={() => createPage()} tooltip="New page">
                  <Plus />
                  <span>New page</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {rootPages.map((p) => renderPageNode(p, 0))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
