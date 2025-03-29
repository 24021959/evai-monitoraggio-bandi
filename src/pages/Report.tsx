
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  SelectValue, 
  SelectTrigger, 
  SelectItem, 
  SelectContent, 
  Select 
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  DownloadCloud, 
  BarChart4, 
  PieChart 
} from "lucide-react";
import SupabaseBandiService from "@/utils/SupabaseBandiService";
import SupabaseMatchService from "@/utils/SupabaseMatchService";
import { format } from 'date-fns';

const ReportPage = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>("bandi");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const handleGenerateReport = async () => {
    if (!dateFrom || !dateTo) {
      toast({
        title: "Date mancanti",
        description: "Per favore seleziona sia una data di inizio che una data di fine",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure dateTo is greater than or equal to dateFrom
    if (dateFrom > dateTo) {
      toast({
        title: "Intervallo non valido",
        description: "La data di fine deve essere successiva o uguale alla data di inizio",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      let csvContent = "";
      
      if (reportType === "bandi") {
        // Get all bandi
        const bandi = await SupabaseBandiService.getBandi();
        
        // Filter by date range if needed
        const filteredBandi = bandi.filter(bando => {
          const bandiDate = bando.dataEstrazione 
            ? new Date(bando.dataEstrazione) 
            : new Date(bando.scadenza);
          
          return bandiDate >= dateFrom && bandiDate <= dateTo;
        });
        
        // Generate CSV
        csvContent = SupabaseBandiService.generateBandiCSV(filteredBandi);
        
        // Download
        downloadCSV(csvContent, `report_bandi_${format(dateFrom, 'yyyy-MM-dd')}_${format(dateTo, 'yyyy-MM-dd')}.csv`);
      } else if (reportType === "match") {
        // Get matches in date range
        const matches = await SupabaseMatchService.getMatchesByDateRange(
          dateFrom.toISOString(),
          dateTo.toISOString()
        );
        
        // Generate CSV
        csvContent = SupabaseMatchService.generateMatchesCSV(matches);
        
        // Download
        downloadCSV(csvContent, `report_match_${format(dateFrom, 'yyyy-MM-dd')}_${format(dateTo, 'yyyy-MM-dd')}.csv`);
      }
      
      toast({
        title: "Report generato",
        description: "Il report è stato generato e scaricato con successo",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella generazione del report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Report</h1>
        <p className="text-gray-500">Genera report personalizzati sui dati del sistema</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Genera Nuovo Report</CardTitle>
          <CardDescription>Seleziona i parametri per generare un report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reportType">Tipo di Report</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Seleziona tipo di report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bandi">Report Bandi</SelectItem>
                  <SelectItem value="match">Report Match</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dateFrom">Data Inizio</Label>
              <DatePicker
                id="dateFrom"
                date={dateFrom}
                onDateChange={setDateFrom}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="dateTo">Data Fine</Label>
              <DatePicker
                id="dateTo"
                date={dateTo}
                onDateChange={setDateTo}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating || !dateFrom || !dateTo}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isGenerating ? (
                <>Generazione in corso...</>
              ) : (
                <>
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Genera e Scarica
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart4 className="mr-2 h-5 w-5 text-blue-500" />
              Report Bandi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Genera un report sui bandi disponibili in un determinato periodo. Il report includerà:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Elenco completo dei bandi nel periodo selezionato</li>
              <li>Dettagli su importi, scadenze e settori</li>
              <li>Statistiche sui tipi di bandi disponibili</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-green-500" />
              Report Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              Genera un report sui match tra bandi e clienti in un determinato periodo. Il report includerà:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Elenco completo dei match generati nel periodo</li>
              <li>Percentuali di compatibilità per ogni match</li>
              <li>Dettagli su clienti e bandi corrispondenti</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportPage;
