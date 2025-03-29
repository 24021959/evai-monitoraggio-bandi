import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, FileText, FileJson, PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import SupabaseReportService from "@/utils/SupabaseReportService";
import StatCard from "@/components/StatCard";
import StatisticheCard from "@/components/StatisticheCard";
import LineChartCard from "@/components/LineChartCard";
import BarChartCard from "@/components/BarChartCard";
import DataTableCard from "@/components/DataTableCard";

const sectorColumns = [
  {
    accessorKey: "settore",
    header: "Settore",
  },
  {
    accessorKey: "numeroBandi",
    header: "Bandi",
  },
  {
    accessorKey: "numeroClienti",
    header: "Clienti",
  },
  {
    accessorKey: "numeroMatch",
    header: "Match",
  },
];

const performanceColumns = [
  {
    accessorKey: "cliente",
    header: "Cliente",
  },
  {
    accessorKey: "settore",
    header: "Settore",
  },
  {
    accessorKey: "numBandiCompatibili",
    header: "Bandi Compatibili",
  },
  {
    accessorKey: "compatibilitaMedia",
    header: "Compatibilità Media %",
  },
];

const geographicColumns = [
  {
    accessorKey: "regione",
    header: "Regione",
  },
  {
    accessorKey: "numeroClienti",
    header: "Clienti",
  },
  {
    accessorKey: "numeroBandi",
    header: "Bandi",
  },
  {
    accessorKey: "percentuale",
    header: "Percentuale %",
  },
];

const monthlyColumns = [
  {
    accessorKey: "periodo",
    header: "Periodo",
  },
  {
    accessorKey: "bandiCreati",
    header: "Bandi Creati",
  },
  {
    accessorKey: "clientiCreati",
    header: "Clienti Creati",
  },
  {
    accessorKey: "matchCreati",
    header: "Match Creati",
  },
];

