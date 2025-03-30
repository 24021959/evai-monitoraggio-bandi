
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Users, Settings, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import ChangePasswordForm from '../admin/ChangePasswordForm';

const AdminSidebar = () => {
  const location = useLocation();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 flex-grow">
        <nav className="flex flex-col">          
          <NavLink
            to="/app/admin/gestione"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
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
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-500 text-white' : 'text-black'}`
            }
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              Configurazioni
            </div>
          </NavLink>
          
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <button 
                className="p-5 text-black hover:bg-blue-50 w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5" />
                  Cambia Password
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Cambia Password</DialogTitle>
              </DialogHeader>
              <ChangePasswordForm onComplete={() => setIsPasswordDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
