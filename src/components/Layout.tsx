
import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-background flex items-center px-4 lg:px-6">
          <SidebarTrigger className="mr-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">EasyDevis</h1>
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
