
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Utilizziamo costanti per la connessione Supabase
const SUPABASE_URL = "https://yeyfuxtzutciijtsezgc.supabase.co";

// Utilizziamo direttamente la chiave di servizio senza riferimento a process.env
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleWZ1eHR6dXRjaWlqdHNlemdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjUyMTAyOCwiZXhwIjoyMDUyMDk3MDI4fQ.zrFtwX_0KaZ9x10YErb9HAzsfgw4r9gblnFpS4lU-BA";

// Configurazione del client amministrativo
export const adminClient = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Funzione per verificare l'accesso amministrativo
export const verifyAdminClientAccess = async () => {
  try {
    console.log("Tentativo di verifica dell'accesso amministrativo...");
    
    // Verifica dell'accesso amministrativo
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
