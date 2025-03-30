
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yeyfuxtzutciijtsezgc.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleWZ1eHR6dXRjaWlqdHNlemdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjUyMTAyOCwiZXhwIjoyMDUyMDk3MDI4fQ.Z_Up9oXJMA-ixYEb2Qtcq7Ce3LS_5ue_KbUbyfyPYD0";

// Questo client dispone di privilegi elevati e dovrebbe essere usato SOLO per operazioni
// di amministrazione come la creazione di utenti
export const adminClient = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);
