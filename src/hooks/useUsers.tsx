import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { adminClient, verifyAdminClientAccess } from '@/integrations/supabase/adminClient';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from '@/types';

type UserProfileUpdate = {
  display_name?: string;
  role?: 'admin' | 'client';
};

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [adminClientVerified, setAdminClientVerified] = useState<boolean | null>(null);
  const [adminVerificationError, setAdminVerificationError] = useState<string | null>(null);
  const { toast } = useToast();

  // Verify admin client access on hook initialization
  const verifyAdminClient = async () => {
    try {
      console.log("Verifica dell'accesso amministrativo in corso...");
      const verified = await verifyAdminClientAccess();
      setAdminClientVerified(verified);
      
      if (!verified) {
        const errorMsg = 'Il client amministrativo non è configurato correttamente. Verificare la chiave Service Role.';
        setAdminVerificationError(errorMsg);
        console.error(errorMsg);
        return false;
      } else {
        console.log("Client amministrativo verificato con successo");
        setAdminVerificationError(null);
        fetchUsers(); // Reload users after successful verification
        return true;
      }
    } catch (error: any) {
      const errorMsg = `Errore durante la verifica del client amministrativo: ${error.message}`;
      setAdminVerificationError(errorMsg);
      setAdminClientVerified(false);
      console.error(errorMsg);
      return false;
    }
  };
  
  useEffect(() => {
    verifyAdminClient();
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      
      // Step 1: Retrieve user profiles from the public schema
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          organizations(is_active)
        `);
        
      if (profilesError) throw profilesError;

      // Step 2: Retrieve authenticated users only if admin client is verified
      if (adminClientVerified) {
        console.log("Tentativo di recupero utenti con adminClient");
        const { data, error: usersError } = await adminClient.auth.admin.listUsers();
        
        if (usersError) {
          console.error("Errore nel recupero degli utenti auth:", usersError);
          throw usersError;
        }

        const authUsers = data?.users || [];
        console.log("Utenti auth recuperati:", authUsers);

        // Combiniamo i dati dai profili con le email degli utenti autenticati
        const combinedUsers = profiles?.map(profile => {
          const authUser = authUsers.find(u => u.id === profile.id);
          
          return {
            id: profile.id,
            display_name: profile.display_name,
            email: authUser?.email || '', // Usiamo l'email dell'utente autenticato
            role: profile.role,
            is_active: profile.organizations?.is_active !== false,
            disabled: authUser ? !authUser.email_confirmed_at : true // Consideriamo disabilitati gli utenti non confermati
          };
        }) || [];

        console.log("Utenti combinati recuperati:", combinedUsers);
        setUsers(combinedUsers);
      } else {
        // Se non abbiamo accesso al client admin, non possiamo recuperare le email
        toast({
          title: 'Attenzione',
          description: 'Client amministrativo non configurato. Impossibile visualizzare le email degli utenti.',
          variant: 'destructive'
        });
        
        const basicUsers = profiles?.map(profile => ({
          id: profile.id,
          display_name: profile.display_name,
          email: 'Email non disponibile (accesso admin richiesto)',
          role: profile.role,
          is_active: profile.organizations?.is_active !== false
        })) || [];
        
        setUsers(basicUsers);
      }
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: `Impossibile recuperare gli utenti: ${error.message}`,
        variant: 'destructive'
      });
      console.error('Errore dettagliato nel recupero degli utenti:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [adminClientVerified, toast]);

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

    if (!adminClientVerified) {
      toast({
        title: 'Errore di configurazione',
        description: adminVerificationError || 'Impossibile creare utenti: client amministrativo non configurato correttamente.',
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
        console.error("Errore nella creazione dell'utente auth:", authError);
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
        console.error("Errore nell'aggiornamento del profilo:", profileError);
        throw profileError;
      }

      toast({
        title: 'Utente creato',
        description: `L'utente ${email} è stato creato con successo.`
      });

      // Update users list
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

  const updateUserProfile = async (userId: string, updates: UserProfileUpdate) => {
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          display_name: updates.display_name,
          role: updates.role
        })
        .eq('id', userId);
        
      if (profileError) throw profileError;

      toast({
        title: 'Utente aggiornato',
        description: `Il profilo utente è stato aggiornato con successo.`
      });

      fetchUsers(); // Refresh users list
      return true;
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: `Impossibile aggiornare il profilo utente: ${error.message}`,
        variant: 'destructive'
      });
      console.error('Errore dettagliato nell\'aggiornamento del profilo:', error);
      return false;
    }
  };

  return {
    users,
    loadingUsers,
    createUser,
    toggleUserActive,
    updateUserProfile,
    adminClientVerified,
    adminVerificationError,
    verifyAdminClient
  };
};
