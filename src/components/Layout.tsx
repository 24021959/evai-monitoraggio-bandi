
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from './layout/Header';
import ClientSidebar from './layout/ClientSidebar';
import DisabledAccountMessage from './layout/DisabledAccountMessage';

const Layout = () => {
  const { userProfile, isAdmin } = useAuth();
  const location = useLocation();
  
  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/app/admin');

  // Se l'organizzazione dell'utente è disattivata, non mostrare il layout regolare
  if (userProfile?.organizationDisabled) {
    return <DisabledAccountMessage />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        {/* Only show sidebar for non-admin pages */}
        {!isAdminRoute && !isAdmin && (
          <div className="w-1/5">
            <ClientSidebar />
          </div>
        )}
        
        {/* Adjust width based on whether sidebar is shown */}
        <div className={`${isAdminRoute || isAdmin ? 'w-full' : 'w-4/5'} p-8 overflow-auto bg-white`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
