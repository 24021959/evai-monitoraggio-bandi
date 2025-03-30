
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, UserPlus, AlertTriangle, AlertCircle, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';
import UserTable from '@/components/admin/UserTable';
import CreateUserDialog from '@/components/admin/CreateUserDialog';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/components/ui/use-toast';

const AdminPage: React.FC = () => {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'client'>('client');
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const { 
    users, 
    loadingUsers, 
    createUser, 
    toggleUserActive, 
    adminClientVerified, 
    adminVerificationError,
    verifyAdminClient
  } = useUsers();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createUser(newUserEmail, newUserPassword, newUserName, newUserRole);
    
    if (success) {
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('client');
      setShowCreateUserDialog(false);
    }
  };

  const handleRetryVerification = async () => {
    setIsVerifying(true);
    const success = await verifyAdminClient();
    setIsVerifying(false);
    
    if (success) {
      toast({
        title: "Verifica completata",
        description: "Il client amministrativo è stato configurato correttamente.",
        variant: "default"
      });
    } else {
      toast({
        title: "Verifica fallita",
        description: "Problema con la configurazione del client amministrativo. Verificare la chiave Service Role in Supabase.",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Accesso negato</h1>
        <p className="mt-2">Non hai i permessi per visualizzare questa pagina.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Gestione Utenti
        </h1>
        <Button 
          onClick={() => setShowCreateUserDialog(true)} 
          className="flex gap-2 items-center"
          disabled={adminClientVerified === false}
        >
          <UserPlus className="h-4 w-4" />
          Crea Nuovo Utente
        </Button>
      </div>

      {adminClientVerified === false && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-2">
            <p className="font-semibold">Impossibile creare nuovi utenti: problemi di configurazione con le API admin.</p>
            <p className="text-sm">
              {adminVerificationError || 'Il client amministrativo non è configurato correttamente. Verificare la chiave Service Role in Supabase.'}
            </p>
            <div className="mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRetryVerification}
                disabled={isVerifying}
                className="flex items-center gap-1"
              >
                <RefreshCcw className={`h-3 w-3 ${isVerifying ? 'animate-spin' : ''}`} />
                {isVerifying ? 'Verifica in corso...' : 'Riprova verifica'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {adminClientVerified === true && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            API amministrative configurate correttamente. È possibile creare nuovi utenti.
          </AlertDescription>
        </Alert>
      )}

      <UserTable
        users={users}
        loadingUsers={loadingUsers}
        toggleUserActive={toggleUserActive}
      />

      <ChangePasswordForm />

      <CreateUserDialog
        open={showCreateUserDialog}
        onOpenChange={setShowCreateUserDialog}
        onCreateUser={handleCreateUser}
        newUserEmail={newUserEmail}
        setNewUserEmail={setNewUserEmail}
        newUserPassword={newUserPassword}
        setNewUserPassword={setNewUserPassword}
        newUserName={newUserName}
        setNewUserName={setNewUserName}
        newUserRole={newUserRole}
        setNewUserRole={setNewUserRole}
      />
    </div>
  );
};

export default AdminPage;
