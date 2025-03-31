
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

type UserProfile = {
  id: string;
  role: 'admin' | 'client';
  organization_id: string;
  display_name: string;
  organizationDisabled?: boolean;
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    // First, set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
      }

      if (currentSession?.user) {
        // Use setTimeout to prevent potential deadlocks with Supabase client
        setTimeout(() => {
          fetchUserProfile(currentSession.user.id);
        }, 0);
      }
    });

    // Then check for an existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Sessione corrente:', currentSession ? 'Presente' : 'Assente');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          organizations:organization_id (
            is_active
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Errore nel recupero del profilo:', error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log('Profilo utente recuperato:', data);
        const organizationDisabled = data.organizations ? !data.organizations.is_active : false;
        
        setUserProfile({
          id: data.id,
          role: data.role,
          organization_id: data.organization_id,
          display_name: data.display_name || 'Utente',
          organizationDisabled
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Errore durante il recupero del profilo utente:', error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Tentativo di login con email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Errore durante il login:', error);
        throw error;
      } else if (data.user) {
        toast({
          title: "Accesso effettuato",
          description: `Benvenuto`,
        });
        
        // Attendiamo il caricamento del profilo utente
        await new Promise(resolve => {
          const checkProfile = () => {
            if (userProfile) {
              resolve(null);
            } else {
              setTimeout(checkProfile, 100);
            }
          };
          checkProfile();
        });
        
        // Reindirizzo basato sul ruolo
        if (userProfile?.role === 'admin') {
          navigate('/app/admin/gestione');
        } else {
          navigate('/app/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Errore durante il processo di login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name || email.split('@')[0],
          }
        }
      });

      if (error) {
        toast({
          title: "Errore di registrazione",
          description: error.message,
          variant: "destructive"
        });
        console.error('Errore di registrazione:', error);
      } else {
        toast({
          title: "Registrazione completata",
          description: "Controlla la tua email per confermare la registrazione",
        });
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la registrazione",
        variant: "destructive"
      });
      console.error('Errore durante il processo di registrazione:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Logout effettuato",
        description: "Hai effettuato il logout con successo",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il logout",
        variant: "destructive"
      });
      console.error('Errore durante il logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      userProfile,
      loading, 
      signIn, 
      signUp, 
      signOut, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
};
