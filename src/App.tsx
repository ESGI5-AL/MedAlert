import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRouter';
import { Toaster } from 'sonner';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </Router>
  );
};

export default App;
