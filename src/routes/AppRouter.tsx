import { Routes, Route } from 'react-router-dom';
import HomePage from '@/shared/pages/HomePage';
import AuthPage from '@/features/auth/pages/AuthPage';
import NotFoundPage from '@/shared/pages/NotFoundPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
