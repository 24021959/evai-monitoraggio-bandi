
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Webhook, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [tempUrl, setTempUrl] = useState(webhookUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');

  // Aggiorna il tempUrl quando cambia webhookUrl
  React.useEffect(() => {
    setTempUrl(webhookUrl);
  }, [webhookUrl]);

  const handleSave = () => {
    if (!tempUrl.trim()) {
      toast({
        title: "URL non valido",
        description: "Inserisci un URL webhook valido",
        variant: "destructive",
      });
      return;
    }

    try {
      // Verifica che sia un URL valido
      new URL(tempUrl);
    } catch (err) {
      toast({
        title: "URL non valido",
        description: "Il formato dell'URL non è corretto",
        variant: "destructive",
      });
      return;
    }

    // Save the webhook URL to localStorage
    localStorage.setItem('n8nWebhookUrl', tempUrl);
    setWebhookUrl(tempUrl);
    
    toast({
      title: "Configurazione salvata",
      description: "L'URL del webhook n8n è stato salvato con successo",
    });
    
    onOpenChange(false);
  };

  const handleTest = async () => {
    if (!tempUrl.trim()) {
      toast({
        title: "URL non valido",
        description: "Inserisci un URL webhook valido",
        variant: "destructive",
      });
      return;
    }

    setTestStatus('loading');
    setTestError('');
    
    try {
      const testPayload = {
        action: 'test',
        message: 'Test connection from Bandi App',
        timestamp: new Date().toISOString(),
        fonte: {
          id: 'test-' + Date.now(),
          nome: 'Test Fonte',
          url: 'https://example.com',
          tipo: 'test',
          stato: 'test'
        }
      };
      
      console.log("Test webhook con URL:", tempUrl);
      console.log("Payload di test:", JSON.stringify(testPayload));
      
      try {
        await fetch(tempUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors', // Cambiato da no-cors a cors
          body: JSON.stringify(testPayload),
        });
        
        setTestStatus('success');
        
        toast({
          title: "Test completato",
          description: "La richiesta è stata inviata al webhook n8n. Verifica nella tua istanza n8n se è stata ricevuta.",
        });
      } catch (fetchError) {
        console.error("Errore fetch:", fetchError);
        setTestStatus('error');
        setTestError(fetchError instanceof Error ? fetchError.message : 'Errore di connessione');
        
        // Prova con no-cors in caso di problemi CORS
        console.log("Riprovando con mode: 'no-cors'");
        await fetch(tempUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'no-cors', 
          body: JSON.stringify(testPayload),
        });
        
        toast({
          title: "Test inviato in modalità no-cors",
          description: "La richiesta è stata inviata in modalità no-cors. Non è possibile verificare la risposta, controlla n8n.",
        });
      }
    } catch (error) {
      console.error('Errore durante il test del webhook:', error);
      setTestStatus('error');
      setTestError(error instanceof Error ? error.message : 'Errore sconosciuto');
      
      toast({
        title: "Errore di connessione",
        description: "Non è stato possibile inviare la richiesta al webhook. Verifica l'URL e riprova.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Configura Webhook n8n
          </DialogTitle>
          <DialogDescription>
            Inserisci l'URL del webhook n8n che riceverà le notifiche di aggiunta, modifica e cancellazione delle fonti.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL Webhook</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://n8n.tuodominio.it/webhook/..."
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleTest}
                disabled={testStatus === 'loading'}
              >
                {testStatus === 'loading' ? (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />
                ) : testStatus === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : testStatus === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Webhook className="h-4 w-4" />
                )}
              </Button>
            </div>
            {testStatus === 'error' && testError && (
              <p className="text-xs text-red-500 mt-1">
                Errore: {testError}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              L'URL del webhook deve essere pubblicamente accessibile e configurato per ricevere richieste JSON.
            </p>
            <p className="text-xs text-muted-foreground">
              Esempio di URL webhook n8n: https://tuoserver.com/webhook/fonte-manager
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button onClick={handleSave}>Salva configurazione</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
