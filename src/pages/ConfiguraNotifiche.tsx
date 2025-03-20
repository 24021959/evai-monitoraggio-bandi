
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft } from "lucide-react";

const ConfiguraNotifiche = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [templateName, setTemplateName] = useState('');
  const [oggetto, setOggetto] = useState('Nuova opportunità di finanziamento');
  const [contenuto, setContenuto] = useState(
    'Gentile cliente,\n\nAbbiamo individuato un\'opportunità di finanziamento che potrebbe essere interessante per la vostra azienda.\n\nBando: [NOME_BANDO]\nScadenza: [SCADENZA_BANDO]\nCompatibilità stimata: [COMPATIBILITA]%\n\nPer maggiori informazioni, non esitate a contattarci.\n\nCordiali saluti,\nIl team di Firecrawl'
  );

  const handleSalvaTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un nome per il template",
        duration: 3000
      });
      return;
    }

    // In una implementazione reale, qui salveremmo il template nel database
    // Per ora, mostriamo solo un toast di conferma
    toast({
      title: "Template salvato",
      description: `Il template "${templateName}" è stato salvato con successo`,
      duration: 3000
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/match')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Configura Notifiche</h1>
        </div>
        <Button 
          onClick={handleSalvaTemplate}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Salva Template
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Template Notifica Email</CardTitle>
          <CardDescription>
            Configura il template che verrà utilizzato per inviare notifiche ai clienti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Nome Template</Label>
              <Input 
                id="templateName"
                placeholder="es. Notifica Standard Bandi"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="oggetto">Oggetto Email</Label>
              <Input 
                id="oggetto"
                placeholder="Oggetto della email"
                value={oggetto}
                onChange={(e) => setOggetto(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contenuto">Contenuto Email</Label>
              <Textarea 
                id="contenuto"
                placeholder="Contenuto della email"
                value={contenuto}
                onChange={(e) => setContenuto(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-sm text-gray-500">
                Puoi utilizzare i seguenti placeholder che verranno sostituiti automaticamente:
              </p>
              <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
                <li>[NOME_CLIENTE] - Nome del cliente</li>
                <li>[NOME_BANDO] - Titolo del bando</li>
                <li>[SCADENZA_BANDO] - Data di scadenza del bando</li>
                <li>[COMPATIBILITA] - Percentuale di compatibilità</li>
                <li>[LINK_BANDO] - Link al bando</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Template Salvati</CardTitle>
          <CardDescription>
            I tuoi template salvati per le notifiche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Nessun template salvato. Salva il template corrente per vederlo qui.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguraNotifiche;
