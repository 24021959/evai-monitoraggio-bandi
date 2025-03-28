
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, PieChart, FileText } from 'lucide-react';
import ChartContainer from '@/components/ChartContainer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import SupabaseClientiService from '@/utils/SupabaseClientiService';
import SupabaseMatchService from '@/utils/SupabaseMatchService';
import MatchService from '@/utils/MatchService';

const Report = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bandiData, setBandiData] = useState([]);
  const [clientiData, setClientiData] = useState([]);
  const [matchesData, setMatchesData] = useState([]);
  const [statistiche, setStatistiche] = useState({
    distribuzioneBandi: {
      europei: 0,
      statali: 0,
      regionali: 0,
    },
    bandoPerSettore: [],
    matchPerCliente: []
  });
  
  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch bandi
        const bandi = await SupabaseBandiService.getBandi();
        setBandiData(bandi);
        
        // Fetch clienti
        const clienti = await SupabaseClientiService.getClienti();
        setClientiData(clienti);
        
        // Fetch matches
        const matches = await SupabaseMatchService.getMatches();
        setMatchesData(matches);
        
        // Generate statistics
        generateStatistics(bandi, clienti, matches);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore nel caricamento dei dati",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Generate statistics from real data
  const generateStatistics = (bandi, clienti, matches) => {
    // Distribuzione bandi per tipo
    const distribuzioneBandi = {
      europei: bandi.filter(b => b.tipo === 'europeo').length,
      statali: bandi.filter(b => b.tipo === 'statale').length,
      regionali: bandi.filter(b => b.tipo === 'regionale').length,
    };
    
    // Count bandi per settore
    const settoriMap = new Map();
    bandi.forEach(bando => {
      if (bando.settori && Array.isArray(bando.settori)) {
        bando.settori.forEach(settore => {
          const count = settoriMap.get(settore) || 0;
          settoriMap.set(settore, count + 1);
        });
      }
    });
    
    // Convert to array and calculate percentages
    const bandoPerSettore = Array.from(settoriMap.entries())
      .map(([settore, count]) => ({
        settore,
        percentuale: Math.round((count / bandi.length) * 100)
      }))
      .sort((a, b) => b.percentuale - a.percentuale)
      .slice(0, 8); // Take top 8 sectors
    
    // Match per cliente
    const clientiMatchMap = new Map();
    matches.forEach(match => {
      const clienteId = match.cliente.id;
      const count = clientiMatchMap.get(clienteId) || 0;
      clientiMatchMap.set(clienteId, count + 1);
    });
    
    // Convert to array and calculate percentages
    const matchPerCliente = Array.from(clientiMatchMap.entries())
      .map(([clienteId, count]) => {
        const cliente = clienti.find(c => c.id === clienteId) || { nome: 'N/D' };
        return {
          cliente: cliente.nome,
          percentuale: Math.round((count / matches.length) * 100)
        };
      })
      .sort((a, b) => b.percentuale - a.percentuale)
      .slice(0, 5); // Take top 5 clients
    
    setStatistiche({
      distribuzioneBandi,
      bandoPerSettore,
      matchPerCliente
    });
  };
  
  // Funzione per scaricare CSV dei bandi attivi
  const handleDownloadBandiCSV = () => {
    if (bandiData.length === 0) {
      toast({
        title: "Nessun dato disponibile",
        description: "Non ci sono bandi da esportare",
        variant: "destructive"
      });
      return;
    }
    
    const headers = ['ID', 'Titolo', 'Fonte', 'Tipo', 'Settori', 'Importo Minimo', 'Importo Massimo', 'Scadenza', 'Descrizione'];
    
    // Preparazione dati
    const csvRows = [
      headers.join(','), // Intestazioni
      // Righe con i dati
      ...bandiData.map(bando => [
        bando.id,
        `"${bando.titolo ? bando.titolo.replace(/"/g, '""') : ''}"`,
        `"${bando.fonte || ''}"`,
        bando.tipo || '',
        `"${Array.isArray(bando.settori) ? bando.settori.join('; ') : ''}"`,
        bando.importoMin || '',
        bando.importoMax || '',
        bando.scadenza || '',
        `"${(bando.descrizione || '').replace(/"/g, '""')}"`
      ].join(','))
    ];
    
    // Creazione del file CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Crea elemento a per il download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bandi_attivi_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download completato",
      description: "File CSV dei bandi attivi scaricato con successo",
    });
  };
  
  // Funzione per scaricare CSV dei match bandi-clienti
  const handleDownloadMatchCSV = () => {
    if (matchesData.length === 0) {
      toast({
        title: "Nessun dato disponibile",
        description: "Non ci sono match da esportare",
        variant: "destructive"
      });
      return;
    }
    
    // Utilizziamo il metodo exportMatchesToCSV del MatchService
    const csvContent = MatchService.exportMatchesToCSV(matchesData);
    const filename = `match_bandi_clienti_${new Date().toISOString().slice(0, 10)}.csv`;
    
    // Utilizziamo il metodo downloadCSV del MatchService per avviare il download
    MatchService.downloadCSV(csvContent, filename);
    
    toast({
      title: "Download completato",
      description: `File "${filename}" scaricato con successo`,
    });
  };

  // Preparazione dati per grafico a torta distribuzione bandi
  const distribuzioneBandiData = [
    { name: 'Europei', value: statistiche.distribuzioneBandi.europei, color: '#3b82f6' },
    { name: 'Statali', value: statistiche.distribuzioneBandi.statali, color: '#22c55e' },
    { name: 'Regionali', value: statistiche.distribuzioneBandi.regionali, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Report e Analisi</h1>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <p>Caricamento in corso...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartContainer title="Distribuzione Bandi per Settore">
              <div className="h-80">
                {statistiche.bandoPerSettore.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statistiche.bandoPerSettore}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="settore" type="category" width={80} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentuale']} />
                      <Bar dataKey="percentuale" fill="#3b82f6" barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Nessun dato disponibile
                  </div>
                )}
              </div>
            </ChartContainer>
            
            <ChartContainer title="Match per Cliente">
              <div className="h-80">
                {statistiche.matchPerCliente.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={statistiche.matchPerCliente}
                        nameKey="cliente"
                        dataKey="percentuale"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statistiche.matchPerCliente.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentuale']} />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Nessun dato disponibile
                  </div>
                )}
              </div>
            </ChartContainer>
          </div>
          
          <h2 className="text-xl font-semibold mt-8">Download Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <CardTitle>Report Bandi Attivi</CardTitle>
                </div>
                <CardDescription>
                  Scarica un file CSV con tutti i bandi attualmente attivi e le loro caratteristiche principali.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Il report include informazioni su:
                </p>
                <ul className="list-disc pl-5 space-y-1 mb-6">
                  <li>Titolo e descrizione del bando</li>
                  <li>Fonte e tipo di finanziamento</li>
                  <li>Importo minimo e massimo</li>
                  <li>Data di scadenza</li>
                  <li>Settori di applicazione</li>
                </ul>
                <Button 
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600"
                  onClick={handleDownloadBandiCSV}
                >
                  <Download className="h-4 w-4" />
                  Scarica CSV
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <CardTitle>Report Match Bandi-Clienti</CardTitle>
                </div>
                <CardDescription>
                  Scarica un file CSV con tutte le corrispondenze tra bandi e clienti con i punteggi di compatibilità.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Il report include informazioni su:
                </p>
                <ul className="list-disc pl-5 space-y-1 mb-6">
                  <li>Nome del cliente e bando corrispondente</li>
                  <li>Punteggio di compatibilità</li>
                  <li>Settori di applicazione</li>
                  <li>Stato della notifica</li>
                  <li>Data di scadenza del bando</li>
                </ul>
                <Button 
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600"
                  onClick={handleDownloadMatchCSV}
                >
                  <Download className="h-4 w-4" />
                  Scarica CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Report;
