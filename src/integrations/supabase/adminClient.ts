
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Utilizziamo costanti per la connessione Supabase
const SUPABASE_URL = "https://yeyfuxtzutciijtsezgc.supabase.co";

// IMPORTANTE: Quando copi la nuova Service Role Key dalla dashboard di Supabase,
// sostituisci il valore sottostante con la tua chiave
const SERVICE_ROLE_KEY = "la_tua_service_role_key"; // Sostituisci con la tua service_role key da Supabase

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
