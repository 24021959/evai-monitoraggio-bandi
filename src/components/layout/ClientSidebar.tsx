
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Users, Database, LineChart, FileText, Settings, Upload } from 'lucide-react';

const ClientSidebar = () => {
  const { isAdmin } = useAuth();
  
  // Se l'utente è admin, non mostrare la sidebar client
  if (isAdmin) {
    return null;
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 flex-grow">
        <nav className="flex flex-col">
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5" />
              Dashboard
            </div>
          </NavLink>
          
          <NavLink
            to="/app/clienti"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              Clienti
            </div>
          </NavLink>
          
          <NavLink
            to="/app/fonti"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5" />
              Fonti
            </div>
          </NavLink>
          
          <NavLink
            to="/app/match"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <LineChart className="w-5 h-5" />
              Match
            </div>
          </NavLink>
          
          <NavLink
            to="/app/bandi"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              Bandi
            </div>
          </NavLink>
          
          <NavLink
            to="/app/report"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              Report
            </div>
          </NavLink>
          
          <div className="p-2 text-gray-500 text-xs font-semibold uppercase pl-5 pt-8 pb-2">
            Strumenti
          </div>
          
          <NavLink
            to="/app/strumenti/importa-bandi"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5" />
              Importa Bandi
            </div>
          </NavLink>
          
          <NavLink
            to="/app/strumenti/bandi-importati"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              Bandi Importati
            </div>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default ClientSidebar;
