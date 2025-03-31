
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield } from "lucide-react";
import UserTable from "@/components/admin/UserTable";
import { useUsers } from "@/hooks/useUsers";
import CreateUserDialog from "@/components/admin/CreateUserDialog";
import UserDetailsDialog from "@/components/admin/UserDetailsDialog";
import { useToast } from '@/components/ui/use-toast';

type UserProfileUpdate = {
  display_name?: string;
  role?: 'admin' | 'client';
};

const UserManagement = () => {
  const { toast } = useToast();
  const { users, createUser, updateUserProfile, toggleUserActive, loadingUsers } = useUsers();
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);

  const handleUserCreated = (userData) => {
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

  const showUserDetails = (user) => {
    setSelectedUser(user);
  };

  // Wrapper function to handle the return type mismatch
  const handleUpdateUser = async (userId: string, updates: UserProfileUpdate) => {
    await updateUserProfile(userId, updates);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-500" />
          Gestione Utenti
        </h1>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center">
          <Users className="mr-2 h-4 w-4" />
          Crea Nuovo Utente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Gestione Utenti</CardTitle>
          <CardDescription>
            Gestisci gli utenti della piattaforma, resetta le password e modifica i permessi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable 
            users={users} 
            loadingUsers={loadingUsers}
            toggleUserActive={toggleUserActive}
            onShowDetails={showUserDetails}
          />
        </CardContent>
      </Card>
      
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
          user={selectedUser} 
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