const Report = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(addDays(new Date(), -30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: reportData, isLoading: isReportLoading, refetch } = useQuery({
    queryKey: ['advancedReport'],
    queryFn: () => SupabaseReportService.generateAdvancedReport(startDate, endDate),
    enabled: false,
  });

  const generateReport = async () => {
    setIsGenerating(true);
    await refetch();
    setIsGenerating(false);
    
    toast({
      title: "Report generato",
      description: "Il report è stato generato con successo",
    });
  };

  const saveReport = async () => {
    if (!reportData) {
      toast({
        title: "Nessun dato",
        description: "Genera prima un report",
        variant: "destructive",
      });
      return;
    }

    const saved = await SupabaseReportService.saveStatisticsReport(reportData);

    if (saved) {
      toast({
        title: "Report salvato",
        description: "Il report è stato salvato con successo",
      });
    } else {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio del report",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    if (!reportData) {
      toast({
        title: "Nessun dato",
        description: "Genera prima un report",
        variant: "destructive",
      });
      return;
    }

    const csvContent = SupabaseReportService.exportReportToCSV(reportData);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Report esportato",
      description: "Il report è stato esportato in formato CSV",
    });
  };

  const exportToJSON = () => {
    if (!reportData) {
      toast({
        title: "Nessun dato",
        description: "Genera prima un report",
        variant: "destructive",
      });
      return;
    }

    const jsonContent = SupabaseReportService.exportReportToJSON(reportData);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `report_${format(new Date(), 'yyyy-MM-dd')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report esportato",
      description: "Il report è stato esportato in formato JSON",
    });
  };

  const prepareBandiDistributionData = () => {
    if (!reportData) return [];
    
    return [
      { name: "Europei", value: reportData.distribuzioneBandi.europei },
      { name: "Statali", value: reportData.distribuzioneBandi.statali },
      { name: "Regionali", value: reportData.distribuzioneBandi.regionali },
    ];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Dashboard Report</CardTitle>
              <CardDescription className="text-muted-foreground">
                Analisi e statistiche dettagliate del sistema
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={generateReport} 
                disabled={isGenerating || isReportLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? "Generazione..." : "Genera Report"}
              </Button>
              <Button 
                onClick={saveReport} 
                disabled={isGenerating || isReportLoading || !reportData}
                variant="outline"
              >
                Salva Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Data Inizio</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Seleziona una data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Data Fine</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Seleziona una data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={exportToCSV} 
              disabled={isGenerating || isReportLoading || !reportData}
              variant="outline"
              size="sm"
            >
              <FileText className="mr-2 h-4 w-4" />
              Esporta CSV
            </Button>
            <Button 
              onClick={exportToJSON} 
              disabled={isGenerating || isReportLoading || !reportData}
              variant="outline"
              size="sm"
            >
              <FileJson className="mr-2 h-4 w-4" />
              Esporta JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {isReportLoading || isGenerating ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
            </div>
            <Skeleton className="h-[350px]" />
          </CardContent>
        </Card>
      ) : reportData ? (
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="dashboard" className="gap-2">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="temporal" className="gap-2">
              <LineChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Temporale</span>
            </TabsTrigger>
            <TabsTrigger value="sectorial" className="gap-2">
              <BarChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Settoriale</span>
            </TabsTrigger>
            <TabsTrigger value="geographic" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Geografica</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2 hidden md:flex">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              <StatCard 
                title="Bandi Attivi" 
                value={reportData.bandiAttivi} 
                color="blue" 
              />
              <StatCard 
                title="Clienti Registrati" 
                value={reportData.numeroClienti} 
                color="green" 
              />
              <StatCard 
                title="Match Recenti" 
                value={reportData.matchRecenti} 
                color="yellow" 
              />
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <BarChartCard
                title="Distribuzione Bandi"
                description="Suddivisione per tipologia"
                data={prepareBandiDistributionData()}
                bars={[
                  { dataKey: "value", fill: "#8884d8", name: "Bandi" }
                ]}
                xAxisDataKey="name"
              />

              <LineChartCard
                title="Trend Ultimi 6 Mesi"
                description="Andamento di bandi, clienti e match"
                data={reportData.analisiTemporale}
                lines={[
                  { dataKey: "bandiCreati", stroke: "#8884d8", name: "Bandi" },
                  { dataKey: "clientiCreati", stroke: "#82ca9d", name: "Clienti" },
                  { dataKey: "matchCreati", stroke: "#ffc658", name: "Match" }
                ]}
                xAxisDataKey="periodo"
              />
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <DataTableCard
                title="Top Clienti per Match"
                description="Clienti con maggior compatibilità"
                data={reportData.performanceMatch}
                columns={performanceColumns}
                searchColumn="cliente"
              />
            </div>
          </TabsContent>

          <TabsContent value="temporal" className="space-y-6">
            <LineChartCard
              title="Analisi Temporale"
              description="Trend dei dati negli ultimi 6 mesi"
              data={reportData.analisiTemporale}
              lines={[
                { dataKey: "bandiCreati", stroke: "#8884d8", name: "Bandi" },
                { dataKey: "clientiCreati", stroke: "#82ca9d", name: "Clienti" },
                { dataKey: "matchCreati", stroke: "#ffc658", name: "Match" }
              ]}
              xAxisDataKey="periodo"
            />

            <DataTableCard
              title="Dettaglio Mensile"
              description="Dati mensili di bandi, clienti e match"
              data={reportData.analisiTemporale}
              columns={monthlyColumns}
            />
          </TabsContent>

          <TabsContent value="sectorial" className="space-y-6">
            <BarChartCard
              title="Analisi Settoriale"
              description="Distribuzione di bandi e clienti per settore"
              data={reportData.analisiSettoriale}
              bars={[
                { dataKey: "numeroBandi", fill: "#8884d8", name: "Bandi" },
                { dataKey: "numeroClienti", fill: "#82ca9d", name: "Clienti" },
                { dataKey: "numeroMatch", fill: "#ffc658", name: "Match" }
              ]}
              xAxisDataKey="settore"
              xAxisAngle={-45}
            />

            <DataTableCard
              title="Dettaglio Settori"
              description="Dati dettagliati per ogni settore"
              data={reportData.analisiSettoriale}
              columns={sectorColumns}
              searchColumn="settore"
            />
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <StatisticheCard
              title="Analisi Geografica"
              description="Distribuzione regionale dei clienti"
              data={reportData.analisiGeografica.map(item => ({
                name: item.regione,
                value: item.numeroClienti
              }))}
            />

            <DataTableCard
              title="Dettaglio Regioni"
              description="Dati dettagliati per ogni regione"
              data={reportData.analisiGeografica}
              columns={geographicColumns}
              searchColumn="regione"
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <BarChartCard
              title="Performance di Match"
              description="Analisi delle prestazioni dei match per cliente"
              data={reportData.performanceMatch}
              bars={[
                { dataKey: "numBandiCompatibili", fill: "#8884d8", name: "Bandi Compatibili", yAxisId: "left" },
                { dataKey: "compatibilitaMedia", fill: "#82ca9d", name: "Compatibilità Media %", yAxisId: "right" }
              ]}
              xAxisDataKey="cliente"
              xAxisAngle={-45}
              showSecondYAxis={true}
            />

            <DataTableCard
              title="Dettaglio Performance"
              description="Dati dettagliati delle performance per ogni cliente"
              data={reportData.performanceMatch}
              columns={performanceColumns}
              searchColumn="cliente"
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-slate-50 border-dashed">
          <CardHeader>
            <CardTitle>Benvenuto nella pagina dei Report</CardTitle>
            <CardDescription>Genera un report per visualizzare analisi dettagliate dei dati del sistema.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <PieChartIcon className="h-16 w-16 mb-6 text-blue-500 opacity-70" />
            <p className="mb-4 text-slate-600 max-w-md">
              Seleziona un intervallo di date e clicca su "Genera Report" per visualizzare statistiche e analisi interattive.
            </p>
            <Button 
              onClick={generateReport} 
              disabled={isGenerating}
              size="lg"
              className="mt-2 bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? "Generazione..." : "Genera Report"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Report;
