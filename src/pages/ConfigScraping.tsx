
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CrawlForm } from '@/components/CrawlForm';
import { Settings, Database, Wrench, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ConfigScraping = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurazione Scraping</h1>
      </div>
      
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle>Estrazione da MIMIT</AlertTitle>
        <AlertDescription>
          Per estrarre i bandi dal Ministero delle Imprese e del Made in Italy, usa questo URL:
          <code className="block mt-2 p-2 bg-gray-100 rounded text-sm font-mono overflow-auto">
            https://www.mimit.gov.it/index.php/it/incentivi-mise/incentivi-in-evidenza
          </code>
          Il sistema esplorerà anche le pagine collegate per trovare i bandi di finanziamento.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CrawlForm />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                <CardTitle>Configurazione Scraping</CardTitle>
              </div>
              <CardDescription>
                Configura il sistema di estrazione dei bandi da fonti online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Il sistema utilizza tecnologie avanzate di web scraping e NLP per estrarre automaticamente
                informazioni sui bandi da diverse fonti online.
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-gray-600">
                <li>Estrazione automatica di importi e scadenze</li>
                <li>Classificazione dei bandi per settore</li>
                <li>Rilevamento dei requisiti di accesso</li>
                <li>Monitoraggio continuo delle fonti per aggiornamenti</li>
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
                Per migliorare la qualità dei match, puoi personalizzare i filtri di estrazione e matching:
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
