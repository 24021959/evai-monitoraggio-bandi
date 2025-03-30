
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables or constants for Supabase connection
const SUPABASE_URL = "https://yeyfuxtzutciijtsezgc.supabase.co";
// This is the corrected service role key format
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleWZ1eHR6dXRjaWlqdHNlemdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjUyMTAyOCwiZXhwIjoyMDUyMDk3MDI4fQ.Z_Up9oXJMA-ixYEb2Qtcq7Ce3LS_5ue_KbUbyfyPYD0";

// Create admin client with explicit configurations to avoid auth issues
export const adminClient = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Add a function to verify the admin client is properly configured
export const verifyAdminClientAccess = async () => {
  try {
    // Attempt to list users (a simple test to verify admin access)
    const { data, error } = await adminClient.auth.admin.listUsers();
    if (error) {
      console.error("Admin client verification failed:", error);
      return false;
    }
    console.log("Admin client successfully verified");
    return true;
  } catch (err) {
    console.error("Admin client verification exception:", err);
    return false;
  }
};
