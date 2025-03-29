
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, FileSpreadsheet, Webhook, CheckCircle, Lock } from 'lucide-react';
import { GoogleSheetsConfigDialog } from '../fonti/GoogleSheetsConfigDialog';
import { N8nWebhookConfigDialog } from '../fonti/N8nWebhookConfigDialog';

const AdminSettings = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showGoogleSheetsConfig, setShowGoogleSheetsConfig] = useState(false);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState(localStorage.getItem('googleSheetUrl') || '');
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('n8nWebhookUrl') || '');

  // Check if password is set in localStorage
  useEffect(() => {
    const savedPassword = localStorage.getItem('adminPassword');
    // If no password is set yet, we'll consider the user not authenticated
    if (!savedPassword) {
      localStorage.setItem('adminPassword', 'admin123'); // Default password
    }
  }, []);

  const handleAuthenticate = () => {
    const savedPassword = localStorage.getItem('adminPassword');
    if (password === savedPassword) {
      setIsAuthenticated(true);
      toast({
        title: "Autenticazione riuscita",
        description: "Sei ora autenticato come amministratore",
      });
    } else {
      toast({
        title: "Autenticazione fallita",
        description: "Password non corretta",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const openGoogleSheetsConfig = () => {
    setShowGoogleSheetsConfig(true);
  };

  const openWebhookConfig = () => {
    setShowWebhookConfig(true);
  };

  return (
    <div className="space-y-6">
      {!isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-500" />
              Accesso Amministratore
            </CardTitle>
            <CardDescription>
              Inserisci la password per accedere alle impostazioni di amministrazione
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci la password di amministrazione"
                />
              </div>
              <Button onClick={handleAuthenticate}>Accedi</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-500" />
              Impostazioni Amministratore
            </h1>
            <Button variant="outline" onClick={handleLogout}>Disconnetti</Button>
          </div>
          
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTitle>Area protetta</AlertTitle>
            <AlertDescription>
              Questa sezione contiene configurazioni sensibili che influenzano il funzionamento dell'applicazione.
              Modificare queste impostazioni con cautela.
            </AlertDescription>
          </Alert>
          
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
                  <Label>URL del foglio Google attuale</Label>
                  <div className="text-sm rounded-md border p-3 bg-gray-50">
                    {googleSheetUrl ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="truncate">{googleSheetUrl}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Nessun URL configurato</span>
                    )}
                  </div>
                </div>
                <Button onClick={openGoogleSheetsConfig} className="w-full">
                  Configura Google Sheets
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
                  <Label>URL del webhook n8n attuale</Label>
                  <div className="text-sm rounded-md border p-3 bg-gray-50">
                    {webhookUrl ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="truncate">{webhookUrl}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Nessun webhook configurato</span>
                    )}
                  </div>
                </div>
                <Button onClick={openWebhookConfig} className="w-full">
                  Configura Webhook n8n
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      <GoogleSheetsConfigDialog
        open={showGoogleSheetsConfig}
        onOpenChange={setShowGoogleSheetsConfig}
        googleSheetUrl={googleSheetUrl}
        setGoogleSheetUrl={setGoogleSheetUrl}
      />
      
      <N8nWebhookConfigDialog
        open={showWebhookConfig}
        onOpenChange={setShowWebhookConfig}
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
      />
    </div>
  );
};

export default AdminSettings;
