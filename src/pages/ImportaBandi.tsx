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
import { v4 as uuidv4 } from 'uuid';

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
      // Mock implementation for fetchGoogleSheetsData until the real implementation is available
      const fetchSheetData = async (url: string, scope: string) => {
        console.log(`Fetching data from ${url} for scope ${scope}`);
        // Return mock data for demonstration
        return [
          ['Titolo Bando 1', 'Descrizione 1', 'europeo', 'Settore1,Settore2', '2024-12-31', '50000', '100000', 'https://example.com/1'],
          ['Titolo Bando 2', 'Descrizione 2', 'statale', 'Settore3', '2024-11-30', '20000', '80000', 'https://example.com/2'],
        ];
      };

      // Mock implementation for mapRowsToBandi until the real implementation is available
      const mapSheetDataToBandi = (rows: any[]): Bando[] => {
        return rows.map((row, index) => ({
          id: uuidv4(),
          titolo: row[0] || `Bando ${index + 1}`,
          descrizione: row[1] || '',
          tipo: (row[2] || 'altro') as 'europeo' | 'statale' | 'regionale' | 'altro',
          settori: (row[3] || '').split(',').map((s: string) => s.trim()).filter(Boolean),
          scadenza: row[4] || new Date().toISOString().split('T')[0],
          importoMin: parseInt(row[5]) || 0,
          importoMax: parseInt(row[6]) || 0,
          url: row[7] || '',
          fonte: 'Google Sheets Import'
        }));
      };
      
      // Fetch data from Google Sheets
      const data = await fetchSheetData(sheetsUrl, selectedScope);
      
      if (!data || data.length === 0) {
        toast({
          title: "Nessun dato",
          description: "Non sono stati trovati dati nel foglio",
          variant: "destructive",
        });
        return;
      }
      
      // Map the data to Bando format
      const mappedBandi = mapSheetDataToBandi(data);
      setBandi(mappedBandi);
      
      // Import the bandi to Supabase and generate matches automatically
      const result = await SupabaseBandiService.importBandi(mappedBandi);
      
      if (result.success) {
        toast({
          title: "Importazione completata",
          description: `Importati ${result.count} nuovi bandi e generati ${result.matchCount} nuovi match`,
        });
        
        // Navigate to the match page if matches were generated
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
