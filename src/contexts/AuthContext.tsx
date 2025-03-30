
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

  // Controlla se l'utente ha ruolo admin
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    // Imposta il listener per i cambiamenti di autenticazione prima di controllare la sessione
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
      }

      // Se l'utente è autenticato, ottieni il suo profilo
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
    });

    // Controlla se c'è una sessione attiva
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Sessione corrente:', currentSession ? 'Presente' : 'Assente');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Se l'utente è autenticato, ottieni il suo profilo
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
      
      // Piccolo delay per evitare problemi di sincronizzazione
      setTimeout(async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Errore nel recupero del profilo:', error);
          setLoading(false);
          return;
        }

        if (data) {
          console.log('Profilo utente recuperato:', data);
          setUserProfile({
            id: data.id,
            role: data.role,
            organization_id: data.organization_id,
            display_name: data.display_name || 'Utente'
          });
        }
        
        setLoading(false);
      }, 0);
    } catch (error) {
      console.error('Errore durante il recupero del profilo utente:', error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast({
          title: "Errore di accesso",
          description: error.message,
          variant: "destructive"
        });
        console.error('Errore di login:', error);
      } else if (data.user) {
        toast({
          title: "Accesso effettuato",
          description: `Benvenuto`,
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il login",
        variant: "destructive"
      });
      console.error('Errore durante il processo di login:', error);
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
