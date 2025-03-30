
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Key, User, UserPlus } from 'lucide-react';

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateUser: (e: React.FormEvent) => Promise<void>;
  newUserEmail: string;
  setNewUserEmail: (email: string) => void;
  newUserPassword: string;
  setNewUserPassword: (password: string) => void;
  newUserName: string;
  setNewUserName: (name: string) => void;
  newUserRole: 'admin' | 'client';
  setNewUserRole: (role: 'admin' | 'client') => void;
};

const CreateUserDialog = ({
  open,
  onOpenChange,
  onCreateUser,
  newUserEmail,
  setNewUserEmail,
  newUserPassword,
  setNewUserPassword,
  newUserName,
  setNewUserName,
  newUserRole,
  setNewUserRole
}: CreateUserDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Crea Nuovo Utente
          </DialogTitle>
          <DialogDescription>
            Inserisci i dettagli per creare un nuovo account utente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onCreateUser} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="new-user-name">Nome Completo</Label>
            <div className="flex">
              <User className="h-4 w-4 mr-2 mt-3 text-gray-500" />
              <Input
                id="new-user-name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Mario Rossi"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-user-email">Email</Label>
            <div className="flex">
              <Mail className="h-4 w-4 mr-2 mt-3 text-gray-500" />
              <Input
                id="new-user-email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="mario.rossi@example.com"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-user-password">Password</Label>
            <div className="flex">
              <Key className="h-4 w-4 mr-2 mt-3 text-gray-500" />
              <Input
                id="new-user-password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Password sicura"
                minLength={8}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-user-role">Ruolo</Label>
            <select
              id="new-user-role"
              className="w-full border border-gray-300 rounded-md p-2"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'client')}
              required
            >
              <option value="client">Cliente</option>
              <option value="admin">Amministratore</option>
            </select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">Crea Utente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
