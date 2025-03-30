
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Mail, Key, User, Shield, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';

type UserProfile = {
  id: string;
  display_name: string;
  email: string;
  role: 'admin' | 'client';
  is_active: boolean;
};

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'client'>('client');
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      
      // Otteniamo i profili utente
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          organizations(is_active)
        `);
        
      if (profilesError) throw profilesError;

      // Otteniamo gli utenti da auth.users (gli admin hanno accesso)
      const { data, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) throw usersError;

      const authUsers = data?.users || [];

      // Combiniamo i dati
      const combinedUsers = profiles?.map(profile => {
        const authUser = authUsers.find(u => u.id === profile.id);
        return {
          id: profile.id,
          display_name: profile.display_name,
          email: authUser?.email || 'N/A',
          role: profile.role,
          is_active: profile.organizations?.is_active !== false // Se non è esplicitamente false, consideriamo l'utente attivo
        };
      }) || [];

      setUsers(combinedUsers);
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: `Impossibile recuperare gli utenti: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword || !newUserName) {
      toast({
        title: 'Dati mancanti',
        description: 'Compila tutti i campi per creare un nuovo utente',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Creare un nuovo utente tramite Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true,
        user_metadata: {
          full_name: newUserName
        }
      });

      if (authError) throw authError;

      // Aggiorniamo il profilo utente con il ruolo corretto
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          role: newUserRole,
          display_name: newUserName
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast({
        title: 'Utente creato',
        description: `L'utente ${newUserEmail} è stato creato con successo.`
      });

      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('client');
      setShowCreateUserDialog(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: `Impossibile creare l'utente: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const toggleUserActive = async (userId: string, isCurrentlyActive: boolean, userName: string) => {
    try {
      // Recupera l'organization_id dell'utente
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      // Aggiorna lo stato dell'organizzazione
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ is_active: !isCurrentlyActive })
        .eq('id', userProfile.organization_id);
        
      if (updateError) throw updateError;

      toast({
        title: 'Stato utente aggiornato',
        description: `L'utente ${userName} è ora ${!isCurrentlyActive ? 'attivo' : 'disattivato'}.`
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: `Impossibile aggiornare lo stato dell'utente: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Accesso negato</h1>
        <p className="mt-2">Non hai i permessi per visualizzare questa pagina.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Gestione Utenti
        </h1>
        <Button onClick={() => setShowCreateUserDialog(true)} className="flex gap-2 items-center">
          <UserPlus className="h-4 w-4" />
          Crea Nuovo Utente
        </Button>
      </div>

      {/* Gestione Utenti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> 
            Utenti del Sistema
          </CardTitle>
          <CardDescription>
            Gestisci gli utenti della piattaforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="text-center py-4">Caricamento utenti...</div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ruolo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        Nessun utente trovato
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.display_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'Cliente'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={user.is_active} 
                              onCheckedChange={() => toggleUserActive(user.id, user.is_active, user.display_name)}
                            />
                            <span className={user.is_active ? "text-green-600" : "text-red-600"}>
                              {user.is_active ? "Attivo" : "Disattivato"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* Qui potresti aggiungere altre azioni se necessario */}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sezione per il cambio password */}
      <ChangePasswordForm />

      {/* Dialog per la creazione di un nuovo utente */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
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
          <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
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
              <Button type="button" variant="outline" onClick={() => setShowCreateUserDialog(false)}>
                Annulla
              </Button>
              <Button type="submit">Crea Utente</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
