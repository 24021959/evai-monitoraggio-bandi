
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, Database, Settings } from "lucide-react";
import UserTable from "@/components/admin/UserTable";
import { useUsers } from "@/hooks/useUsers";
import CreateUserDialog from "@/components/admin/CreateUserDialog";
import UserDetailsDialog from "@/components/admin/UserDetailsDialog";
import { useToast } from '@/components/ui/use-toast';
import { FontiTabContent } from '@/components/fonti/FontiTabContent';
import { AggiungiTabContent } from '@/components/fonti/AggiungiTabContent';
import { useFonti } from '@/hooks/useFonti';

const AdminPage = () => {
  const { toast } = useToast();
  const { users, createUser, updateUserProfile, toggleUserActive, loadingUsers } = useUsers();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [activeFontiTab, setActiveFontiTab] = useState("fonti");

  // Utilizziamo lo stesso hook useFonti che viene usato nella pagina utente
  const {
    fonti,
    isLoading: fontiLoading,
    handleDelete,
    handleAddSource,
  } = useFonti();

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

  // Aggiungo fonte handler che cambia anche la tab attiva
  const onAddSource = async (newSource) => {
    const success = await handleAddSource(newSource);
    if (success) {
      setActiveFontiTab("fonti");
    }
    return success;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-500" />
          Pannello Amministrazione
        </h1>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center">
          <Users className="mr-2 h-4 w-4" />
          Crea Nuovo Utente
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="users" className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Users className="mr-2 h-4 w-4" />
            Gestione Utenti
          </TabsTrigger>
          <TabsTrigger value="data-sources" className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Database className="mr-2 h-4 w-4" />
            Fonti di Dati
          </TabsTrigger>
          <TabsTrigger value="settings" className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Settings className="mr-2 h-4 w-4" />
            Impostazioni
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
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
        </TabsContent>
        
        <TabsContent value="data-sources">
          <Tabs value={activeFontiTab} onValueChange={setActiveFontiTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="fonti" className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white">Fonti Configurate</TabsTrigger>
              <TabsTrigger value="aggiungi" className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white">Aggiungi Fonte</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fonti">
              <FontiTabContent 
                fonti={fonti} 
                isLoading={fontiLoading}
                onDelete={handleDelete}
              />
            </TabsContent>
            
            <TabsContent value="aggiungi">
              <AggiungiTabContent 
                onAddSource={onAddSource} 
                fonti={fonti}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Impostazioni</CardTitle>
              <CardDescription>
                Configura le impostazioni globali della piattaforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Per configurare le impostazioni avanzate come le connessioni API e i webhook, utilizza la pagina 
                <a href="/app/admin/settings" className="text-blue-600 hover:underline ml-1">Impostazioni Avanzate</a>.
              </p>
              
              <p className="text-sm text-muted-foreground">
                La configurazione del foglio Google per l'importazione/esportazione delle fonti può essere gestita dalle 
                <a href="/app/admin/settings" className="text-blue-600 hover:underline ml-1">Impostazioni Avanzate</a>.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
          updateUser={updateUserProfile}
          onUserUpdated={handleUserUpdated}
          onUserDeleted={handleUserDeleted}
          onPasswordReset={handlePasswordReset}
        />
      )}
    </div>
  );
};

export default AdminPage;
