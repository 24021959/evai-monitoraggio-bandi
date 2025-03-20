
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
  BellRing 
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { mockFonti, mockClienti } from '@/data/mockData';

const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [monitoringResults, setMonitoringResults] = useState<any[]>([]);
  
  const handleStartMonitoring = () => {
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

    setIsMonitoring(true);
    setProgress(0);
    setMonitoringResults([]);

    // Simuliamo il monitoraggio
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsMonitoring(false);
        
        toast({
          title: "Monitoraggio completato",
          description: "Trovati nuovi match potenziali",
          duration: 3000,
        });
        
        navigate('/match');
      }
    }, 400);
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
        </nav>
      </div>
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
