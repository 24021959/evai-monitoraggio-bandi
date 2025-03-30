
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Users, 
  GitCompare, 
  FileBarChart, 
  FileSpreadsheet,
  Database
} from 'lucide-react';

const ClientSidebar = () => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 flex-grow">
        <nav className="flex flex-col">          
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </div>
          </NavLink>
          <NavLink
            to="/app/bandi"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : ''}`
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
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              Clienti
            </div>
          </NavLink>
          <NavLink
            to="/app/match"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <GitCompare className="w-5 h-5" />
              Match
            </div>
          </NavLink>
          <NavLink
            to="/app/report"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <FileBarChart className="w-5 h-5" />
              Report
            </div>
          </NavLink>
          <NavLink
            to="/app/fonti"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5" />
              Fonti
            </div>
          </NavLink>
          <div className="border-t border-gray-300 my-5"></div>
          
          <NavLink
            to="/app/importa-bandi"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5" />
              Importa Bandi
            </div>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default ClientSidebar;
