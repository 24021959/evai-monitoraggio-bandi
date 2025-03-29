
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { GoogleSheetsService } from '@/utils/GoogleSheetsService';
import { Bando } from "@/types";
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SupabaseBandiService from '@/utils/SupabaseBandiService';

const ImportaBandi = () => {
  const { toast } = useToast();
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [bandi, setBandi] = useState<Bando[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedScope, setSelectedScope] = useState<string>('bandi');

  const handleImport = async () => {
    if (!sheetsUrl) {
      toast({
        title: "URL mancante",
        description: "Inserisci l'URL del foglio Google Sheets",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Recupera i dati dal foglio Google Sheets
      const data = await GoogleSheetsService.fetchGoogleSheetsData(sheetsUrl, selectedScope);
      
      if (!data || data.length === 0) {
        toast({
          title: "Nessun dato",
          description: "Non sono stati trovati dati nel foglio",
          variant: "destructive",
        });
        return;
      }
      
      // Mappa i dati nel formato Bando
      const mappedBandi = GoogleSheetsService.mapRowsToBandi(data);
      setBandi(mappedBandi);
      
      // Importa i bandi in Supabase e genera match automaticamente
      const result = await SupabaseBandiService.importBandi(mappedBandi);
      
      if (result.success) {
        toast({
          title: "Importazione completata",
          description: `Importati ${result.count} nuovi bandi e generati ${result.matchCount} nuovi match`,
        });
        
        // Naviga alla pagina dei match se sono stati generati match
        if (result.matchCount > 0) {
          setTimeout(() => {
            navigate('/match');
          }, 2000);
        }
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'importazione",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'importazione",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Importa Bandi da Google Sheets</CardTitle>
          <CardDescription>
            Inserisci l'URL del tuo foglio Google Sheets per importare i bandi.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sheetsUrl">URL del foglio Google Sheets</Label>
            <Input
              type="text"
              id="sheetsUrl"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="scope">Seleziona Scope</Label>
            <Select onValueChange={setSelectedScope} defaultValue={selectedScope}>
              <SelectTrigger id="scope">
                <SelectValue placeholder="Seleziona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bandi">Bandi</SelectItem>
                {/* <SelectItem value="fonti">Fonti</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleImport} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white">
            {isLoading ? "Importando..." : "Importa"}
          </Button>
          {bandi.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Anteprima Bandi</h3>
              <ul>
                {bandi.slice(0, 5).map((bando) => (
                  <li key={bando.id} className="truncate">
                    {bando.titolo}
                  </li>
                ))}
              </ul>
              {bandi.length > 5 && <p>...e altri {bandi.length - 5} bandi</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportaBandi;
