
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, Users } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
      const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) throw usersError;

      // Combiniamo i dati
      const combinedUsers = profiles?.map(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.id);
        return {
          id: profile.id,
          display_name: profile.display_name,
          email: authUser?.email || 'N/A',
          role: profile.role,
          organization_id: profile.organization_id
        };
      });

      setUsers(combinedUsers || []);

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
                      <TableHead>Utenti</TableHead>
                      <TableHead>Data creazione</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                          Nessuna organizzazione trovata
                        </TableCell>
                      </TableRow>
                    ) : (
                      organizations.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell className="font-medium">{org.name}</TableCell>
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
    </div>
  );
};

export default AdminPage;
