import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from 'lucide-react';
import ChartContainer from '@/components/ChartContainer';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import SupabaseClientiService from '@/utils/SupabaseClientiService';
import SupabaseMatchService from '@/utils/SupabaseMatchService';

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
    matchPerCliente: []
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const bandi = await SupabaseBandiService.getBandi();
        setBandiData(bandi);
        
        const clienti = await SupabaseClientiService.getClienti();
        setClientiData(clienti);
        
        const matches = await SupabaseMatchService.getMatches();
        setMatchesData(matches);
        
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
  
  const generateStatistics = (bandi, clienti, matches) => {
    const distribuzioneBandi = {
      europei: bandi.filter(b => b.tipo === 'europeo').length,
      statali: bandi.filter(b => b.tipo === 'statale').length,
      regionali: bandi.filter(b => b.tipo === 'regionale').length,
    };
    
    const clientiMatchMap = new Map();
    matches.forEach(match => {
      const clienteId = match.clienteId;
      if (clienteId) {
        const count = clientiMatchMap.get(clienteId) || 0;
        clientiMatchMap.set(clienteId, count + 1);
      }
    });
    
    const matchPerCliente = Array.from(clientiMatchMap.entries())
      .map(([clienteId, count]) => {
        const cliente = clienti.find(c => c.id === clienteId) || { nome: 'N/D' };
        return {
          cliente: cliente.nome.length > 20 ? cliente.nome.substring(0, 20) + '...' : cliente.nome,
          clienteOriginal: cliente.nome,
          conteggio: count,
          percentuale: Math.round((count / matches.length) * 100)
        };
      })
      .sort((a, b) => b.conteggio - a.conteggio)
      .slice(0, 5);
    
    setStatistiche({
      distribuzioneBandi,
      matchPerCliente
    });
  };
  
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
    
    const csvRows = [
      headers.join(','),
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
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
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
  
  const handleDownloadMatchCSV = () => {
    if (matchesData.length === 0) {
      toast({
        title: "Nessun dato disponibile",
        description: "Non ci sono match da esportare",
        variant: "destructive"
      });
      return;
    }
    
    const csvContent = MatchService.exportMatchesToCSV(matchesData);
    const filename = `match_bandi_clienti_${new Date().toISOString().slice(0, 10)}.csv`;
    
    MatchService.downloadCSV(csvContent, filename);
    
    toast({
      title: "Download completato",
      description: `File "${filename}" scaricato con successo`,
    });
  };

  const customPieTooltipFormatter = (value, name, props) => {
    const item = props.payload;
    if (item.clienteOriginal) {
      return [`${item.conteggio} match (${value}%)`, item.clienteOriginal];
    }
    return [`${value}%`, name];
  };

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
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <ChartContainer title="Match per Cliente">
              <div className="h-80">
                {statistiche.matchPerCliente.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statistiche.matchPerCliente}
                        nameKey="cliente"
                        dataKey="percentuale"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: '#666', strokeWidth: 1 }}
                      >
                        {statistiche.matchPerCliente.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={customPieTooltipFormatter} />
                      <Legend formatter={(value, entry, index) => {
                        const item = statistiche.matchPerCliente[index];
                        return item ? item.clienteOriginal : value;
                      }} />
                    </PieChart>
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
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleDownloadBandiCSV}
                  style={{ backgroundColor: "#3b82f6" }}
                >
                  <Download className="h-4 w-4" />
                  Scarica CSV
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
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
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleDownloadMatchCSV}
                  style={{ backgroundColor: "#3b82f6" }}
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
