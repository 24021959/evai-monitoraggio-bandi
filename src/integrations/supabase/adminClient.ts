
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables or constants for Supabase connection
const SUPABASE_URL = "https://yeyfuxtzutciijtsezgc.supabase.co";
// Service role key - verificare che sia corretta
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleWZ1eHR6dXRjaWlqdHNlemdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjUyMTAyOCwiZXhwIjoyMDUyMDk3MDI4fQ.Z_Up9oXJMA-ixYEb2Qtcq7Ce3LS_5ue_KbUbyfyPYD0";

// Aggiornamento della configurazione del client amministrativo per assicurare la corretta impostazione
export const adminClient = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Funzione migliorata per verificare l'accesso del client amministrativo
export const verifyAdminClientAccess = async () => {
  try {
    console.log("Tentativo di verifica dell'accesso amministrativo...");
    
    // Test più completo per verificare l'accesso amministrativo
    const { data, error } = await adminClient.auth.admin.listUsers({
      perPage: 1,  // Richiediamo solo un utente per minimizzare il carico
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
