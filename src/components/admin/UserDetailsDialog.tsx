
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useUsers } from '@/hooks/useUsers';

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
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ user, open, onOpenChange }) => {
  const { toast } = useToast();
  const { updateUserProfile } = useUsers();
  
  const [displayName, setDisplayName] = useState(user.display_name);
  const [role, setRole] = useState<'admin' | 'client'>(user.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast({
        title: 'Errore',
        description: 'Il nome utente non può essere vuoto',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const success = await updateUserProfile(user.id, {
      display_name: displayName,
      role: role
    });
    
    setIsSubmitting(false);
    
    if (success) {
      toast({
        title: 'Utente aggiornato',
        description: `I dettagli per ${displayName} sono stati aggiornati con successo.`
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dettagli Utente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={user.email} 
                disabled 
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground">
                L'email non può essere modificata
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="displayName">Nome Utente</Label>
              <Input 
                id="displayName" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Ruolo</Label>
              <Select value={role} onValueChange={(value: 'admin' | 'client') => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un ruolo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Amministratore</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Stato</Label>
              <div className={`px-3 py-2 rounded-md ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user.is_active ? 'Attivo' : 'Disattivato'}
              </div>
              <p className="text-xs text-muted-foreground">
                Lo stato può essere modificato dalla tabella principale
              </p>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
