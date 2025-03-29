import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Users, 
  GitCompare, 
  FileBarChart, 
  FileSpreadsheet,
  Database,
  Settings
} from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full bg-white shadow-sm py-4 px-8">
      <div className="container mx-auto flex items-center">
        <img 
          src="/lovable-uploads/3dae21e4-3a8f-4f07-b420-97affba19320.png" 
          alt="EV-AI Technologies Logo" 
          className="h-12"
        />
        <h1 className="ml-4 text-2xl font-semibold text-gray-800">EV-AI Monitoraggio Bandi</h1>
      </div>
    </header>
  );
};

const Sidebar = () => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white flex justify-center items-center p-4">
        <img 
          src="/lovable-uploads/3dae21e4-3a8f-4f07-b420-97affba19320.png" 
          alt="EV-AI Technologies Logo" 
          className="h-16 w-auto"
        />
      </div>
      <div className="bg-gray-100 flex-grow">
        <nav className="flex flex-col">          
          <NavLink
            to="/"
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
            to="/bandi"
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
            to="/clienti"
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
            to="/match"
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
            to="/report"
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
            to="/fonti"
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
            to="/importa-bandi"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5" />
              Importa Bandi
            </div>
          </NavLink>
          
          <div className="mt-auto"></div>
          
          <NavLink
            to="/admin"
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

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isHomePage && <Header />}
      
      <div className="flex min-h-[calc(100vh-80px)]">
        <div className="w-1/5">
          <Sidebar />
        </div>
        <div className="w-4/5 p-8 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
