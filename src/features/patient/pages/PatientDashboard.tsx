import { SidebarLayout } from '@/shared/layouts/Sidebar';
import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';

const PatientDashboard: React.FC = () => {
  const { account } = useWeb3();

  return (
    <SidebarLayout
      role="patient"
      breadcrumbs={[
        { label: 'Dashboard', href: '/patient' },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bienvenue sur le tableau de bord du patient</h2>
          <p className="text-muted-foreground">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default PatientDashboard;
