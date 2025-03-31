
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, Database, Settings, FileSpreadsheet, Webhook, UserPlus } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import CreateUserDialog from "@/components/admin/CreateUserDialog";
import UserDetailsDialog from "@/components/admin/UserDetailsDialog";
import { useToast } from '@/components/ui/use-toast';
import { FontiTabContent } from '@/components/fonti/FontiTabContent';
import { AggiungiTabContent } from '@/components/fonti/AggiungiTabContent';
import { useFonti } from '@/hooks/useFonti';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserProfile, UserProfileUpdate } from '@/types';

const AdminPage = () => {
  const { toast } = useToast();
  const { users, createUser, updateUserProfile, toggleUserActive, loadingUsers } = useUsers();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  const [activeFontiTab, setActiveFontiTab] = useState("fonti");
  const [googleSheetUrl, setGoogleSheetUrl] = useState(localStorage.getItem('googleSheetUrl') || '');
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('n8nWebhookUrl') || '');

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

  const showUserDetails = (user: UserProfile) => {
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

  // Salva configurazione Google Sheets
  const saveGoogleSheetUrl = () => {
    localStorage.setItem('googleSheetUrl', googleSheetUrl);
    toast({
      title: "Configurazione salvata",
      description: "URL del foglio Google Sheets salvato con successo."
    });
  };

  // Salva configurazione webhook
  const saveWebhookUrl = () => {
    localStorage.setItem('n8nWebhookUrl', webhookUrl);
    toast({
      title: "Configurazione salvata", 
      description: "URL del webhook n8n salvato con successo."
    });
  };

  // Wrapper function to handle the updateUserProfile return type
  const handleUpdateUser = async (userId: string, updates: UserProfileUpdate) => {
    await updateUserProfile(userId, updates);
    return; // Return void to match the expected type
  };

  return (
    <div className="space-y-6 animate-fade-in container py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-500" />
          Pannello Amministrazione
        </h1>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
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
                          <td className="p-3 font-medium">{user.display_name || "-"}</td>
                          <td className="p-3 text-gray-600">{user.email}</td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                            }`}>
                              {user.role === "admin" ? "Admin" : "Cliente"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              !user.disabled && user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {!user.disabled && user.is_active ? "Attivo" : "Disabilitato"}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => showUserDetails(user)}>
                                Dettagli
                              </Button>
                              <Button 
                                size="sm" 
                                variant={user.disabled || !user.is_active ? "default" : "destructive"}
                                onClick={() => toggleUserActive(user.id, !(user.disabled || !user.is_active), user.display_name || "")}
                              >
                                {user.disabled || !user.is_active ? "Attiva" : "Disattiva"}
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
        </TabsContent>
        
        <TabsContent value="data-sources">
          <div className="space-y-6">
            <FontiTabContent 
              fonti={fonti} 
              isLoading={fontiLoading}
              onDelete={handleDelete}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Aggiungi Nuova Fonte</CardTitle>
                <CardDescription>
                  Configura una nuova fonte di dati per il monitoraggio dei bandi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AggiungiTabContent 
                  onAddSource={onAddSource} 
                  fonti={fonti}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-500" />
                  Configurazione Google Sheets
                </CardTitle>
                <CardDescription>
                  Configura il collegamento al foglio Google per l'importazione e la sincronizzazione dei dati
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google-sheet-url">URL del foglio Google</Label>
                  <Input
                    id="google-sheet-url"
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full"
                  />
                </div>
                <Button onClick={saveGoogleSheetUrl} className="w-full">
                  Salva Configurazione
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-blue-500" />
                  Configurazione Webhook n8n
                </CardTitle>
                <CardDescription>
                  Configura il webhook n8n per automatizzare le operazioni sulle fonti
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL del webhook n8n</Label>
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://n8n.example.com/webhook/..."
                    className="w-full"
                  />
                </div>
                <Button onClick={saveWebhookUrl} className="w-full">
                  Salva Configurazione
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Alert className="bg-amber-50 border-amber-200 mt-6">
            <AlertTitle>Area protetta</AlertTitle>
            <AlertDescription>
              Questa sezione contiene configurazioni sensibili che influenzano il funzionamento dell'applicazione.
              Modificare queste impostazioni con cautela.
            </AlertDescription>
          </Alert>
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

export default AdminPage;
