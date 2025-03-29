import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fonte, TipoBando } from '@/types';
import { SourceFormFields } from './SourceFormFields';
import { ExternalIntegrationToggle } from './ExternalIntegrationToggle';
import { SubmitButton } from './SubmitButton';
import { useToast } from '@/components/ui/use-toast';
import WebhookService from '@/utils/WebhookService';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { N8nWebhookConfigDialog } from '../fonti/N8nWebhookConfigDialog';

interface AddSourceFormProps {
  onAddSource: (fonte: Omit<Fonte, 'id'>) => void;
}

const AddSourceForm: React.FC<AddSourceFormProps> = ({ onAddSource }) => {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [url, setUrl] = useState('');
  const [tipo, setTipo] = useState<TipoBando>('altro');
  const [syncWithN8n, setSyncWithN8n] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'adding' | 'success' | 'error'>('idle');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string>(localStorage.getItem('n8nWebhookUrl') || '');
  
  useEffect(() => {
    const storedWebhookUrl = localStorage.getItem('n8nWebhookUrl');
    if (storedWebhookUrl) {
      setWebhookUrl(storedWebhookUrl);
    } else {
      setShowConfigDialog(true);
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !url || !tipo) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi richiesti",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    try {
      new URL(url);
    } catch (err) {
      toast({
        title: "URL non valido",
        description: "Inserisci un URL nel formato corretto",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (syncWithN8n) {
      const webhookUrl = localStorage.getItem('n8nWebhookUrl');
      
      if (!webhookUrl) {
        toast({
          title: "Configurazione incompleta",
          description: "Configura prima l'URL del webhook n8n",
          variant: "destructive",
          duration: 3000,
        });
        setShowConfigDialog(true);
        return;
      }
      
      console.log("Webhook URL configurato:", webhookUrl);
    }

    const newFonte: Omit<Fonte, 'id'> = {
      nome,
      url,
      tipo
    };
    
    setIsAdding(true);
    setErrorDetails('');
    
    try {
      console.log("Tentativo di aggiunta fonte:", newFonte);
      
      const success = await onAddSource(newFonte);
      
      if (!success) {
        setIsAdding(false);
        return;
      }
      
      if (syncWithN8n) {
        setWebhookStatus('adding');
        try {
          console.log("Tentativo di sincronizzare con n8n:", newFonte);
          const fonte: Fonte = { id: 'temp-' + Date.now(), ...newFonte };
          console.log("Payload completo da inviare a n8n:", fonte);
          const webhookSuccess = await WebhookService.sendToWebhook(fonte, 'add');
          console.log("Risultato sincronizzazione con n8n:", webhookSuccess);
          setWebhookStatus(webhookSuccess ? 'success' : 'error');
          
          if (!webhookSuccess) {
            toast({
              title: "Attenzione",
              description: "La fonte è stata salvata nel database ma non è stata sincronizzata con n8n. Controlla la configurazione del webhook.",
              variant: "default",
            });
          } else {
            toast({
              title: "Sincronizzazione completata",
              description: "La fonte è stata sincronizzata con successo con n8n.",
              duration: 3000,
            });
          }
        } catch (webhookError) {
          console.error("Errore specifico di n8n:", webhookError);
          setWebhookStatus('error');
          setErrorDetails(webhookError instanceof Error ? webhookError.message : 'Errore durante la comunicazione con n8n');
          toast({
            title: "Errore n8n",
            description: "Si è verificato un errore nella sincronizzazione con n8n. La fonte è stata salvata solo localmente.",
            variant: "destructive",
          });
        }
      }
      
      setNome('');
      setUrl('');
      setTipo('altro');
      
      toast({
        title: "Fonte aggiunta",
        description: "La fonte è stata aggiunta con successo al database",
        duration: 3000,
      });
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio della fonte",
        variant: "destructive",
        duration: 3000,
      });
      if (syncWithN8n) {
        setWebhookStatus('error');
        setErrorDetails(error instanceof Error ? error.message : 'Errore sconosciuto');
      }
    } finally {
      setIsAdding(false);
      if (webhookStatus !== 'idle') {
        setTimeout(() => {
          setWebhookStatus('idle');
          setErrorDetails('');
        }, 30000);
      }
    }
  };

  const handleConfigureClick = () => {
    setShowConfigDialog(true);
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "URL non configurato",
        description: "Configura prima l'URL del webhook n8n",
        variant: "destructive",
        duration: 3000,
      });
      setShowConfigDialog(true);
      return;
    }

    setWebhookStatus('adding');
    
    try {
      console.log("Test webhook n8n...");
      const success = await WebhookService.testWebhook(webhookUrl);
      setWebhookStatus(success ? 'success' : 'error');
      
      if (success) {
        toast({
          title: "Test completato",
          description: "Il test con n8n è stato completato con successo.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Errore test",
          description: "Il test con n8n ha riscontrato problemi. Verifica la configurazione.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Errore durante il test webhook:", error);
      setWebhookStatus('error');
      setErrorDetails(error instanceof Error ? error.message : 'Errore durante il test');
      toast({
        title: "Errore test",
        description: "Si è verificato un errore durante il test con n8n",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setTimeout(() => {
        setWebhookStatus('idle');
        setErrorDetails('');
      }, 10000);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aggiungi Nuova Fonte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SourceFormFields
            nome={nome}
            setNome={setNome}
            url={url}
            setUrl={setUrl}
            tipo={tipo}
            setTipo={(value: string) => setTipo(value as TipoBando)}
          />
          
          <ExternalIntegrationToggle
            checked={syncWithN8n}
            onCheckedChange={setSyncWithN8n}
            onConfigureClick={handleConfigureClick}
            integrationType="n8n"
          />
          
          {syncWithN8n && webhookUrl && (
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={handleTestWebhook}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                Testa connessione n8n
              </button>
            </div>
          )}
          
          {webhookStatus === 'adding' && (
            <div className="flex items-center space-x-2 text-yellow-600 p-2 bg-yellow-50 rounded border border-yellow-200">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sincronizzazione con n8n in corso...</span>
            </div>
          )}
          
          {webhookStatus === 'success' && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Successo</AlertTitle>
              <AlertDescription>
                La fonte è stata sincronizzata con successo con n8n.
              </AlertDescription>
            </Alert>
          )}
          
          {webhookStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  Si è verificato un errore durante la sincronizzazione con n8n.
                  Verifica che l'URL del webhook sia corretto e che n8n sia in esecuzione.
                </p>
                {errorDetails && (
                  <div className="font-mono text-xs bg-red-950 text-white p-2 rounded overflow-auto max-h-24">
                    {errorDetails}
                  </div>
                )}
                <p className="text-sm font-semibold">Checklist:</p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Verifica che n8n sia in esecuzione</li>
                  <li>Controlla che il workflow sia attivo (interruttore in alto a destra)</li>
                  <li>Assicurati che il webhook sia configurato per accettare richieste POST</li>
                  <li>Verifica che l'URL del webhook sia corretto</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <SubmitButton isAdding={isAdding} />
        </form>

        <N8nWebhookConfigDialog
          open={showConfigDialog}
          onOpenChange={setShowConfigDialog}
          webhookUrl={webhookUrl}
          setWebhookUrl={setWebhookUrl}
        />
      </CardContent>
    </Card>
  );
};

export default AddSourceForm;
