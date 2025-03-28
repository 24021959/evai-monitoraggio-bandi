
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BandiService } from '@/utils/BandiService';
import { ClienteService } from '@/utils/ClienteService';
import { Bando, Cliente } from '@/types';
import SupabaseMatchService from '@/utils/SupabaseMatchService';

const Report = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return lastMonth;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [clienteId, setClienteId] = useState<string | undefined>(undefined);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [bandi, setBandi] = useState<Bando[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClienti = async () => {
      try {
        const clientiData = await ClienteService.getClienti();
        setClienti(clientiData);
      } catch (error) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore nel caricamento dei clienti",
          variant: "destructive",
        });
      }
    };

    fetchClienti();
  }, [toast]);

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Errore",
        description: "Seleziona un intervallo di date valido",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      const bandiData = await BandiService.getBandiByDateRange(formattedStartDate, formattedEndDate);
      setBandi(bandiData);

      let matchesData = await SupabaseMatchService.getMatchesByDateRange(formattedStartDate, formattedEndDate, clienteId);
      if (clienteId) {
        matchesData = matchesData.filter(match => match.clienteId === clienteId);
      }
      setMatches(matchesData);
      
      toast({
        title: "Report generato",
        description: "I dati sono stati recuperati con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella generazione del report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (bandi.length === 0 && matches.length === 0) {
      toast({
        title: "Nessun dato",
        description: "Genera prima il report",
        variant: "destructive",
      });
      return;
    }

    try {
      const bandiCSV = SupabaseMatchService.generateBandiCSV(bandi);
      const matchCSV = SupabaseMatchService.generateMatchesCSV(matches);

      downloadCSV(bandiCSV, 'bandi_report.csv');
      downloadCSV(matchCSV, 'matches_report.csv');

      toast({
        title: "Download completato",
        description: "I report CSV sono stati scaricati",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il download dei report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Genera Report</CardTitle>
          <CardDescription>Seleziona i parametri per generare il report e scarica i dati in formato CSV.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Data Inizio</Label>
              <div className="w-full relative">
                <input
                  type="date"
                  id="startDate"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="endDate">Data Fine</Label>
              <div className="w-full relative">
                <input
                  type="date"
                  id="endDate"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="cliente">Cliente (opzionale)</Label>
            <Select onValueChange={(value) => setClienteId(value === "" ? undefined : value)}>
              <SelectTrigger id="cliente">
                <SelectValue placeholder="Tutti i clienti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tutti i clienti</SelectItem>
                {clienti.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={generateReport} disabled={loading}>
              {loading ? (
                <>
                  Caricamento...
                </>
              ) : (
                "Genera Report"
              )}
            </Button>
            <Button 
              variant="secondary" 
              onClick={downloadReport} 
              disabled={loading || (bandi.length === 0 && matches.length === 0)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Scarica CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Report;
