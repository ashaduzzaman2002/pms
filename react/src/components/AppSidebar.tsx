import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  Calendar, 
  Users, 
  UserCheck, 
  FileText,
  Settings,
  Home,
  Wrench,
  Sparkles
} from "lucide-react";
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

const navigationItems = [
  { title: "Dashboard", url: "/admin/", icon: LayoutDashboard },
  { title: "Properties", url: "/admin/properties", icon: Building2 },
  { title: "Bookings", url: "/admin/bookings", icon: Calendar },
  { title: "Tenants", url: "/admin/tenants", icon: Users },
  { title: "Owners", url: "/admin/owners", icon: UserCheck },
  { title: "Housekeeping", url: "/admin/housekeeping", icon: Sparkles },
  { title: "Maintenance", url: "/admin/maintenance", icon: Wrench },
  { title: "Reports", url: "/admin/reports", icon: FileText },
];

const quickActions = [
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground hover:bg-primary-hover shadow-md" 
      : "hover:bg-accent/10 text-foreground";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-gradient-sidebar shadow-sidebar">
      <SidebarContent className="bg-gradient-sidebar">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Home className="w-4 h-4 text-primary-foreground" />
            </div>
            {state === "expanded" && (
              <div>
                <h2 className="text-lg font-bold text-sidebar-foreground">
                  PropertyHub
                </h2>
                <p className="text-xs text-sidebar-muted-foreground">Management System</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted-foreground">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={getNavCls}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted-foreground">Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
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