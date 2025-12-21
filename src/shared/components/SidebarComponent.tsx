import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Pill, Bell, Settings, LogOut, FileText, AlertTriangle, ClipboardList, Users, PlusCircle } from 'lucide-react';
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
import { Button } from "@/shared/components/ui/button";
import { useSidebarContext } from '../contexts/SidebarContext';
import { useWeb3 } from '@/contexts/Web3Context';
import logo from '@/assets/images/logo.svg';
import { useSidebar } from "@/shared/components/ui/sidebar";

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home size={16} />,
  Bell: <Bell size={16} />,
  Pill: <Pill size={16} />,
  Settings: <Settings size={16} />,
  FileText: <FileText size={16} />,
  AlertTriangle: <AlertTriangle size={16} />,
  ClipboardList: <ClipboardList size={16} />,
  Users: <Users size={16} />,
  PlusCircle: <PlusCircle size={16} />,
};

export const SidebarComponent: React.FC = () => {
  const navigate = useNavigate();
  const { disconnectWallet, account } = useWeb3();
  const {
    user,
    getUserName,
    getUserInitials,
    navigationLinks,
    isLinkActive
  } = useSidebarContext();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleDisconnect = () => {
    disconnectWallet();
    navigate('/login');
  };

  return (
    <Sidebar className="border-r bg-[var(--sidebar-primary)]" collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b bg-gray-50/50">
        <div className={`flex items-center ${isCollapsed ? 'py-4 px-1 justify-center' : 'py-3 px-4 gap-3'}`}>
          <img
            src={logo}
            alt="Logo"
            className="h-8 w-8 flex-shrink-0"
          />
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
              {navigationLinks.filter(link => link.isClickable).map((link) => (
                <SidebarMenuItem key={link.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isLinkActive(link.to!)}
                    tooltip={isCollapsed ? link.label : undefined}
                  >
                    <Link to={link.to!} className="flex items-center gap-3">
                      {iconMap[link.icon] || <Home size={16} />}
                      {!isCollapsed && <span>{link.label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {navigationLinks.some(link => !link.isClickable) && (
                <div className="my-2 border-t border-sidebar-border" />
              )}

              {navigationLinks.filter(link => !link.isClickable).map((link, index) => (
                <SidebarMenuItem key={`non-clickable-${index}`}>
                  <SidebarMenuButton
                    tooltip={isCollapsed ? link.label : undefined}
                    className="cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      {iconMap[link.icon] || <Home size={16} />}
                      <span>{link.label}</span>
                    </div>
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
          <div className={`space-y-2 ${isCollapsed ? 'p-2' : 'p-3'}`}>
            {/* User Info */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
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
                  {account && (
                    <p className="text-xs text-muted-foreground truncate font-mono">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Disconnect Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className={`w-full ${isCollapsed ? 'aspect-square p-0' : 'justify-start'}`}
              title={isCollapsed ? "Se Déconnecter" : undefined}
            >
              <LogOut size={16} className={!isCollapsed ? 'mr-2' : ''} />
              {!isCollapsed && <span>Se Déconnecter</span>}
            </Button>
          </div>
        ) : (
          <div className={`flex items-center ${isCollapsed ? 'p-2 justify-center' : 'p-3 gap-3'}`}>
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
