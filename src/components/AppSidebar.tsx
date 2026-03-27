import { LayoutDashboard, FileText, Plus, Users, Package, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";

const items = [
  { title: "Tableau de bord", url: "/",             icon: LayoutDashboard },
  { title: "Mes devis",       url: "/quotes",        icon: FileText },
  { title: "Créer un devis",  url: "/create-quote",  icon: Plus },
  { title: "Clients",         url: "/clients",       icon: Users },
  { title: "Produits/Services", url: "/products",    icon: Package },
  { title: "Paramètres",      url: "/settings",      icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-gray-100 bg-white" collapsible="icon">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-14 border-b border-gray-100 ${isCollapsed ? "justify-center px-2" : ""}`}>
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900">EasyDevis</p>
              <p className="text-[10px] text-gray-400">Gestion de devis</p>
            </div>
            <UserMenu />
          </>
        )}
      </div>

      <SidebarContent className="py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                          isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
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
        <div className="p-2 border-t border-gray-100 flex justify-center">
          <UserMenu />
        </div>
      )}
    </Sidebar>
  );
}
