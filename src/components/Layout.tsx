
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Users, 
  GitCompare, 
  FileBarChart, 
  FileSpreadsheet
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  const handleImportaGoogleSheetsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/importa-scraping');
    toast({
      title: "Importa da Google Sheets",
      description: "Sei stato reindirizzato alla pagina di importazione da Google Sheets",
      duration: 3000,
    });
  };

  // Function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Special check for importa-scraping page
  const isImportActive = location.pathname === '/importa-scraping';

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 text-white p-5 text-xl font-medium">
        Sistema Monitoraggio Bandi
      </div>
      <div className="bg-gray-100 flex-grow">
        <nav className="flex flex-col">
          <NavLink
            to="#"
            className={`p-5 mb-2 hover:bg-blue-50 ${isImportActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`}
            onClick={handleImportaGoogleSheetsClick}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5" />
              Importa da Google Sheets
            </div>
          </NavLink>
          
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
          <div className="border-t border-gray-300 my-5"></div>
        </nav>
      </div>
    </div>
  );
};

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/5 h-full">
        <Sidebar />
      </div>
      <div className="w-4/5 p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
