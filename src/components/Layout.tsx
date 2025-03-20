import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Users, 
  GitCompare, 
  FileBarChart, 
  Database,
  PlayCircle,
  BellRing,
  KeyRound
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { mockFonti, mockClienti } from '@/data/mockData';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FirecrawlService } from '@/utils/FirecrawlService';

const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(false);
  
  React.useEffect(() => {
    const savedApiKey = FirecrawlService.getApiKey();
    if (savedApiKey) {
      setIsApiKeyValid(true);
    }
  }, []);
  
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

  const handleStartMonitoring = async () => {
    if (mockFonti.length === 0) {
      toast({
        title: "Attenzione",
        description: "Aggiungi almeno una fonte prima di avviare il monitoraggio",
        variant: "destructive",
        duration: 3000,
      });
      navigate('/fonti');
      return;
    }

    const apiKey = FirecrawlService.getApiKey();
    if (!apiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setIsMonitoring(true);
    setProgress(0);

    try {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 5;
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsMonitoring(false);
          
          toast({
            title: "Monitoraggio completato",
            description: "Trovati nuovi bandi e match potenziali",
            duration: 3000,
          });
          
          navigate('/risultati-scraping');
        }
      }, 400);
    } catch (error) {
      setIsMonitoring(false);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il monitoraggio",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  const handleSendNotifications = () => {
    toast({
      title: "Notifiche inviate",
      description: "Le notifiche sono state inviate con successo",
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
            to="/fonti"
            className={({ isActive }) =>
              `p-5 hover:bg-blue-50 ${isActive ? 'bg-blue-50' : ''}`
            }
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5" />
              Gestione Fonti
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
          <div className="border-t border-gray-300 my-5"></div>
          <div className="px-5 mb-2">
            {isMonitoring ? (
              <div className="space-y-2">
                <button 
                  className="w-full bg-gray-400 text-white py-3 rounded flex items-center justify-center gap-2 cursor-not-allowed"
                  disabled
                >
                  <PlayCircle className="w-5 h-5" />
                  Monitoraggio in corso...
                </button>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progresso</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full h-2" />
                </div>
              </div>
            ) : (
              <button 
                className="w-full bg-green-500 text-white py-3 rounded flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                onClick={handleStartMonitoring}
              >
                <PlayCircle className="w-5 h-5" />
                Avvia Monitoraggio
              </button>
            )}
          </div>
          <div className="px-5">
            <button 
              className="w-full bg-yellow-500 text-white py-3 rounded flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors"
              onClick={handleSendNotifications}
            >
              <BellRing className="w-5 h-5" />
              Invia Notifiche
            </button>
          </div>
          <div className="px-5 mt-2">
            <button 
              className="w-full bg-blue-500 text-white py-3 rounded flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
              onClick={() => setShowApiKeyDialog(true)}
            >
              <KeyRound className="w-5 h-5" />
              Configura API Key
            </button>
          </div>
        </nav>
      </div>
      
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configura Firecrawl API Key</DialogTitle>
            <DialogDescription>
              Inserisci la tua chiave API di Firecrawl per attivare il monitoraggio automatico dei bandi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Firecrawl API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Inserisci la tua API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-500">
              Puoi ottenere una chiave API registrandoti su <a href="https://firecrawl.dev" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">firecrawl.dev</a>
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSaveApiKey} 
              disabled={isCheckingApiKey}
            >
              {isCheckingApiKey ? "Verifica in corso..." : "Salva API Key"}
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
