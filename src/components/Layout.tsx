
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from './layout/Header';
import ClientSidebar from './layout/ClientSidebar';
import AdminSidebar from './layout/AdminSidebar';
import DisabledAccountMessage from './layout/DisabledAccountMessage';

const Layout = () => {
  const { userProfile, isAdmin } = useAuth();

  // Se l'organizzazione dell'utente è disattivata, non mostrare il layout regolare
  if (userProfile?.organizationDisabled) {
    return <DisabledAccountMessage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <div className="w-1/5">
          {isAdmin ? <AdminSidebar /> : <ClientSidebar />}
        </div>
        <div className="w-4/5 p-8 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
