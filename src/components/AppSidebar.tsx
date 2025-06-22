
import { useState } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Users, 
  Package,
  Menu
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";

const items = [
  {
    title: "Tableau de bord",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Mes devis",
    url: "/quotes",
    icon: FileText,
  },
  {
    title: "Créer un devis",
    url: "/create-quote",
    icon: Plus,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Produits/Services",
    url: "/products",
    icon: Package,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm">E</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <h2 className="text-lg font-bold text-sidebar-foreground">EasyDevis</h2>
              <p className="text-xs text-sidebar-foreground/70">Gestion de devis</p>
            </div>
          )}
          {!isCollapsed && (
            <div className="ml-auto">
              <UserMenu />
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
  <SidebarMenuItem key={item.title}>
    <SidebarMenuButton asChild>
      <NavLink
        to={item.url}
        end
        className={getNavCls}
        onClick={() => {
          // Ferme la sidebar mobile après navigation
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            const sidebar = require("@/components/ui/sidebar");
            if (sidebar && sidebar.useSidebar) {
              try {
                sidebar.useSidebar().setOpenMobile(false);
              } catch {}
            }
          }
        }}
      >
        <item.icon className="h-4 w-4" />
        {!isCollapsed && <span>{item.title}</span>}
      </NavLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {isCollapsed && (
        <div className="p-2 border-t border-sidebar-border">
          <UserMenu />
        </div>
      )}
    </Sidebar>
  );
}
