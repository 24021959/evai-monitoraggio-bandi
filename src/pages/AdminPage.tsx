
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
import { PlusCircle, Trash2, Users, Shield, UserPlus, Mail, Key } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type Organization = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  userCount?: number;
};

type UserProfile = {
  id: string;
  display_name: string;
  email: string;
  role: 'admin' | 'client';
  organization_id: string;
};

const AdminPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserOrg, setNewUserOrg] = useState('');
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
    fetchUsers();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

      if (error) throw error;

      setOrganizations(data || []);
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: `Impossibile recuperare le organizzazioni: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoadingOrgs(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      
      // Otteniamo prima i profili utente
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');
        
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
          organization_id: profile.organization_id
        };
      }) || [];

      setUsers(combinedUsers);

      // Aggiorna le organizzazioni con il conteggio degli utenti
      if (combinedUsers && organizations.length > 0) {
        const orgWithCounts = organizations.map(org => ({
          ...org,
          userCount: combinedUsers.filter(u => u.organization_id === org.id).length
        }));
        setOrganizations(orgWithCounts);
      }
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

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{ name: newOrgName.trim() }])
        .select();

      if (error) throw error;

      toast({
        title: 'Organizzazione creata',
        description: `L'organizzazione ${newOrgName} è stata creata con successo.`
      });

      setNewOrgName('');
      fetchOrganizations();
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: `Impossibile creare l'organizzazione: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteOrg = async (id: string, name: string) => {
    try {
      // Controlla se ci sono utenti associati
      const orgUsers = users.filter(u => u.organization_id === id);
      if (orgUsers.length > 0) {
        toast({
          title: 'Impossibile eliminare',
          description: `Questa organizzazione ha ${orgUsers.length} utenti associati. Rimuovi prima gli utenti.`,
          variant: 'destructive'
        });
        return;
      }
      
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Organizzazione eliminata',
        description: `L'organizzazione ${name} è stata eliminata.`
      });

      fetchOrganizations();
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: `Impossibile eliminare l'organizzazione: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleToggleOrgActive = async (org: Organization) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ is_active: !org.is_active })
        .eq('id', org.id);

      if (error) throw error;

      toast({
        title: 'Stato aggiornato',
        description: `L'organizzazione ${org.name} è ora ${!org.is_active ? 'attiva' : 'disattivata'}.`
      });

      fetchOrganizations();
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: `Impossibile aggiornare lo stato dell'organizzazione: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword || !newUserName || !newUserOrg) {
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

      // Il trigger handle_new_user dovrebbe creare automaticamente il profilo utente
      // Possiamo aggiornare l'organizzazione se necessario
      if (newUserOrg !== 'default') {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ organization_id: newUserOrg })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      toast({
        title: 'Utente creato',
        description: `L'utente ${newUserEmail} è stato creato con successo.`
      });

      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
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
        <h1 className="text-2xl font-bold">Gestione Amministratore</h1>
        <Button onClick={() => setShowCreateUserDialog(true)} className="flex gap-2 items-center">
          <UserPlus className="h-4 w-4" />
          Crea Nuovo Utente
        </Button>
      </div>

      {/* Gestione Organizzazioni */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> 
            Organizzazioni
          </CardTitle>
          <CardDescription>
            Gestisci le organizzazioni clienti nella piattaforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <form onSubmit={handleCreateOrg} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="organization-name" className="sr-only">
                  Nome Organizzazione
                </Label>
                <Input
                  id="organization-name"
                  placeholder="Nome nuova organizzazione"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="flex gap-1">
                <PlusCircle className="h-4 w-4" />
                Aggiungi
              </Button>
            </form>

            {loadingOrgs ? (
              <div className="text-center py-4">Caricamento organizzazioni...</div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Utenti</TableHead>
                      <TableHead>Data creazione</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          Nessuna organizzazione trovata
                        </TableCell>
                      </TableRow>
                    ) : (
                      organizations.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell className="font-medium">{org.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={org.is_active} 
                                onCheckedChange={() => handleToggleOrgActive(org)}
                              />
                              <span className={org.is_active ? "text-green-600" : "text-red-600"}>
                                {org.is_active ? "Attiva" : "Disattivata"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{org.userCount || 0} utenti</TableCell>
                          <TableCell>
                            {new Date(org.created_at).toLocaleDateString('it-IT')}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Elimina organizzazione</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Sei sicuro di voler eliminare l'organizzazione "{org.name}"?
                                    Questa azione non può essere annullata.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => handleDeleteOrg(org.id, org.name)}
                                  >
                                    Elimina
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gestione Utenti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> 
            Utenti
          </CardTitle>
          <CardDescription>
            Gestisci gli utenti registrati nella piattaforma
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
                    <TableHead>Organizzazione</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
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
                          {organizations.find(o => o.id === user.organization_id)?.name || 'N/A'}
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
                <Users className="h-4 w-4 mr-2 mt-3 text-gray-500" />
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
              <Label htmlFor="new-user-org">Organizzazione</Label>
              <select
                id="new-user-org"
                className="w-full border border-gray-300 rounded-md p-2"
                value={newUserOrg}
                onChange={(e) => setNewUserOrg(e.target.value)}
                required
              >
                <option value="" disabled>Seleziona un'organizzazione</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id} disabled={!org.is_active}>
                    {org.name} {!org.is_active && "(Disattivata)"}
                  </option>
                ))}
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
