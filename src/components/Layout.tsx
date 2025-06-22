
import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

function LogoutButton() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Se déconnecter"
      onClick={handleLogout}
      className="ml-2"
      title="Se déconnecter"
    >
      <LogOut className="w-5 h-5" />
    </Button>
  );
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-background flex items-center px-4 lg:px-6">
          <SidebarTrigger className="mr-4" />
          <div className="flex-1 flex items-center">
            <img src="/samadevis-favicon.png" alt="Logo Samadevis" className="w-8 h-8 mr-2 rounded" />
            <h1 className="text-xl font-semibold">EasyDevis</h1>
          </div>
          <div className="flex items-center">
            <LogoutButton />
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
