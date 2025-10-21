import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface User {
  id: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'patient' | 'doctor' | 'pharmacist';
}

interface NavigationLink {
  to: string;
  label: string;
  icon: string;
}

interface SidebarContextType {
  user: User | null;
  role: 'admin' | 'patient' | 'doctor' | 'pharmacist';
  getUserName: () => string;
  getUserInitials: () => string;
  navigationLinks: NavigationLink[];
  isLinkActive: (path: string) => boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
  role: 'admin' | 'patient' | 'doctor' | 'pharmacist';
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children, role }) => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Mock user pour l'instant
    const mockUser: User = {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@medalert.com',
      role: role
    };

    setUser(mockUser);
  }, [role]);

  const getUserName = () => {
    if (!user) return 'User';
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email?.split('@')[0] || `User${user.id}`;
  };

  const getUserInitials = () => {
    if (!user) return '?';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user.firstName) {
      return user.firstName[0].toUpperCase();
    } else if (user.lastName) {
      return user.lastName[0].toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || '?';
  };

  const getNavigationLinks = (): NavigationLink[] => {
    const roleSpecificLinks = [
      { to: `/${role}`, label: 'Dashboard', icon: 'Home' }
    ];

    const commonLinks = [
      { to: `/${role}/notifications`, label: 'Notifications', icon: 'Bell' },
      { to: `/${role}/settings`, label: 'Settings', icon: 'Settings' }
    ];

    return [...roleSpecificLinks, ...commonLinks];
  };

  const isLinkActive = (path: string) => location.pathname === path;

  return (
    <SidebarContext.Provider value={{
      user,
      role,
      getUserName,
      getUserInitials,
      navigationLinks: getNavigationLinks(),
      isLinkActive
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};
