
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

const ClientSidebar = () => {
  const location = useLocation();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
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
              <Users className="w-5 h-5" />
              Dashboard
            </div>
          </NavLink>
          
          <NavLink
            to="/app/change-password"
            end
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
