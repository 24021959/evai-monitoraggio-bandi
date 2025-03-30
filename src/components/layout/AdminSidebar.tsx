
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Users, Settings } from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 flex-grow">
        <nav className="flex flex-col">          
          <NavLink
            to="/app/admin/gestione"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              Gestione Utenti
            </div>
          </NavLink>
          
          <NavLink
            to="/app/admin"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              Configurazioni
            </div>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
