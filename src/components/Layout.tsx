
import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from './layout/Header';
import ClientSidebar from './layout/ClientSidebar';
import DisabledAccountMessage from './layout/DisabledAccountMessage';
import AdminSidebar from './layout/AdminSidebar';

const Layout = () => {
  const { userProfile, isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/app/admin');
  
  // Redirect admin user to admin page when they try to access client pages
  useEffect(() => {
    if (!loading && isAdmin && !isAdminRoute) {
      console.log('Admin user trying to access client route, redirecting to admin page');
      navigate('/app/admin/gestione', { replace: true });
    }
    
    // Redirect client user trying to access admin pages
    if (!loading && !isAdmin && isAdminRoute) {
      console.log('Client user trying to access admin route, redirecting to dashboard');
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAdmin, isAdminRoute, navigate, loading]);

  // Se l'organizzazione dell'utente è disattivata, non mostrare il layout regolare
  if (userProfile?.organizationDisabled) {
    return <DisabledAccountMessage />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        {/* Mostra la sidebar admin per le pagine admin */}
        {isAdminRoute && isAdmin && (
          <div className="w-1/5">
            <AdminSidebar />
          </div>
        )}
        
        {/* Mostra la sidebar client per le pagine client */}
        {!isAdminRoute && !isAdmin && (
          <div className="w-1/5">
            <ClientSidebar />
          </div>
        )}
        
        {/* Aggiustare la larghezza in base a se viene mostrata la sidebar */}
        <div className={`${isAdminRoute || isAdmin ? 'w-full' : 'w-4/5'} p-8 overflow-auto bg-white`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
