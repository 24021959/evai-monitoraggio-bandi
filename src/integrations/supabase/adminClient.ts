
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables or constants for Supabase connection
const SUPABASE_URL = "https://yeyfuxtzutciijtsezgc.supabase.co";
// Updated service role key from Supabase dashboard
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleWZ1eHR6dXRjaWlqdHNlemdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjUyMTAyOCwiZXhwIjoyMDUyMDk3MDI4fQ.xtUgLumu3xinCXZcynFPJiUO1y3Z_qRC2YlQjQ6Ey_A";

// Updated client configuration to ensure correct auth settings
export const adminClient = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Enhanced verification function to better test admin access
export const verifyAdminClientAccess = async () => {
  try {
    console.log("Tentativo di verifica dell'accesso amministrativo...");
    
    // More complete test for admin access verification
    const { data, error } = await adminClient.auth.admin.listUsers({
      perPage: 1,
      page: 1
    });
    
    if (error) {
      console.error("Errore di verifica client amministrativo:", error);
      return false;
    }
    
    console.log("Verifica del client amministrativo completata con successo:", data);
    return true;
  } catch (err) {
    console.error("Eccezione durante la verifica del client amministrativo:", err);
    return false;
  }
};
