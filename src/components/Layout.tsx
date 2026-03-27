import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const { pathname } = useLocation();
  const isCreateQuote = pathname === "/create-quote";

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* Sidebar desktop */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      <main className={`flex-1 flex flex-col min-w-0 ${isCreateQuote ? "" : "pb-20"} md:pb-0`}>
        {/* Header */}
        <header className="h-14 border-b border-gray-100 bg-white flex items-center px-4 gap-3 sticky top-0 z-30">
          {/* Trigger sidebar desktop */}
          <div className="hidden md:block">
            <SidebarTrigger className="text-gray-400 hover:text-gray-700" />
          </div>
          {/* Logo mobile */}
          <div className="flex items-center gap-2 md:hidden flex-1">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">EasyDevis</span>
          </div>
          {/* UserMenu mobile */}
          <div className="md:hidden">
            <UserMenu />
          </div>
          {title && (
            <span className="hidden md:block text-sm font-medium text-gray-500">{title}</span>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </div>
      </main>

      {/* Bottom nav mobile */}
      <BottomNav />
    </div>
  );
}
