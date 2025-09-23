import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/user/login?type=admin');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-8 w-8" />
                <div className="relative w-96 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search properties, bookings, tenants..." 
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}