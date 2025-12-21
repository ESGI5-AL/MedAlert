import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWeb3 } from '../../../contexts/Web3Context';

type Role = 'ADMIN' | 'DOCTOR' | 'PHARMACY' | 'PATIENT';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { account, role } = useWeb3();

  if (!account || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role as Role)) {
    switch (role) {
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'DOCTOR':
        return <Navigate to="/doctor" replace />;
      case 'PHARMACY':
        return <Navigate to="/pharmacist" replace />;
      case 'PATIENT':
        return <Navigate to="/patient" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};
