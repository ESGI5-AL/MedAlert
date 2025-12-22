import { Routes, Route } from 'react-router-dom';
import HomePage from '@/shared/pages/HomePage';
import AuthPage from '@/features/auth/pages/AuthPage';
import NotFoundPage from '@/shared/pages/NotFoundPage';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import { Web3Provider } from '@/contexts/Web3Context';
import DoctorDashboard from '@/features/doctor/pages/DoctorDashboard';
import PharmacyDashboard from '@/features/pharmacy/pages/PharmacyDashboard';
import PatientDashboard from '@/features/patient/pages/PatientDashboard';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import SalesPage from '@/features/pharmacy/pages/SalesPage';
import AlertsPage from '@/features/pharmacy/pages/AlertPage';
import MedicalPassportPage from '@/features/patient/pages/MedicalPassportPage';
import ProfilPage from '@/features/profil/pages/profilPage';

function AppRoutes() {
  return (
    <Web3Provider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacist"
          element={
            <ProtectedRoute allowedRoles={['PHARMACY']}>
              <PharmacyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/sales"
          element={
            <ProtectedRoute allowedRoles={['PHARMACY']}>
              <SalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/alerts"
          element={
            <ProtectedRoute allowedRoles={['PHARMACY']}>
              <AlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/passport"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <MedicalPassportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'PHARMACY', 'ADMIN']}>
              <ProfilPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Web3Provider>
  );
}

export default AppRoutes;
