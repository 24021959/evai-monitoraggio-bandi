import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import SupabaseMatchService from '@/utils/SupabaseMatchService';
import SupabaseReportService from '@/utils/SupabaseReportService';
import { format } from 'date-fns';

const Report = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isDownloadingBandi, setIsDownloadingBandi] = useState(false);
  const [isDownloadingMatch, setIsDownloadingMatch] = useState(false);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Date non valide",
        description: "Seleziona un intervallo di date valido",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Intervallo non valido",
        description: "La data di inizio deve essere precedente alla data di fine",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingReport(true);

    try {
      // Call Supabase report generation
      await SupabaseReportService.generateReport(startDate, endDate);
      
      toast({
        title: "Report generato",
        description: "Il report è stato generato con successo",
      });
    } catch (error) {
      console.error("Errore nella generazione del report:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la generazione del report",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const downloadBandiCSV = async () => {
    setIsDownloadingBandi(true);
    
    try {
      const csvContent = await SupabaseBandiService.generateBandiCSV();
      
      if (!csvContent) {
        throw new Error("Non è stato possibile generare il CSV dei bandi");
      }
      
      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `bandi_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download completato",
        description: "Il file CSV dei bandi è stato scaricato con successo",
      });
    } catch (error) {
      console.error("Errore nel download del CSV dei bandi:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il download del CSV dei bandi",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingBandi(false);
    }
  };

  const downloadMatchCSV = async () => {
    setIsDownloadingMatch(true);
    
    try {
      const csvContent = await SupabaseMatchService.generateMatchCSV();
      
      if (!csvContent) {
        throw new Error("Non è stato possibile generare il CSV dei match");
      }
      
      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `match_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download completato",
        description: "Il file CSV dei match è stato scaricato con successo",
      });
    } catch (error) {
      console.error("Errore nel download del CSV dei match:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il download del CSV dei match",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingMatch(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Report e Statistiche</h1>
      
      <Tabs defaultValue="download" className="w-full">
        <TabsList className="grid grid-cols-2 w-60">
          <TabsTrigger value="download">Download Dati</TabsTrigger>
          <TabsTrigger value="report">Reportistica</TabsTrigger>
        </TabsList>
        
        <TabsContent value="download" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Esporta Dati</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border border-gray-200">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-medium">Bandi</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Scarica tutti i bandi presenti nel sistema in formato CSV
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                      onClick={downloadBandiCSV}
                      disabled={isDownloadingBandi}
                    >
                      <Download className="h-4 w-4" />
                      {isDownloadingBandi ? 'Download in corso...' : 'Scarica CSV Bandi'}
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-4 border border-gray-200">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-medium">Match</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Scarica tutti i match tra bandi e clienti in formato CSV
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2"
                      onClick={downloadMatchCSV}
                      disabled={isDownloadingMatch}
                    >
                      <Download className="h-4 w-4" />
                      {isDownloadingMatch ? 'Download in corso...' : 'Scarica CSV Match'}
                    </Button>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genera Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Seleziona un intervallo di date per generare un report dettagliato su bandi e match
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Inizio</label>
                  <DatePicker 
                    date={startDate} 
                    setDate={setStartDate} 
                    className="w-full" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Fine</label>
                  <DatePicker 
                    date={endDate} 
                    setDate={setEndDate} 
                    className="w-full" 
                  />
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={generateReport}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? 'Generazione in corso...' : 'Genera Report'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Report;
