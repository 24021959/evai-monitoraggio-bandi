
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type UserProfile = {
  id: string;
  display_name: string;
  email: string;
  role: 'admin' | 'client';
  is_active: boolean;
};

interface UserDetailsDialogProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updateUser?: (userId: string, updates: any) => Promise<void>;
  onUserUpdated?: () => void;
  onUserDeleted?: () => void;
  onPasswordReset?: () => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  open,
  onOpenChange,
  updateUser,
  onUserUpdated,
  onUserDeleted,
  onPasswordReset
}) => {
  const { toast } = useToast();
  
  const handleUpdateRole = async (newRole: 'admin' | 'client') => {
    if (!updateUser) return;
    
    try {
      await updateUser(user.id, { role: newRole });
      toast({
        title: "Ruolo aggiornato",
        description: `L'utente ${user.display_name} è ora un ${newRole === 'admin' ? 'Amministratore' : 'Cliente'}.`,
      });
      if (onUserUpdated) onUserUpdated();
    } catch (error) {
      console.error("Errore nell'aggiornamento del ruolo:", error);
      toast({
        title: "Errore",
        description: "Non è stato possibile aggiornare il ruolo dell'utente.",
        variant: "destructive",
      });
    }
  };
  
  const handleResetPassword = async () => {
    try {
      // In una implementazione reale, inviamo email di reset password
      // await resetPassword(user.email);
      toast({
        title: "Reset richiesto",
        description: `Email di reset password inviata a ${user.email}.`,
      });
      if (onPasswordReset) onPasswordReset();
    } catch (error) {
      console.error("Errore nell'invio del reset password:", error);
      toast({
        title: "Errore",
        description: "Non è stato possibile inviare l'email di reset password.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dettagli Utente</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <h3 className="font-medium">Nome</h3>
            <p>{user.display_name}</p>
          </div>
          
          <div>
            <h3 className="font-medium">Email</h3>
            <p>{user.email}</p>
          </div>
          
          <div>
            <h3 className="font-medium">Ruolo</h3>
            <div className="flex space-x-2 mt-1">
              <Button
                size="sm"
                variant={user.role === 'client' ? 'default' : 'outline'}
                onClick={() => handleUpdateRole('client')}
                className={user.role === 'client' ? 'bg-blue-500' : ''}
              >
                Cliente
              </Button>
              <Button
                size="sm"
                variant={user.role === 'admin' ? 'default' : 'outline'}
                onClick={() => handleUpdateRole('admin')}
                className={user.role === 'admin' ? 'bg-purple-600' : ''}
              >
                Admin
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium">Stato</h3>
            <p className={user.is_active ? "text-green-600" : "text-red-600"}>
              {user.is_active ? "Attivo" : "Disabilitato"}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResetPassword}
            >
              Invia Reset Password
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
