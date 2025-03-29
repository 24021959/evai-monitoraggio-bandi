
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Download, FileText, FileJson } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import SupabaseReportService from "@/utils/SupabaseReportService"
import ChartContainer from "@/components/ChartContainer";
import StatCard from "@/components/StatCard";
import { DataTable } from "@/components/ui/data-table";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const Report = () => {
  const { toast } = useToast()
  const [startDate, setStartDate] = useState<Date | undefined>(addDays(new Date(), -30))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isGenerating, setIsGenerating] = useState(false)

  const { data: reportData, isLoading: isReportLoading, refetch } = useQuery({
    queryKey: ['advancedReport'],
    queryFn: () => SupabaseReportService.generateAdvancedReport(startDate, endDate),
    enabled: false, // Non eseguire la query automaticamente
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

  const renderTimeAnalysisChart = () => {
    if (!reportData?.analisiTemporale || reportData.analisiTemporale.length === 0) {
      return <p className="text-center py-8 text-muted-foreground">Nessun dato disponibile</p>;
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={reportData.analisiTemporale}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periodo" />
          <YAxis />
          <Tooltip formatter={(value) => value} />
          <Legend />
          <Line type="monotone" dataKey="bandiCreati" stroke="#8884d8" activeDot={{ r: 8 }} name="Bandi" />
          <Line type="monotone" dataKey="clientiCreati" stroke="#82ca9d" name="Clienti" />
          <Line type="monotone" dataKey="matchCreati" stroke="#ffc658" name="Match" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderSectorAnalysisChart = () => {
    if (!reportData?.analisiSettoriale || reportData.analisiSettoriale.length === 0) {
      return <p className="text-center py-8 text-muted-foreground">Nessun dato disponibile</p>;
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={reportData.analisiSettoriale}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="settore" angle={-45} textAnchor="end" height={70} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="numeroBandi" name="Bandi" fill="#8884d8" />
          <Bar dataKey="numeroClienti" name="Clienti" fill="#82ca9d" />
          <Bar dataKey="numeroMatch" name="Match" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPerformanceMatchChart = () => {
    if (!reportData?.performanceMatch || reportData.performanceMatch.length === 0) {
      return <p className="text-center py-8 text-muted-foreground">Nessun dato disponibile</p>;
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={reportData.performanceMatch}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="cliente" angle={-45} textAnchor="end" height={70} />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="numBandiCompatibili" name="Bandi Compatibili" fill="#8884d8" />
          <Bar yAxisId="right" dataKey="compatibilitaMedia" name="Compatibilità Media %" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderGeographicAnalysisChart = () => {
    if (!reportData?.analisiGeografica || reportData.analisiGeografica.length === 0) {
      return <p className="text-center py-8 text-muted-foreground">Nessun dato disponibile</p>;
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={reportData.analisiGeografica}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={110}
            fill="#8884d8"
            dataKey="numeroClienti"
            nameKey="regione"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {reportData.analisiGeografica.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => [value, props.payload.regione]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderSectorDistributionChart = () => {
    if (!reportData?.bandoPerSettore || reportData.bandoPerSettore.length === 0) {
      return <p className="text-center py-8 text-muted-foreground">Nessun dato disponibile</p>;
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={reportData.bandoPerSettore}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={110}
            fill="#8884d8"
            dataKey="percentuale"
            nameKey="settore"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {reportData.bandoPerSettore.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Crea delle colonne per la tabella dei settori
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

  // Crea delle colonne per la tabella di performance
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

  // Crea delle colonne per la tabella geografica
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Report</CardTitle>
          <CardDescription>
            Seleziona un intervallo di date per generare un report dettagliato.
          </CardDescription>
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
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={generateReport} 
              disabled={isGenerating || isReportLoading}
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
            <Button 
              onClick={exportToCSV} 
              disabled={isGenerating || isReportLoading || !reportData}
              variant="outline"
            >
              <FileText className="mr-2 h-4 w-4" />
              Esporta CSV
            </Button>
            <Button 
              onClick={exportToJSON} 
              disabled={isGenerating || isReportLoading || !reportData}
              variant="outline"
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
          <TabsList className="mb-6 grid grid-cols-4 md:grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="temporal">Analisi Temporale</TabsTrigger>
            <TabsTrigger value="sectorial">Analisi Settoriale</TabsTrigger>
            <TabsTrigger value="geographic">Analisi Geografica</TabsTrigger>
            <TabsTrigger value="performance" className="hidden md:block">Performance Match</TabsTrigger>
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
              <ChartContainer title="Distribuzione Bandi">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: "Europei", value: reportData.distribuzioneBandi.europei },
                      { name: "Statali", value: reportData.distribuzioneBandi.statali },
                      { name: "Regionali", value: reportData.distribuzioneBandi.regionali },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Bandi" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              <ChartContainer title="Bandi per Settore">
                {renderSectorDistributionChart()}
              </ChartContainer>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ultimi 6 Mesi</CardTitle>
                  <CardDescription>Trend di crescita di bandi, clienti e match</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderTimeAnalysisChart()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance di Match per Cliente</CardTitle>
                  <CardDescription>Clienti con maggior compatibilità</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable 
                    columns={performanceColumns} 
                    data={reportData.performanceMatch || []} 
                    searchColumn="cliente"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="temporal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analisi Temporale</CardTitle>
                <CardDescription>Trend dei dati negli ultimi 6 mesi</CardDescription>
              </CardHeader>
              <CardContent>
                {renderTimeAnalysisChart()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dettaglio Mensile</CardTitle>
                <CardDescription>Dati mensili di bandi, clienti e match</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periodo</TableHead>
                      <TableHead>Bandi Creati</TableHead>
                      <TableHead>Clienti Creati</TableHead>
                      <TableHead>Match Creati</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.analisiTemporale && reportData.analisiTemporale.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.periodo}</TableCell>
                        <TableCell>{item.bandiCreati}</TableCell>
                        <TableCell>{item.clientiCreati}</TableCell>
                        <TableCell>{item.matchCreati}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sectorial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analisi Settoriale</CardTitle>
                <CardDescription>Distribuzione di bandi e clienti per settore</CardDescription>
              </CardHeader>
              <CardContent>
                {renderSectorAnalysisChart()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dettaglio Settori</CardTitle>
                <CardDescription>Dati dettagliati per ogni settore</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={sectorColumns} 
                  data={reportData.analisiSettoriale || []} 
                  searchColumn="settore"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analisi Geografica</CardTitle>
                <CardDescription>Distribuzione regionale dei clienti</CardDescription>
              </CardHeader>
              <CardContent>
                {renderGeographicAnalysisChart()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dettaglio Regioni</CardTitle>
                <CardDescription>Dati dettagliati per ogni regione</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={geographicColumns} 
                  data={reportData.analisiGeografica || []} 
                  searchColumn="regione"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance di Match</CardTitle>
                <CardDescription>Analisi delle prestazioni dei match per cliente</CardDescription>
              </CardHeader>
              <CardContent>
                {renderPerformanceMatchChart()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dettaglio Performance</CardTitle>
                <CardDescription>Dati dettagliati delle performance per ogni cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={performanceColumns} 
                  data={reportData.performanceMatch || []} 
                  searchColumn="cliente"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nessun Report</CardTitle>
            <CardDescription>Genera un report per visualizzare i dati.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Seleziona un intervallo di date e clicca su "Genera Report" per visualizzare i dati.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Report;
