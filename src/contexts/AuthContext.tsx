
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

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
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
        console.error('Error fetching user profile:', error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log('User profile retrieved:', data);
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
      console.error('Error during user profile retrieval:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    const setupAuthListener = async () => {
      // First set up the auth listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
        console.log('Auth state changed:', event, 'User:', newSession?.user?.id);
        
        if (!isMounted) return;
        
        // Update auth state
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Handle signout
        if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          // No need to navigate here, let the components handle it
        }
        
        // If we have a new user, fetch their profile
        if (newSession?.user && event !== 'TOKEN_REFRESHED') {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(() => {
            if (isMounted) {
              fetchUserProfile(newSession.user.id);
            }
          }, 0);
        }
      });

      // Then check for existing session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!isMounted) return;
      
      console.log('Current session check:', currentSession ? 'Present' : 'Absent');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setLoading(false);
      }
      
      return () => {
        subscription.unsubscribe();
      };
    };

    const cleanup = setupAuthListener();
    
    // Cleanup function
    return () => {
      isMounted = false;
      // Properly handle promise returned by setupAuthListener if needed
      if (cleanup instanceof Promise) {
        cleanup.then(unsubscribe => {
          if (unsubscribe) unsubscribe();
        });
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login with email:', email);
      
      // Sign out first to clear any stale session state
      await supabase.auth.signOut();
      
      // Give it a moment to complete signout
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      if (data.user) {
        console.log('Login successful for user:', data.user.id);
        
        // Notify the user
        toast({
          title: "Accesso effettuato",
          description: "Benvenuto",
        });
        
        // Fetch user profile directly to ensure we have role information before redirect
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select(`
            role,
            organization_id,
            display_name,
            organizations:organization_id (
              is_active
            )
          `)
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile after login:', profileError);
          // Default redirect if we can't determine role
          navigate('/app/dashboard');
          return;
        }
        
        console.log('Profile after login:', profileData);
        
        // Redirect based on role
        if (profileData?.role === 'admin') {
          console.log('Redirecting to admin page');
          navigate('/app/admin/gestione');
        } else {
          console.log('Redirecting to dashboard');
          navigate('/app/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Error during login process:', error);
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
        console.error('Registration error:', error);
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
      console.error('Error during registration process:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      // No need to navigate here, let the auth state change event handle redirection
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
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
      // Ensure we navigate to login even if there's an error
      navigate('/login');
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
