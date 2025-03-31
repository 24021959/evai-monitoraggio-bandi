
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Lock } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';

const Header = () => {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on an admin page
  const isAdminRoute = location.pathname.startsWith('/app/admin');

  return (
    <header className="w-full bg-white shadow-sm py-4 px-8">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to={isAdmin ? "/app/admin" : "/app/dashboard"} className="flex items-center cursor-pointer">
            <img 
              src="/lovable-uploads/3dae21e4-3a8f-4f07-b420-97affba19320.png" 
              alt="EV-AI Technologies Logo" 
              className="h-12"
            />
            <h1 className="ml-4 text-2xl font-semibold text-gray-800">
              {isAdmin ? "EV-AI Admin Console" : "EV-AI Monitoraggio Bandi"}
            </h1>
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
                <DropdownMenuItem 
                  onClick={() => setIsPasswordDialogOpen(true)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Cambia Password</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2 cursor-pointer text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span>Disconnetti</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambia Password</DialogTitle>
          </DialogHeader>
          <ChangePasswordForm onComplete={() => setIsPasswordDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
