
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated?: (userData: any) => void;
  createUser: (email: string, password: string, name: string, role: 'admin' | 'client') => Promise<boolean>;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onOpenChange,
  onUserCreated,
  createUser
}) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'client'>('client');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password) {
      setError("Tutti i campi sono obbligatori");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Inserisci un indirizzo email valido");
      return;
    }
    
    // Password length validation
    if (password.length < 6) {
      setError("La password deve contenere almeno 6 caratteri");
      return;
    }
    
    setIsCreating(true);
    setError('');
    
    try {
      const success = await createUser(email, password, name, role);
      
      if (success) {
        if (onUserCreated) onUserCreated({ email, name, role });
        
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setRole('client');
      } else {
        setError("Impossibile creare l'utente. Riprova.");
      }
    } catch (error: any) {
      console.error("Errore nella creazione dell'utente:", error);
      setError(error.message || "Si è verificato un errore");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDialogChange = (openState: boolean) => {
    if (!openState) {
      // Reset form when closing
      setName('');
      setEmail('');
      setPassword('');
      setRole('client');
      setError('');
    }
    onOpenChange(openState);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crea nuovo utente</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli per creare un nuovo account utente.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Ruolo
              </Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as 'admin' | 'client')}
                className="col-span-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client">Cliente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Amministratore</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creazione...' : 'Crea Utente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
