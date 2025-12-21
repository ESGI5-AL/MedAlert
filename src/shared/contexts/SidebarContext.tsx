import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useWeb3 } from '@/contexts/Web3Context';

import seedData from '../../../seedData.json';

interface User {
  id: string;
  name: string;
  address: string;
  role: 'admin' | 'patient' | 'doctor' | 'pharmacist';
}

interface NavigationLink {
  to?: string;
  label: string;
  icon: string;
  isClickable?: boolean;
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
  const { account, role: web3Role } = useWeb3();

  useEffect(() => {
    if (!account) {
      setUser(null);
      return;
    }

    let userData: User | null = null;
    const address = account.toLowerCase();

    if (seedData.contractOwner?.toLowerCase() === address) {
      userData = {
        id: account,
        name: 'Contract Owner',
        address: account,
        role: 'admin'
      };
    }
    else if (seedData.doctors) {
      const doctor = seedData.doctors.find(
        d => d.address?.toLowerCase() === address
      );
      if (doctor) {
        userData = {
          id: account,
          name: doctor.name || 'Doctor',
          address: account,
          role: 'doctor'
        };
      }
    }

    if (!userData && seedData.pharmacies) {
      const pharmacy = seedData.pharmacies.find(
        p => p.address?.toLowerCase() === address
      );
      if (pharmacy) {
        userData = {
          id: account,
          name: pharmacy.name || 'Pharmacy',
          address: account,
          role: 'pharmacist'
        };
      }
    }

    if (!userData && seedData.testPatients) {
      const patient = seedData.testPatients.find(
        p => p.address?.toLowerCase() === address
      );
      if (patient) {
        userData = {
          id: account,
          name: patient.name || 'Patient',
          address: account,
          role: 'patient'
        };
      }
    }

    if (!userData) {
      userData = {
        id: account,
        name: `Patient ${account.slice(0, 6)}`,
        address: account,
        role: 'patient'
      };
    }

    setUser(userData);
  }, [account, web3Role]);

  const getUserName = () => {
    if (!user) return 'User';
    return user.name;
  };

  const getUserInitials = () => {
    if (!user || !user.name) return '?';

    const nameParts = user.name.trim().split(' ');

    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
      return nameParts[0].slice(0, 2).toUpperCase();
    }

    return '?';
  };

  const getNavigationLinks = (): NavigationLink[] => {
    const roleSpecificLinks = [
      { to: `/${role}`, label: 'Dashboard', icon: 'Home', isClickable: true }
    ];

    if (role === 'pharmacist') {
      roleSpecificLinks.push(
        { to: '/pharmacy/sales', label: 'Délivrances', icon: 'Pill', isClickable: true },
        { to: '/pharmacy/alerts', label: 'Alertes', icon: 'TriangleAlert', isClickable: true }
      );
    }

    const commonLinks: NavigationLink[] = [
    { label: 'Notifications', icon: 'Bell', isClickable: false },
    { label: 'Paramètres', icon: 'Settings', isClickable: false }
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
