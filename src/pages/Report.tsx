
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { FileBarChart, DownloadCloud, RefreshCw, Filter } from 'lucide-react';
import { BarChartCard } from '@/components/BarChartCard';
import { LineChartCard } from '@/components/LineChartCard';
import { useToast } from '@/components/ui/use-toast';
import { DataItem, ReportAnalisiTemporale, ReportPerformanceMatch } from '@/types';
import SupabaseReportService from '@/utils/SupabaseReportService';

const Report = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('generale');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>({});
  const [reportGenerato, setReportGenerato] = useState(false);

  useEffect(() => {
    const caricaUltimoReport = async () => {
      try {
        setLoading(true);
        const ultimoReport = await SupabaseReportService.getLastReport('generale');
        if (ultimoReport) {
          setReportData(ultimoReport.dati);
          setReportGenerato(true);
        }
      } catch (error) {
        console.error("Errore nel caricamento dell'ultimo report:", error);
      } finally {
        setLoading(false);
      }
    };
    
    caricaUltimoReport();
  }, []);

  const handleGeneraReport = async () => {
    setLoading(true);
    try {
      // Esempio di dati generati per il report
      const datiReport = {
        analisi_temporale: [
          { name: 'Gen', count: 12 },
          { name: 'Feb', count: 19 },
          { name: 'Mar', count: 9 },
          { name: 'Apr', count: 15 },
          { name: 'Mag', count: 22 },
          { name: 'Giu', count: 18 },
        ],
        performance_match: [
          { name: 'Alta', value: 65 },
          { name: 'Media', value: 25 },
          { name: 'Bassa', value: 10 },
        ],
        distribuzione_settoriale: [
          { name: 'Manifatturiero', count: 35 },
          { name: 'Servizi', count: 28 },
          { name: 'Agricoltura', count: 18 },
          { name: 'ICT', count: 45 },
          { name: 'Altro', count: 12 },
        ],
        statistiche_generali: {
          totale_bandi: 245,
          totale_clienti: 67,
          totale_match: 322,
          match_settimana: 28,
        }
      };

      // Salviamo il report generato
      await SupabaseReportService.createReport({
        titolo: 'Report Generale',
        descrizione: 'Report generato automaticamente con analisi completa',
        tipo: 'generale',
        dati: datiReport
      });

      setReportData(datiReport);
      setReportGenerato(true);

      toast({
        title: 'Report generato',
        description: 'Il report è stato generato con successo',
      });
    } catch (error) {
      console.error('Errore nella generazione del report:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore nella generazione del report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!reportData) {
      toast({
        title: 'Nessun report da esportare',
        description: 'Genera prima un report per poterlo esportare',
        variant: 'destructive',
      });
      return;
    }

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_ev_ai_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Report esportato',
      description: 'Il report è stato scaricato con successo',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileBarChart className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Report e Analisi</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleExportReport}
            disabled={!reportGenerato || loading}
          >
            <DownloadCloud className="w-4 h-4" />
            Esporta
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleGeneraReport}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generazione...' : 'Genera Report'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="generale" className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white">Generale</TabsTrigger>
          <TabsTrigger value="clienti" className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white">Clienti</TabsTrigger>
          <TabsTrigger value="bandi" className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white">Bandi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generale" className="animate-fade-in">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent"></div>
            </div>
          ) : reportGenerato ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatisticheGenerali statistiche={reportData.statistiche_generali} />
              <BarChartCard 
                title="Distribuzione Settoriale"
                description="Numero di bandi per settore"
                data={reportData.distribuzione_settoriale as DataItem[]}
                dataKey="count"
                nameKey="name"
                colors={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']}
                height={300}
              />
              
              <LineChartCard 
                title="Analisi Temporale"
                description="Numero di bandi pubblicati per mese"
                data={reportData.analisi_temporale as DataItem[]}
                dataKey="count"
                nameKey="name"
                color="#0088FE"
                height={300}
              />
              
              <BarChartCard
                title="Performance Match"
                description="Distribuzione dei match per compatibilità"
                data={reportData.performance_match as DataItem[]}
                dataKey="value"
                nameKey="name"
                colors={['#00C49F', '#FFBB28', '#FF8042']}
                height={300}
              />
            </div>
          ) : (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <FileBarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Nessun report disponibile</h3>
                  <p className="text-gray-500 mb-4">
                    Non ci sono report generati. Genera un nuovo report per visualizzare le statistiche.
                  </p>
                  <Button 
                    onClick={handleGeneraReport} 
                    disabled={loading}
                    className="mx-auto"
                  >
                    {loading ? 'Generazione...' : 'Genera Report'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="clienti">
          <Card>
            <CardHeader>
              <CardTitle>Report Clienti</CardTitle>
              <CardDescription>
                Analisi dettagliata sulla distribuzione e attività dei clienti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p>Seleziona i filtri e genera un report per visualizzare i dati</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bandi">
          <Card>
            <CardHeader>
              <CardTitle>Report Bandi</CardTitle>
              <CardDescription>
                Analisi dettagliata sulla distribuzione e tipologia dei bandi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p>Seleziona i filtri e genera un report per visualizzare i dati</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StatisticheGenerali = ({ statistiche }: { statistiche: any }) => {
  if (!statistiche) return null;
  
  const cards = [
    { title: "Totale Bandi", value: statistiche.totale_bandi || 0, color: "bg-blue-500" },
    { title: "Totale Clienti", value: statistiche.totale_clienti || 0, color: "bg-green-500" },
    { title: "Match Totali", value: statistiche.totale_match || 0, color: "bg-amber-500" },
    { title: "Match Settimana", value: statistiche.match_settimana || 0, color: "bg-purple-500" },
  ];
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card, idx) => (
        <Card key={idx} className="bg-white">
          <CardContent className="pt-6">
            <div className={`h-2 ${card.color} rounded-t-md -mt-6 -mx-6`}></div>
            <div className="text-center p-4">
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Report;
