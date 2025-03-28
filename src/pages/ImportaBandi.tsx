
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileSpreadsheet, ArrowRight, AlertCircle } from 'lucide-react';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { Bando } from '@/types';
import SupabaseBandiService from '@/utils/SupabaseBandiService';

const ImportaBandi = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [googleSheetUrl, setGoogleSheetUrl] = useState(GoogleSheetsService.getSheetUrl() || '');
  const [isLoading, setIsLoading] = useState(false);
  const [bandiAnteprima, setBandiAnteprima] = useState<Bando[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const handleImportBandi = async () => {
    if (!googleSheetUrl) {
      toast({
        title: "URL mancante",
        description: "Inserisci l'URL del foglio Google Sheets",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Iniziando importazione da:', googleSheetUrl);
      GoogleSheetsService.setSheetUrl(googleSheetUrl);
      
      const bandi = await GoogleSheetsService.fetchBandiFromSheet(googleSheetUrl);
      console.log('Bandi ottenuti dal foglio:', bandi?.length);
      
      if (!bandi || bandi.length === 0) {
        setError("Nessun bando trovato nel foglio Google Sheets. Verifica che il formato sia corretto.");
        toast({
          title: "Nessun dato trovato",
          description: "Nessun bando trovato nel foglio. Verifica che il formato sia corretto.",
          variant: "destructive",
        });
      } else {
        // Salva in sessionStorage
        sessionStorage.setItem('bandiImportati', JSON.stringify(bandi));
        console.log('Bandi salvati in sessionStorage:', bandi.length);
        
        // Salva in Supabase
        let contatoreSalvati = 0;
        for (const bando of bandi) {
          // Verifichiamo che i campi obbligatori siano presenti
          if (!bando.titolo || !bando.fonte) {
            console.warn('Bando senza titolo o fonte, saltato:', bando);
            continue;
          }
          
          // Verifichiamo che il bando abbia un ID valido
          if (!bando.id) {
            console.log('Bando senza ID, generando uno nuovo');
          }
          
          const success = await SupabaseBandiService.saveBando(bando);
          if (success) {
            contatoreSalvati++;
          } else {
            console.error('Errore nel salvataggio del bando in Supabase:', bando.titolo);
          }
        }
        
        console.log(`Bandi salvati in Supabase: ${contatoreSalvati}/${bandi.length}`);
        
        setBandiAnteprima(bandi.slice(0, 5));
        
        toast({
          title: "Importazione completata",
          description: `Importati ${bandi.length} bandi dal foglio Google Sheets (${contatoreSalvati} salvati in Supabase)`,
        });
        
        setTimeout(() => {
          navigate('/match');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Errore dettagliato durante l\'importazione:', error);
      setError(error.message || "Errore durante l'importazione");
      toast({
        title: "Errore di importazione",
        description: error.message || "Si è verificato un errore durante l'importazione",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Importa Bandi da Google Sheets</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-500" />
            <CardTitle>Importa Bandi da Google Sheets</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="googleSheetUrl">URL del foglio Google Sheets</Label>
              <Input
                id="googleSheetUrl"
                placeholder="Es. https://docs.google.com/spreadsheets/d/..."
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleImportBandi} 
              disabled={isLoading || !googleSheetUrl} 
              className="w-full"
            >
              {isLoading ? 'Importazione bandi in corso...' : 'Importa Bandi e vai al Match'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
            
            {bandiAnteprima.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="font-medium">Anteprima bandi importati</h3>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left">Titolo</th>
                        <th className="px-4 py-3 text-left">Fonte</th>
                        <th className="px-4 py-3 text-left">Tipo</th>
                        <th className="px-4 py-3 text-left">Scadenza</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bandiAnteprima.map((bando, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-3">{bando.titolo}</td>
                          <td className="px-4 py-3">{bando.fonte}</td>
                          <td className="px-4 py-3">{bando.tipo}</td>
                          <td className="px-4 py-3">{bando.scadenza}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 italic">
                  Visualizzazione dei primi 5 record importati.
                </p>
              </div>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportaBandi;
