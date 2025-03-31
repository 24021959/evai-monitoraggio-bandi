
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const Index = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (loading) return;
    
    // Reindirizza alla pagina di login se l'utente non è autenticato
    if (!user) {
      navigate('/login');
    } else {
      // Reindirizza direttamente alla pagina di gestione admin se l'utente è admin
      if (userProfile?.role === 'admin') {
        navigate('/app/admin');
      } else {
        navigate('/app/dashboard');
      }
    }
  }, [user, userProfile, navigate, loading]);
  
  // Pagina di caricamento mentre si effettua il reindirizzamento
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Reindirizzamento in corso...</p>
      </div>
    </div>
  );
};

export default Index;
