
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from "@/components/ui/use-toast";
import { Webhook, Info, Link, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface N8nWebhookConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
}

export const N8nWebhookConfigDialog: React.FC<N8nWebhookConfigDialogProps> = ({
  open,
  onOpenChange,
  webhookUrl,
  setWebhookUrl
}) => {
  const { toast } = useToast();
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const saveWebhookUrl = () => {
    if (!webhookUrl) {
      toast({
        title: "URL mancante",
        description: "Inserisci l'URL del webhook n8n",
        variant: "destructive",
      });
      return;
    }

    // Salva l'URL nel localStorage
    localStorage.setItem('n8nWebhookUrl', webhookUrl);
    
    toast({
      title: "URL salvato",
      description: "L'URL del webhook n8n è stato salvato con successo",
    });
    
    onOpenChange(false);
  };

  const testConnection = async () => {
    if (!webhookUrl) {
      setConnectionStatus('error');
      return;
    }
    
    setTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      const testPayload = {
        action: 'test',
        message: 'Test di connessione',
        timestamp: new Date().toISOString()
      };
      
      // Usa 'no-cors' per evitare problemi CORS
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(testPayload),
      });
      
      // Non possiamo leggere la risposta con no-cors, quindi assumiamo successo se non ci sono errori
      setConnectionStatus('success');
      
      toast({
        title: "Test completato",
        description: "La connessione con il webhook n8n è stata stabilita con successo",
      });
    } catch (error) {
      console.error("Errore nel test di connessione:", error);
      setConnectionStatus('error');
      
      toast({
        title: "Errore di connessione",
        description: "Impossibile connettersi al webhook n8n. Verifica l'URL.",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configura Webhook n8n</DialogTitle>
          <DialogDescription>
            Inserisci l'URL del webhook n8n per sincronizzare le fonti con n8n.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="webhookUrl" className="flex items-center text-sm font-medium">
              <Webhook className="h-4 w-4 mr-1" />
              URL del webhook n8n
            </label>
            <div className="flex space-x-2">
              <Input
                id="webhookUrl"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://n8n.tuo-dominio.com/webhook/..."
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testConnection}
                disabled={testingConnection}
                className="whitespace-nowrap"
              >
                {testingConnection ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Test
                  </span>
                ) : (
                  <span>Test Connessione</span>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              L'URL del webhook deve essere creato su n8n e configurato per ricevere i dati delle fonti.
            </p>
          </div>

          {connectionStatus === 'success' && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Connessione stabilita</AlertTitle>
              <AlertDescription>La connessione con il webhook n8n è stata stabilita con successo.</AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errore di connessione</AlertTitle>
              <AlertDescription>Impossibile connettersi al webhook. Verifica l'URL e assicurati che n8n sia in esecuzione.</AlertDescription>
            </Alert>
          )}

          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <AlertTitle className="flex items-center">
              <Info className="h-4 w-4 mr-1" />
              Come configurare n8n
            </AlertTitle>
            <AlertDescription className="text-xs space-y-2">
              <ol className="list-decimal pl-5 space-y-1">
                <li>Accedi alla tua istanza n8n</li>
                <li>Crea un nuovo workflow</li>
                <li>Aggiungi un nodo "Webhook" come trigger</li>
                <li>Configura il webhook per accettare richieste POST</li>
                <li>Aggiungi i nodi necessari per gestire le azioni (add, update, delete) sulle fonti</li>
                <li>Attiva il workflow e copia l'URL del webhook</li>
                <li>Incolla l'URL qui sopra e salvalo</li>
              </ol>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs flex items-center"
                onClick={() => window.open('https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/', '_blank')}
              >
                <Link className="h-3 w-3 mr-1" />
                Documentazione Webhook n8n
              </Button>
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={saveWebhookUrl}>
            Salva Configurazione
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default N8nWebhookConfigDialog;
