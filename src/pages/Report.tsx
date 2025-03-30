
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { PieChartCard } from "@/components/charts/PieChartCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";
import { ReportService } from "@/utils/ReportService";
import { 
  ReportData, 
  ReportAnalisiTemporale, 
  ReportPerformanceMatch, 
  ReportDistribuzioneFonti 
} from "@/types/report";

// Definizione dell'interfaccia DataItem per le tabelle e i grafici
interface DataItem {
  [key: string]: any;
}

// Convertiamo i tipi ReportAnalisiTemporale e ReportPerformanceMatch a DataItem
const convertToDataItem = <T extends object>(items: T[]): DataItem[] => {
  return items.map(item => ({ ...item } as DataItem));
};

const Report = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Colonne per la tabella di performance dei match
  const performanceColumns: ColumnDef<ReportPerformanceMatch>[] = [
    {
      accessorKey: "fonte",
      header: "Fonte",
    },
    {
      accessorKey: "totaleMatch",
      header: "Totale Match",
    },
    {
      accessorKey: "percentualeSuccesso",
      header: "% Successo",
      cell: ({ row }) => {
        const value = row.getValue("percentualeSuccesso") as number;
        return `${value.toFixed(1)}%`;
      },
    },
    {
      accessorKey: "mediaTempoElaborazione",
      header: "Tempo Medio (ms)",
      cell: ({ row }) => {
        const value = row.getValue("mediaTempoElaborazione") as number;
        return `${value.toFixed(0)} ms`;
      },
    }
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Report</h1>
        <Button onClick={fetchReportData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Aggiorna
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-lg font-medium">Riepilogo</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">Totale Match</div>
                <div className="text-2xl font-bold">{reportData.totaleMatch}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Tasso di Successo</div>
                <div className="text-2xl font-bold">{reportData.tassoSuccesso.toFixed(1)}%</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600">Fonti Attive</div>
                <div className="text-2xl font-bold">{reportData.fontiAttive}</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-sm text-amber-600">Tempo Medio</div>
                <div className="text-2xl font-bold">{reportData.tempoMedioElaborazione.toFixed(0)} ms</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <PieChartCard
          title="Distribuzione per fonte"
          data={convertToDataItem(reportData.distribuzioneFonti)}
          dataKey="valore"
          nameKey="fonte"
          colors={["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]}
        />
      </div>

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

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-lg font-medium">Performance per fonte</h2>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={performanceColumns}
            data={reportData.performanceMatch}
            searchColumn="fonte"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Report;
