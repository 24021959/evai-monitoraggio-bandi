
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Reindirizza alla pagina di login se l'utente non è autenticato
    if (!user) {
      navigate('/login');
    } else {
      // Altrimenti reindirizza alla dashboard
      navigate('/app/dashboard');
    }
  }, [user, navigate]);
  
  // Pagina di caricamento mentre si effettua il reindirizzamento
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Reindirizzamento in corso...</p>
      </div>
    </div>
  );
};

export default Index;
