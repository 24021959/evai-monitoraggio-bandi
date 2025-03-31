
import React, { useState, useEffect } from 'react';
import { useUsers } from "@/hooks/useUsers";
import CreateUserDialog from "@/components/admin/CreateUserDialog";
import UserDetailsDialog from "@/components/admin/UserDetailsDialog";
import { useToast } from '@/components/ui/use-toast';
import { UserProfile, UserProfileUpdate } from '@/types';
import UserTable from '@/components/admin/UserTable';
import VerifyAdminAccess from '@/components/admin/VerifyAdminAccess';
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';

const UserManagement = () => {
  const { toast } = useToast();
  const { 
    users, 
    createUser, 
    updateUserProfile, 
    toggleUserActive, 
    loadingUsers, 
    adminClientVerified,
    verifyAdminClient
  } = useUsers();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Effettua una verifica automatica all'avvio se lo stato è null
  useEffect(() => {
    if (adminClientVerified === null) {
      verifyAdminClient();
    }
  }, [adminClientVerified, verifyAdminClient]);

  const handleUserCreated = (userData: any) => {
    toast({
      title: "Utente creato",
      description: `L'utente ${userData.email} è stato creato con successo.`,
    });
    setShowCreateDialog(false);
  };

  const handleUserUpdated = () => {
    toast({
      title: "Utente aggiornato",
      description: "Le informazioni dell'utente sono state aggiornate con successo.",
    });
    setSelectedUser(null);
  };

  const handleUserDeleted = () => {
    toast({
      title: "Utente eliminato",
      description: "L'utente è stato eliminato con successo.",
    });
    setSelectedUser(null);
  };

  const handlePasswordReset = () => {
    toast({
      title: "Reset password inviato",
      description: "Email per il reset della password inviata con successo.",
    });
  };

  const showUserDetails = (user: UserProfile) => {
    setSelectedUser(user);
  };

  // Wrapper function to handle the return type mismatch
  const handleUpdateUser = async (userId: string, updates: UserProfileUpdate) => {
    await updateUserProfile(userId, updates);
    return; // Return void to match the expected type
  };

  return (
    <div className="space-y-6 py-6 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-bold">Gestione Utenti</h1>
        <Button
          onClick={() => setShowCreateDialog(true)}
          disabled={!adminClientVerified}
          className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium bg-blue-600 text-white h-10 px-4 py-2 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Crea Nuovo Utente
        </Button>
      </div>

      {/* Componente verifica accesso admin */}
      <VerifyAdminAccess 
        verifyAdminClient={verifyAdminClient}
        adminClientVerified={adminClientVerified}
      />

      {/* Tabella utenti */}
      <UserTable 
        users={users}
        loadingUsers={loadingUsers}
        adminClientVerified={adminClientVerified}
        toggleUserActive={toggleUserActive}
        onShowDetails={showUserDetails}
      />
      
      {/* Dialog per creare un nuovo utente */}
      <CreateUserDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
        onUserCreated={handleUserCreated}
        createUser={createUser}
      />
      
      {/* Dialog per i dettagli utente */}
      {selectedUser && (
        <UserDetailsDialog 
          user={{
            id: selectedUser.id,
            display_name: selectedUser.display_name || "",
            email: selectedUser.email,
            role: selectedUser.role || "client",
            is_active: !selectedUser.disabled && selectedUser.is_active
          }}
          open={!!selectedUser} 
          onOpenChange={() => setSelectedUser(null)}
          updateUser={handleUpdateUser}
          onUserUpdated={handleUserUpdated}
          onUserDeleted={handleUserDeleted}
          onPasswordReset={handlePasswordReset}
        />
      )}
    </div>
  );
};

export default UserManagement;
