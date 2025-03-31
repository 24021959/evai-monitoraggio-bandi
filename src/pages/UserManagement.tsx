
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import CreateUserDialog from "@/components/admin/CreateUserDialog";
import UserDetailsDialog from "@/components/admin/UserDetailsDialog";
import { useToast } from '@/components/ui/use-toast';
import { UserProfile, UserProfileUpdate } from '@/types';

const UserManagement = () => {
  const { toast } = useToast();
  const { users, createUser, updateUserProfile, toggleUserActive, loadingUsers } = useUsers();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

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

  const showUserDetails = (user: UserProfile) => {
    setSelectedUser(user);
  };

  // Wrapper function to handle the return type mismatch
  const handleUpdateUser = async (userId: string, updates: UserProfileUpdate) => {
    await updateUserProfile(userId, updates);
    return; // Return void to match the expected type
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
          {loadingUsers ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3">Utente</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Ruolo</th>
                    <th className="p-3">Stato</th>
                    <th className="p-3">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{user.profile?.display_name || user.display_name || "-"}</td>
                      <td className="p-3 text-gray-600">{user.email}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          (user.profile?.role || user.role) === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {(user.profile?.role || user.role) === "admin" ? "Admin" : "Cliente"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          !(user.disabled || !user.is_active) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {!(user.disabled || !user.is_active) ? "Attivo" : "Disabilitato"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => showUserDetails(user)}>
                            Dettagli
                          </Button>
                          <Button 
                            size="sm" 
                            variant={(user.disabled || !user.is_active) ? "default" : "destructive"}
                            onClick={() => toggleUserActive(user.id, !(user.disabled || !user.is_active), user.profile?.display_name || user.display_name || "")}
                          >
                            {(user.disabled || !user.is_active) ? "Attiva" : "Disattiva"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
          user={{
            id: selectedUser.id,
            display_name: selectedUser.profile?.display_name || selectedUser.display_name || "",
            email: selectedUser.email,
            role: selectedUser.profile?.role || selectedUser.role || "client",
            is_active: !(selectedUser.disabled || !selectedUser.is_active)
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
