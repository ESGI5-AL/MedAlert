import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Bell, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { useSidebarContext } from '../contexts/SidebarContext';
import logo from '@/assets/images/logo.svg';
const iconMap: Record<string, React.ReactNode> = {
  Home: <Home size={16} />,
  Bell: <Bell size={16} />,
  Settings: <Settings size={16} />,
};
import { useSidebar } from "@/shared/components/ui/sidebar";

export const SidebarComponent: React.FC = () => {
  const {
    user,
    getUserName,
    getUserInitials,
    navigationLinks,
    isLinkActive
  } = useSidebarContext();

  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="border-r bg-[var(--sidebar-primary)]" collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b bg-gray-50/50">
        <div className={`flex items-center py-3 px-4 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <img src={logo} alt="Logo" className="h-8 w-8 flex-shrink-0" />
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-lg">MedAlert</h2>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationLinks.map((link) => (
                <SidebarMenuItem key={link.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isLinkActive(link.to)}
                    tooltip={isCollapsed ? link.label : undefined}
                  >
                    <Link to={link.to} className="flex items-center gap-3">
                      {iconMap[link.icon] || <Home size={16} />}
                      {!isCollapsed && <span>{link.label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter className="border-t bg-gray-50/50">
        {user ? (
          <div className={`flex items-center p-3 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {getUserName()}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className={`flex items-center p-3 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse flex-shrink-0" />
            {!isCollapsed && (
              <div className="flex-1">
                <div className="h-4 bg-muted rounded animate-pulse mb-1" />
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
