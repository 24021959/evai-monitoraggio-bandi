
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Users, 
  GitCompare, 
  FileBarChart, 
  Database,
  KeyRound,
  CheckCircle,
  FileSearch
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FirecrawlService } from '@/utils/FirecrawlService';

const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(false);
  const [apiKeyAlreadyExists, setApiKeyAlreadyExists] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  
  useEffect(() => {
    const savedApiKey = FirecrawlService.getApiKey();
    if (savedApiKey) {
      setIsApiKeyValid(true);
    }
  }, []);
  
  useEffect(() => {
    // Quando il dialog viene aperto, verifica se esiste già una API key
    if (showApiKeyDialog) {
      const savedApiKey = FirecrawlService.getApiKey();
      if (savedApiKey) {
        setApiKey(savedApiKey);
        setApiKeyAlreadyExists(true);
        toast({
          title: "API Key già configurata",
          description: "La tua API key è già configurata. Puoi modificarla se necessario.",
          duration: 3000,
        });
      } else {
        setApiKeyAlreadyExists(false);
      }
    }
  }, [showApiKeyDialog]);
  
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci una chiave API valida",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Verifica se la chiave è già stata salvata con lo stesso valore
    if (FirecrawlService.isApiKeyAlreadySaved(apiKey)) {
      toast({
        title: "Informazione",
        description: "Questa API key è già stata salvata nel sistema",
        duration: 3000,
      });
      setApiKeyAlreadyExists(true);
      return;
    }
    
    setIsCheckingApiKey(true);
    try {
      const isValid = await FirecrawlService.testApiKey(apiKey);
      
      if (isValid) {
        FirecrawlService.saveApiKey(apiKey);
        setIsApiKeyValid(true);
        setShowApiKeyDialog(false);
        toast({
          title: "Successo",
          description: "Chiave API salvata con successo",
          duration: 3000,
        });
      } else {
        toast({
          title: "Errore",
          description: "Chiave API non valida",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante il test della chiave API",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsCheckingApiKey(false);
    }
  };

  // Funzione per gestire il clic sul pulsante Estrai Bandi
  const handleEstraiBandiClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/fonti');
    toast({
      title: "Gestione Fonti",
      description: "Sei stato reindirizzato alla pagina di gestione fonti",
      duration: 3000,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 text-white p-5 text-xl font-medium">
        Sistema Monitoraggio Bandi
      </div>
      <div className="bg-gray-100 flex-grow">
        <nav className="flex flex-col">
          {/* Pulsante verde modificato per navigare alla pagina fonti invece di attivare il monitoraggio */}
          <NavLink
            to="#"
            className="p-5 mb-2 bg-green-500 text-white hover:bg-green-600"
            onClick={handleEstraiBandiClick}
          >
            <div className="flex items-center gap-3">
              <FileSearch className="w-5 h-5" />
              Estrai Bandi
            </div>
          </NavLink>
          
          <NavLink
            to="/"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-50' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </div>
          </NavLink>
          <NavLink
            to="/bandi"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-50' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              Bandi
            </div>
          </NavLink>
          <NavLink
            to="/clienti"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-50' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              Clienti
            </div>
          </NavLink>
          <NavLink
            to="/match"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-50' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <GitCompare className="w-5 h-5" />
              Match
            </div>
          </NavLink>
          <NavLink
            to="/report"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-50' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <FileBarChart className="w-5 h-5" />
              Report
            </div>
          </NavLink>
          <NavLink
            to="/risultati-scraping"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-50' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              Risultati Monitoraggio
            </div>
          </NavLink>
          <NavLink
            to="#"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-50' : ''}`
            }
            onClick={(e) => {
              e.preventDefault();
              setShowApiKeyDialog(true);
            }}
          >
            <div className="flex items-center gap-3">
              <KeyRound className="w-5 h-5" />
              Configura API Key
            </div>
          </NavLink>
          <div className="border-t border-gray-300 my-5"></div>
        </nav>
      </div>
      
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configura API Key</DialogTitle>
            <DialogDescription>
              {apiKeyAlreadyExists 
                ? "La tua API key è già configurata. Puoi modificarla se necessario."
                : "Inserisci la tua chiave API per attivare il monitoraggio automatico dei bandi."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {apiKeyAlreadyExists && (
              <Alert className="bg-blue-50 border-blue-100">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <AlertTitle>API Key già presente</AlertTitle>
                <AlertDescription>
                  Questa API key è già stata salvata nel sistema.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Inserisci la tua API key"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setApiKeyAlreadyExists(false);
                }}
              />
            </div>
            <p className="text-sm text-gray-500">
              Puoi ottenere una chiave API registrandoti sul portale del servizio di monitoraggio bandi.
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSaveApiKey} 
              disabled={isCheckingApiKey}
            >
              {isCheckingApiKey ? "Verifica in corso..." : (apiKeyAlreadyExists ? "Aggiorna API Key" : "Salva API Key")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/5 h-full">
        <Sidebar />
      </div>
      <div className="w-4/5 p-8 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
