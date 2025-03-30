
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading, userProfile, isAdmin } = useAuth();
  const location = useLocation();

  // Se stiamo ancora caricando, mostra un loader
  if (loading) {
    return <LoadingSpinner />;
  }

  // Se l'utente non è autenticato, reindirizza alla pagina di login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se la route richiede privilegi admin e l'utente non è admin, reindirizza
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se l'utente appartiene a un'organizzazione disattivata (verifica tramite context)
  if (userProfile?.organizationDisabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Account Disattivato</h1>
        <p className="text-lg max-w-md text-gray-700 mb-6">
          Il tuo account è stato temporaneamente disattivato dall'amministratore.
          Contatta il supporto per ulteriori informazioni.
        </p>
      </div>
    );
  }

  // Se tutto è ok, mostra il contenuto della route
  return <>{children}</>;
};

export default ProtectedRoute;
