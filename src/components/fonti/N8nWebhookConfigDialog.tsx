
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Webhook, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import WebhookService from '@/utils/WebhookService';

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
  const [testRequested, setTestRequested] = useState(false);

  // Verifica stato del workflow
  useEffect(() => {
    if (open) {
      // Reset dello stato all'apertura
      setTempUrl(webhookUrl);
      setTestStatus('idle');
      setTestError('');
      setTestRequested(false);
    }
  }, [open, webhookUrl]);

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

    // Suggerimento per n8n: verifica che l'URL contenga il path corretto
    if (!tempUrl.includes('/webhook/')) {
      toast({
        title: "Attenzione",
        description: "L'URL inserito potrebbe non essere un URL di webhook n8n valido. Verifica che il percorso includa '/webhook/'",
        variant: "default",
      });
    }

    // Suggerimento per n8n: verifica che il workflow sia attivo
    if (testRequested && testStatus !== 'success') {
      const confirmSave = window.confirm(
        "Il test di connessione non è stato completato con successo. " +
        "Vuoi comunque salvare questa configurazione?\n\n" +
        "Assicurati che:\n" +
        "1. Il workflow in n8n sia attivo (interruttore in alto a destra)\n" +
        "2. Il nodo webhook sia configurato correttamente\n" +
        "3. n8n sia in esecuzione e accessibile"
      );
      
      if (!confirmSave) {
        return;
      }
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
    setTestRequested(true);
    
    try {
      console.log("Test webhook con URL:", tempUrl);
      const success = await WebhookService.testWebhook(tempUrl);
      
      if (success) {
        setTestStatus('success');
        
        toast({
          title: "Test completato",
          description: "Il webhook n8n ha risposto correttamente. Workflow configurato correttamente!",
          variant: "default",
        });
      } else {
        setTestStatus('error');
        setTestError('Il webhook non ha risposto correttamente. Verifica la configurazione.');
        
        toast({
          title: "Errore di test",
          description: "Non è stato possibile connettersi al webhook. Verifica la configurazione in n8n.",
          variant: "destructive",
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
                onClick={handleTest}
                disabled={testStatus === 'loading'}
                className="flex items-center gap-1"
              >
                {testStatus === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Test</span>
                  </>
                ) : testStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Test</span>
                  </>
                ) : testStatus === 'error' ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span>Test</span>
                  </>
                ) : (
                  <>
                    <Webhook className="h-4 w-4" />
                    <span>Test</span>
                  </>
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
          
          {testStatus === 'success' && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Webhook raggiungibile</AlertTitle>
              <AlertDescription>
                Il webhook n8n è raggiungibile e ha accettato la richiesta di test. Puoi procedere con il salvataggio.
              </AlertDescription>
            </Alert>
          )}
          
          {testStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errore di connessione</AlertTitle>
              <AlertDescription>
                <p>Non è stato possibile connettersi al webhook n8n. Verifica:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Che l'URL sia corretto (deve includere '/webhook/')</li>
                  <li>Che il workflow in n8n sia attivo (interruttore in alto a destra)</li>
                  <li>Che n8n sia in esecuzione e pubblicamente accessibile</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button onClick={handleSave}>Salva configurazione</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
