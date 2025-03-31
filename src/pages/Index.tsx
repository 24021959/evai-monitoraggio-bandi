
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const Index = () => {
  const { user, userProfile, loading, session } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only proceed with redirection when auth state is fully loaded
    if (loading) return;
    
    console.log('Index page - Auth state loaded:', 
      'User:', user ? 'exists' : 'null',
      'Session:', session ? 'exists' : 'null',
      'Profile:', userProfile ? userProfile.role : 'null'
    );
    
    // Redirect to login if the user is not authenticated
    if (!user || !session) {
      console.log('No authenticated user, redirecting to login');
      navigate('/login');
      return;
    }
    
    // User is authenticated, redirect based on role
    if (userProfile) {
      if (userProfile.role === 'admin') {
        console.log('Admin user detected, redirecting to admin page');
        navigate('/app/admin/gestione', { replace: true });
      } else {
        console.log('Client user detected, redirecting to dashboard');
        navigate('/app/dashboard', { replace: true });
      }
    } else {
      // Profile not loaded yet but user is authenticated, default to dashboard
      console.log('User profile not yet loaded, redirecting to dashboard');
      navigate('/app/dashboard', { replace: true });
    }
    
  }, [user, userProfile, navigate, loading, session]);
  
  // Loading page while redirection occurs
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
