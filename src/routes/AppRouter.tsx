import { Routes, Route } from 'react-router-dom';
import HomePage from '@/shared/pages/HomePage';
import AuthPage from '@/features/auth/pages/AuthPage';
import NotFoundPage from '@/shared/pages/NotFoundPage';
import AdminDashboard from '@/features/auth/pages/admin/pages/AdminDashboard';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage />} />

      <Route path="/admin" element={<AdminDashboard />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
