
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, Database, Wrench, AlertCircle, HelpCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ConfigScraping = () => {
  const navigate = useNavigate();

  const handleGoToImport = () => {
    navigate('/importa-scraping');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Importazione Dati</h1>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <FileSpreadsheet className="h-4 w-4 text-blue-500" />
        <AlertTitle>Importazione da Google Sheets</AlertTitle>
        <AlertDescription>
          Importa i risultati dello scraping dal tuo foglio Google Sheets per fare il match con i clienti.
          <div className="mt-4">
            <Button onClick={handleGoToImport} className="bg-blue-500 hover:bg-blue-600">
              Vai all'importazione
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      
      <Alert className="bg-amber-50 border-amber-200">
        <HelpCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle>Formato Dati Richiesto</AlertTitle>
        <AlertDescription>
          Il foglio Google Sheets deve contenere le seguenti colonne:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>data_scraping: Data di estrazione</li>
            <li>titolo_incentivo: Titolo del bando</li>
            <li>fonte: Fonte del bando (es. MIMIT, UE)</li>
            <li>descrizione: Breve descrizione</li>
            <li>url_dettaglio: URL completo del bando</li>
            <li>descrizione_dettagliata: Dettagli completi</li>
            <li>requisiti: Requisiti di partecipazione</li>
            <li>scadenza_dettagliata: Data di scadenza</li>
            <li>budget_disponibile: Importo del finanziamento</li>
          </ul>
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                <CardTitle>Importazione Dati</CardTitle>
              </div>
              <CardDescription>
                Importa i dati dei bandi dal tuo foglio Google Sheets per trovare match con i tuoi clienti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Il sistema è configurato per importare dati direttamente da Google Sheets. Questo permette di:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Importare bandi già estratti con strumenti esterni come n8n</li>
                <li>Mantenere i dati in un formato facile da gestire</li>
                <li>Aggiornare rapidamente i bandi disponibili</li>
                <li>Trovare automaticamente corrispondenze con i tuoi clienti</li>
              </ul>
              <div className="mt-6">
                <Button onClick={handleGoToImport} className="w-full bg-blue-500 hover:bg-blue-600">
                  Importa da Google Sheets
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                <CardTitle>Configurazione Match</CardTitle>
              </div>
              <CardDescription>
                Configura il sistema di match tra bandi e clienti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Il sistema utilizza tecnologie avanzate di NLP per trovare automaticamente
                corrispondenze tra i bandi importati e i profili dei clienti.
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-gray-600">
                <li>Analisi automatica di importi e scadenze</li>
                <li>Classificazione dei bandi per settore</li>
                <li>Rilevamento dei requisiti di accesso</li>
                <li>Match con i profili dei clienti</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                <CardTitle>Fonti Raccomandate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Ecco alcune fonti ufficiali consigliate per i bandi di finanziamento:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-0.5">UE</span>
                  <div>
                    <p className="font-medium">Portale Funding & Tenders UE</p>
                    <p className="text-gray-600">ec.europa.eu/info/funding-tenders</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-0.5">IT</span>
                  <div>
                    <p className="font-medium">Ministero Imprese</p>
                    <p className="text-gray-600">mimit.gov.it/incentivi-mise</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full mt-0.5">REG</span>
                  <div>
                    <p className="font-medium">Portali regionali</p>
                    <p className="text-gray-600">Siti delle singole regioni</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-purple-500" />
                <CardTitle>Personalizzazione</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Per migliorare la qualità dei match, puoi personalizzare i filtri di matching:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-gray-600">
                <li>Definisci parole chiave specifiche per settore</li>
                <li>Imposta soglie di importi per i tuoi clienti</li>
                <li>Configura notifiche per nuovi bandi rilevanti</li>
                <li>Escludi tipologie di bandi non pertinenti</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConfigScraping;
