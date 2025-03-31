
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  // Se stiamo ancora caricando, mostra un loader
  if (loading) {
    return <LoadingSpinner />;
  }

  // Se l'utente non è autenticato, reindirizza alla pagina di login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se l'utente non è admin, reindirizza alla dashboard
  if (!isAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Se l'utente è admin, mostra il contenuto protetto
  return <>{children}</>;
};

export default AdminProtectedRoute;
