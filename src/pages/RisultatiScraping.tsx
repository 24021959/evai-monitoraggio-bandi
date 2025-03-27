
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { FileSpreadsheet, Save, ArrowRight, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { FirecrawlService } from '@/utils/FirecrawlService';
import BandoCard from '@/components/BandoCard';
import { Bando } from '@/types';

const RisultatiScraping = () => {
  const navigate = useNavigate();
  const [bandi, setBandi] = useState<Bando[]>([]);
  const [bandiImportati, setBandiImportati] = useState<Bando[]>([]);
  const [visualizzazione, setVisualizzazione] = useState<'tabella' | 'cards'>('tabella');
  const [isLoading, setIsLoading] = useState(false);
  
  // Carica bandi estratti e importati
  useEffect(() => {
    console.log("RisultatiScraping: Componente montato, caricamento bandi");
    
    // Carica bandi estratti (dal processo di scraping)
    console.log("Iniziando caricamento dei bandi estratti...");
    const extractedBandi = FirecrawlService.getScrapedBandi();
    if (extractedBandi.length > 0) {
      console.log("Caricati bandi estratti, quantità:", extractedBandi.length);
      setBandi(extractedBandi);
    } else {
      console.log("Nessun bando estratto trovato in localStorage");
    }
    
    // Carica bandi importati da Google Sheets
    const importedBandiStr = sessionStorage.getItem('bandiImportati');
    if (importedBandiStr) {
      try {
        const parsedBandi = JSON.parse(importedBandiStr);
        console.log("Caricati bandi importati da Google Sheets, quantità:", parsedBandi.length);
        setBandiImportati(parsedBandi);
      } catch (error) {
        console.error("Errore nel parsing dei bandi importati:", error);
      }
    }
  }, []);
  
  const handleViewDetail = (id: string) => {
    navigate(`/bandi/${id}`);
  };
  
  const handleSaveBandi = async () => {
    if (bandi.length === 0 && bandiImportati.length === 0) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Salva sia i bandi estratti che quelli importati
      const allBandi = [...bandi, ...bandiImportati];
      
      if (allBandi.length > 0) {
        FirecrawlService.saveBandi(allBandi);
        console.log("Bandi salvati con successo:", allBandi.length);
        
        // Reindirizza alla pagina dei bandi
        navigate("/bandi");
      }
    } catch (error) {
      console.error("Errore durante il salvataggio dei bandi:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderBandiTable = () => {
    // Combina i bandi da entrambe le fonti
    const allBandi = [...bandi, ...bandiImportati];
    
    return (
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titolo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Settori</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scadenza</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allBandi.length > 0 ? (
              allBandi.map((bando) => (
                <tr key={bando.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{bando.titolo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{bando.fonte}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${bando.tipo === 'europeo' ? 'bg-blue-100 text-blue-800' : 
                        bando.tipo === 'statale' ? 'bg-green-100 text-green-800' : 
                        bando.tipo === 'regionale' ? 'bg-teal-100 text-teal-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {bando.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {bando.settori && bando.settori.slice(0, 2).join(', ')}
                      {bando.settori && bando.settori.length > 2 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {bando.scadenzaDettagliata || new Date(bando.scadenza).toLocaleDateString('it-IT')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {bando.budgetDisponibile || 
                        (bando.importoMax ? `fino a ${bando.importoMax / 1000}K` : 'N/D')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewDetail(bando.id)}
                    >
                      Dettagli
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Nessun bando disponibile
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderBandiCards = () => {
    // Combina i bandi da entrambe le fonti
    const allBandi = [...bandi, ...bandiImportati];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allBandi.length > 0 ? (
          allBandi.map((bando) => (
            <BandoCard 
              key={bando.id} 
              bando={bando} 
              onViewDetails={handleViewDetail}
              showFullDetails={true}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            Nessun bando disponibile
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Risultati Monitoraggio</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setVisualizzazione(v => v === 'tabella' ? 'cards' : 'tabella')}
          >
            {visualizzazione === 'tabella' ? 'Vista Schede' : 'Vista Tabella'}
          </Button>
          
          <Button 
            onClick={handleSaveBandi} 
            disabled={isLoading || (bandi.length === 0 && bandiImportati.length === 0)}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salva tutti i bandi
          </Button>
        </div>
      </div>
      
      {bandiImportati.length > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          <AlertTitle>Dati da Google Sheets</AlertTitle>
          <AlertDescription>
            Sono stati importati {bandiImportati.length} bandi dal foglio Google Sheets.
          </AlertDescription>
        </Alert>
      )}
      
      {bandi.length === 0 && bandiImportati.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nessun risultato</AlertTitle>
          <AlertDescription>
            Non sono stati trovati bandi estratti o importati. Prova a eseguire un'estrazione o un'importazione.
          </AlertDescription>
        </Alert>
      )}
      
      <div>
        {visualizzazione === 'tabella' ? renderBandiTable() : renderBandiCards()}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <CardTitle>Suggerimenti</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              I bandi estratti e importati non sono ancora stati salvati nel sistema. 
              Clicca su "Salva tutti i bandi" per renderli permanenti e poterli utilizzare per il match con i clienti.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/importa-scraping')}
              className="w-full flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Importa altri bandi da Google Sheets
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-500" />
              <CardTitle>Prossimi passi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">1</Badge>
                <span className="text-sm">Salva i bandi nel sistema</span>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">2</Badge>
                <span className="text-sm">Esegui il match con i profili dei clienti</span>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">3</Badge>
                <span className="text-sm">Invia notifiche ai clienti interessati</span>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/match')} 
              variant="default"
              className="w-full flex items-center justify-center gap-2"
            >
              Vai al Match
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RisultatiScraping;
