
import React from 'react';
import { NavLink, Outlet, useLocation, Link, Navigate } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Users, 
  GitCompare, 
  FileBarChart, 
  FileSpreadsheet,
  Database,
  Settings,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, userProfile, signOut, isAdmin } = useAuth();

  return (
    <header className="w-full bg-white shadow-sm py-4 px-8">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/app/dashboard" className="flex items-center cursor-pointer">
            <img 
              src="/lovable-uploads/3dae21e4-3a8f-4f07-b420-97affba19320.png" 
              alt="EV-AI Technologies Logo" 
              className="h-12"
            />
            <h1 className="ml-4 text-2xl font-semibold text-gray-800">EV-AI Monitoraggio Bandi</h1>
          </Link>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {userProfile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="hidden md:inline">{userProfile?.display_name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/app/admin/gestione" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="w-4 h-4" />
                      <span>Gestione Admin</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 cursor-pointer text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span>Disconnetti</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  
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
          
          <div className="mt-auto"></div>
          
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
          
          {isAdmin && (
            <NavLink
              to="/app/admin/gestione"
              className={({ isActive }) =>
                `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : ''}`
              }
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" />
                Gestione Admin
              </div>
            </NavLink>
          )}
        </nav>
      </div>
    </div>
  );
};

const Layout = () => {
  const { userProfile } = useAuth();

  // Se l'organizzazione dell'utente è disattivata, non mostrare il layout regolare
  if (userProfile?.organizationDisabled) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Account Disattivato</h1>
        <p className="text-lg max-w-md text-gray-700 mb-6">
          Il tuo account è stato temporaneamente disattivato dall'amministratore.
          Contatta il supporto per ulteriori informazioni.
        </p>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => window.location.href = '/login'}
        >
          <LogOut className="h-4 w-4" />
          Torna alla pagina di login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
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
