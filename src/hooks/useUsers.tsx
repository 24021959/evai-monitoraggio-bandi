
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { adminClient } from '@/integrations/supabase/adminClient';
import { useToast } from '@/components/ui/use-toast';

type UserProfile = {
  id: string;
  display_name: string;
  email: string;
  role: 'admin' | 'client';
  is_active: boolean;
};

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          organizations(is_active)
        `);
        
      if (profilesError) throw profilesError;

      const { data, error: usersError } = await adminClient.auth.admin.listUsers();
      
      if (usersError) throw usersError;

      const authUsers = data?.users || [];

      const combinedUsers = profiles?.map(profile => {
        const authUser = authUsers.find(u => u.id === profile.id);
        return {
          id: profile.id,
          display_name: profile.display_name,
          email: authUser?.email || 'N/A',
          role: profile.role,
          is_active: profile.organizations?.is_active !== false
        };
      }) || [];

      setUsers(combinedUsers);
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: `Impossibile recuperare gli utenti: ${error.message}`,
        variant: 'destructive'
      });
      console.error('Errore nel recupero degli utenti:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const createUser = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'admin' | 'client'
  ) => {
    if (!email || !password || !name) {
      toast({
        title: 'Dati mancanti',
        description: 'Compila tutti i campi per creare un nuovo utente',
        variant: 'destructive'
      });
      return false;
    }

    try {
      console.log("Tentativo di creazione utente con adminClient");
      
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: name
        }
      });

      if (authError) {
        console.error("Errore auth:", authError);
        throw authError;
      }

      console.log("Utente creato con successo:", authData);

      if (!authData.user) {
        throw new Error("Dati utente non ricevuti dalla creazione");
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          role: role,
          display_name: name
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Errore profilo:", profileError);
        throw profileError;
      }

      toast({
        title: 'Utente creato',
        description: `L'utente ${email} è stato creato con successo.`
      });

      // Aggiorna la lista degli utenti
      fetchUsers();
      return true;

    } catch (error: any) {
      console.error('Errore dettagliato nella creazione dell\'utente:', error);
      toast({
        title: 'Errore',
        description: `Impossibile creare l'utente: ${error.message}`,
        variant: 'destructive'
      });
      return false;
    }
  };

  const toggleUserActive = async (userId: string, isCurrentlyActive: boolean, userName: string) => {
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
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

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loadingUsers,
    createUser,
    toggleUserActive
  };
};
