"use client";

import { Home, Inbox, Search, Settings, Users, Plus, FileText } from "lucide-react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarRail,
  SidebarGroupAction,
} from "@/components/ui/sidebar";
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
  const { pages, currentPageId, setCurrentPageId, createPage } = usePages();

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="my-5">
            <Image src="/icon-notia.png" alt="icon" width={100} height={70} />
          </SidebarGroupLabel>
          <SidebarGroupAction>
            <SidebarTrigger />
          </SidebarGroupAction>
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
                <SidebarMenuButton onClick={() => createPage()} tooltip="New page">
                  <Plus />
                  <span>New page</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {pages.map((p) => (
                <SidebarMenuItem key={p.id}>
                  <SidebarMenuButton
                    isActive={p.id === currentPageId}
                    onClick={() => setCurrentPageId(p.id)}
                    tooltip={p.title}
                  >
                    {p.icon ? <span className="text-lg leading-none">{p.icon}</span> : <FileText />}
                    <span>{p.title || "Untitled"}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
