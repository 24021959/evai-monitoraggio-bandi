
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, BarChart2, FileText, Database, Settings, Search, ArrowUpDown, Wrench, Lock } from 'lucide-react';

const ClientSidebar = () => {
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
              <BarChart2 className="w-5 h-5" />
              Dashboard
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
              <ArrowUpDown className="w-5 h-5" />
              Match
            </div>
          </NavLink>
          
          <NavLink
            to="/app/report"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <BarChart2 className="w-5 h-5" />
              Report
            </div>
          </NavLink>
          
          <div className="pt-4 pb-2 px-5 text-sm font-medium text-gray-500">
            Configurazioni
          </div>
          
          <NavLink
            to="/app/configurazioni/scraping"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              Config. Scraping
            </div>
          </NavLink>
          
          <NavLink
            to="/app/configurazioni/notifiche"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              Config. Notifiche
            </div>
          </NavLink>
          
          <div className="pt-4 pb-2 px-5 text-sm font-medium text-gray-500">
            Strumenti
          </div>
          
          <NavLink
            to="/app/strumenti/importa-bandi"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5" />
              Importa Bandi
            </div>
          </NavLink>
          
          <NavLink
            to="/app/strumenti/risultati-scraping"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5" />
              Risultati Scraping
            </div>
          </NavLink>
          
          {/* Change Password option added at the bottom */}
          <div className="mt-auto"></div>
          <NavLink
            to="/app/change-password"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5" />
              Cambia Password
            </div>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default ClientSidebar;
