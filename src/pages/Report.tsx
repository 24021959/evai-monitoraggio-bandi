
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";
import { ReportService } from "@/utils/ReportService";
import { ReportData, ReportAnalisiTemporale } from "@/types/report";
import StatisticheCard from "@/components/StatisticheCard";

// Definizione dell'interfaccia DataItem per le tabelle e i grafici
interface DataItem {
  [key: string]: any;
}

// Convertiamo i tipi ReportAnalisiTemporale a DataItem
const convertToDataItem = <T extends object>(items: T[]): DataItem[] => {
  return items.map(item => ({ ...item } as DataItem));
};

const Report = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ReportService.getReportData();
      setReportData(data);
    } catch (err: any) {
      console.error("Errore nel recupero dei dati del report:", err);
      setError(err.message || "Errore nel recupero dei dati del report");
      toast({
        title: "Errore",
        description: "Impossibile recuperare i dati del report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          {error || "Dati del report non disponibili"}
        </AlertDescription>
      </Alert>
    );
  }

  // Transform distribuzioneFonti data for StatisticheCard
  const pieChartData = reportData.distribuzioneFonti.map(item => ({
    name: item.fonte,
    value: item.valore,
    color: undefined // Will use default colors
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">Dashboard Report</h1>
        <Button onClick={fetchReportData} variant="outline" size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
          <RefreshCw className="mr-2 h-4 w-4" />
          Aggiorna
        </Button>
      </div>

      {/* Riepilogo card */}
      <Card className="shadow-lg border-blue-100">
        <CardHeader className="pb-2">
          <h2 className="text-xl font-semibold text-blue-700">Riepilogo</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
              <div className="text-base text-blue-600 font-medium">Totale Match</div>
              <div className="text-3xl font-bold text-blue-800 mt-1">{reportData.totaleMatch}</div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg shadow-sm">
              <div className="text-base text-green-600 font-medium">Tasso di Successo</div>
              <div className="text-3xl font-bold text-green-800 mt-1">{reportData.tassoSuccesso.toFixed(1)}%</div>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
              <div className="text-base text-purple-600 font-medium">Fonti Attive</div>
              <div className="text-3xl font-bold text-purple-800 mt-1">{reportData.fontiAttive}</div>
            </div>
            <div className="bg-amber-50 p-6 rounded-lg shadow-sm">
              <div className="text-base text-amber-600 font-medium">Numero Clienti</div>
              <div className="text-3xl font-bold text-amber-800 mt-1">{reportData.numeroClienti}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard 
          title="Distribuzione temporale match"
          data={convertToDataItem(reportData.analisiTemporale)}
          xAxisDataKey="periodo"
          bars={[
            { dataKey: "totaleMatch", name: "Totale match", color: "#4f46e5" }
          ]}
        />

        <LineChartCard
          title="Andamento tasso di successo"
          data={convertToDataItem(reportData.analisiTemporale)}
          xAxisDataKey="periodo"
          lines={[
            { dataKey: "tassoSuccesso", name: "Tasso di successo", color: "#10b981" }
          ]}
        />
      </div>

      {/* Distribuzione per fonte pie chart - full width at bottom */}
      <div className="w-full mt-8">
        <StatisticheCard
          title="Distribuzione per fonte"
          description="Distribuzione dei bandi per fonte"
          data={pieChartData}
          height={500} 
          simplifiedLabels={false}
        />
      </div>
    </div>
  );
};

export default Report;
