import { Routes, Route } from 'react-router-dom';
import HomePage from '@/shared/pages/HomePage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

export default AppRoutes;
