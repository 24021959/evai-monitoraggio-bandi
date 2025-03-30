
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, UserPlus } from 'lucide-react';
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';
import UserTable from '@/components/admin/UserTable';
import CreateUserDialog from '@/components/admin/CreateUserDialog';
import { useUsers } from '@/hooks/useUsers';

const AdminPage: React.FC = () => {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'client'>('client');
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  
  const { isAdmin } = useAuth();
  const { users, loadingUsers, createUser, toggleUserActive } = useUsers();

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
        <Button onClick={() => setShowCreateUserDialog(true)} className="flex gap-2 items-center">
          <UserPlus className="h-4 w-4" />
          Crea Nuovo Utente
        </Button>
      </div>

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
