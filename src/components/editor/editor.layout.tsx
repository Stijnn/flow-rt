import { Outlet, useNavigate } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../ui/sidebar";
import { Separator } from "../ui/separator";

import * as React from "react";
import {
  CableIcon,
  ChevronDown,
  ChevronUp,
  CodeSquareIcon,
  User2,
} from "lucide-react";

import { useCurrentProject } from "../projects/current-project.provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function AppSidebarHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              @sidebar.header-menu
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--sidebar-dropdown-popover-width)">
            <DropdownMenuItem>
              <span>@sidebar.header-menu.item</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>@sidebar.header-menu.item</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function AppSidebarFooter() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              <User2 /> @sidebar.footer-menu
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-(--sidebar-dropdown-popover-width)"
          >
            <DropdownMenuItem>
              <span>@sidebar.footer-menu.item</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>@sidebar.footer-menu.item</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>@sidebar.footer-menu.item</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { project } = useCurrentProject();
  const nav = useNavigate();

  return (
    <Sidebar variant="inset" className="top-8 pb-16 border-none" {...props}>
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => nav(`/editor/scripts`)}>
                  <CodeSquareIcon />
                  Scripts
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => nav(`/editor/graphs`)}>
                  <CableIcon />
                  Graphs
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Graphs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {project.graphs?.map((graphs) => {
                return (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => nav(`/editor/graphs/${graphs.name}`)}
                    >
                      {graphs.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarFooter />
      </SidebarFooter>
    </Sidebar>
  );
}

export const EditorLayout = () => {
  return (
    <SidebarProvider className="items-start">
      <AppSidebar />
      <SidebarInset className="h-[calc(100%-5.1rem)] overflow-y-hidden">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
        </header>
        <div className="flex-1 min-h-0 flex flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
