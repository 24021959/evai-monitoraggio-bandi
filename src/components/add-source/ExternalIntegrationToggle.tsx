
import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileSpreadsheet, Webhook, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ExternalIntegrationToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onConfigureClick?: () => void;
  integrationType: 'googlesheets' | 'n8n';
}

export const ExternalIntegrationToggle: React.FC<ExternalIntegrationToggleProps> = ({
  checked,
  onCheckedChange,
  onConfigureClick,
  integrationType
}) => {
  const [configComplete, setConfigComplete] = useState(false);
  
  const checkConfig = () => {
    if (integrationType === 'googlesheets') {
      const sheetUrl = localStorage.getItem('googleSheetUrl');
      const updateUrl = localStorage.getItem('googleSheetUpdateUrl');
      setConfigComplete(!!sheetUrl && !!updateUrl);
    } else if (integrationType === 'n8n') {
      const webhookUrl = localStorage.getItem('n8nWebhookUrl');
      setConfigComplete(!!webhookUrl);
    }
  };
  
  useEffect(() => {
    // Controlla all'inizio
    checkConfig();
    
    // Aggiungi un listener per verificare modifiche al localStorage
    window.addEventListener('storage', checkConfig);
    
    // Aggiungi anche un intervallo per controllare periodicamente
    const interval = setInterval(checkConfig, 5000);
    
    return () => {
      window.removeEventListener('storage', checkConfig);
      clearInterval(interval);
    };
  }, [integrationType]);

  const getIcon = () => {
    if (integrationType === 'googlesheets') {
      return <FileSpreadsheet className="h-4 w-4 mr-1 text-green-600" />;
    } else if (integrationType === 'n8n') {
      return <Webhook className="h-4 w-4 mr-1 text-blue-600" />;
    }
  };

  const getLabel = () => {
    if (integrationType === 'googlesheets') {
      return "Aggiungi anche al foglio Google Sheets";
    } else if (integrationType === 'n8n') {
      return "Sincronizza con n8n";
    }
  };
  
  return (
    <div className="flex flex-col space-y-2 my-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="add-to-external"
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={!configComplete}
        />
        <Label htmlFor="add-to-external" className="flex items-center cursor-pointer">
          {getIcon()}
          {getLabel()}
        </Label>
      </div>
      
      <div className="ml-7">
        {!configComplete && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs flex items-center bg-amber-50 border-amber-200 text-amber-700">
              <AlertCircle className="h-3 w-3 mr-1" />
              Configurazione incompleta
            </Badge>
            
            {onConfigureClick && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs" 
                onClick={onConfigureClick}
              >
                Configura
              </Button>
            )}
          </div>
        )}
        
        {configComplete && (
          <Badge variant="outline" className="text-xs flex items-center bg-green-50 border-green-200 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pronto
          </Badge>
        )}
      </div>
    </div>
  );
};
