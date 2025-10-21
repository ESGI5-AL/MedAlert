import { SidebarLayout } from '@/shared/layouts/Sidebar';
import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <SidebarLayout
      role="admin"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome to Admin Dashboard</h2>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AdminDashboard;
