import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
import {
  CardHeader as ShadCardHeader,
  CardTitle as ShadCardTitle,
  CardDescription as ShadCardDescription,
  CardContent as ShadCardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useQuery } from "@tanstack/react-query"
import SupabaseReportService from "@/utils/SupabaseReportService"
import { Statistica } from "@/types"

const Report = () => {
  const { toast } = useToast()
  const [startDate, setStartDate] = useState<Date | undefined>(addDays(new Date(), -7))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [reportData, setReportData] = useState<Statistica | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { data: latestReport, isLoading: isLatestReportLoading } = useQuery({
    queryKey: ['latestReport'],
    queryFn: () => SupabaseReportService.getLatestReportByType('generale'),
  });

  useEffect(() => {
    if (latestReport && latestReport.dati) {
      setReportData(latestReport.dati as Statistica);
    }
  }, [latestReport]);

  const generateReport = async () => {
    setIsLoading(true)
    // Simulate fetching data and generating a report
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock data for demonstration
    const mockReportData: Statistica = {
      bandiAttivi: Math.floor(Math.random() * 100),
      numeroClienti: Math.floor(Math.random() * 50),
      matchRecenti: Math.floor(Math.random() * 20),
      distribuzioneBandi: {
        europei: Math.floor(Math.random() * 100),
        statali: Math.floor(Math.random() * 100),
        regionali: Math.floor(Math.random() * 100),
      },
      bandoPerSettore: [
        { settore: "Agricoltura", percentuale: Math.floor(Math.random() * 100) },
        { settore: "Turismo", percentuale: Math.floor(Math.random() * 100) },
        { settore: "Innovazione", percentuale: Math.floor(Math.random() * 100) },
      ],
      matchPerCliente: [
        { cliente: "Cliente A", percentuale: Math.floor(Math.random() * 100) },
        { cliente: "Cliente B", percentuale: Math.floor(Math.random() * 100) },
        { cliente: "Cliente C", percentuale: Math.floor(Math.random() * 100) },
      ],
    }

    setReportData(mockReportData)
    setIsLoading(false)
  }

  const saveReport = async () => {
    if (!reportData) {
      toast({
        title: "Nessun dato",
        description: "Genera prima un report",
      })
      return
    }

    const saved = await SupabaseReportService.saveStatisticsReport(reportData)

    if (saved) {
      toast({
        title: "Report salvato",
        description: "Il report è stato salvato con successo",
      })
    } else {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio del report",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Genera Report</CardTitle>
          <CardDescription>
            Seleziona un intervallo di date per generare un report.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-2">
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
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                className="w-full"
              />
            </PopoverContent>
          </Popover>
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
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                className="w-full"
              />
            </PopoverContent>
          </Popover>
          <Button onClick={generateReport} disabled={isLoading}>
            {isLoading ? "Generazione..." : "Genera Report"}
          </Button>
          <Button onClick={saveReport} disabled={isLoading || !reportData}>
            Salva Report
          </Button>
        </CardContent>
      </Card>

      {isLatestReportLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Ultimo Report</CardTitle>
            <CardDescription>Caricamento...</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px]" />
          </CardContent>
        </Card>
      ) : reportData ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Bandi Attivi</CardTitle>
              <CardDescription>Numero di bandi attivi nel sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.bandiAttivi}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Numero Clienti</CardTitle>
              <CardDescription>Numero totale di clienti registrati</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.numeroClienti}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Match Recenti</CardTitle>
              <CardDescription>Numero di match creati negli ultimi 7 giorni</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.matchRecenti}</div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Distribuzione Bandi</CardTitle>
              <CardDescription>Distribuzione dei bandi per tipo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={[
                    { name: "Europei", value: reportData.distribuzioneBandi.europei },
                    { name: "Statali", value: reportData.distribuzioneBandi.statali },
                    { name: "Regionali", value: reportData.distribuzioneBandi.regionali },
                  ]}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Bandi per Settore</CardTitle>
              <CardDescription>Percentuale di bandi per settore</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Settore</TableHead>
                    <TableHead>Percentuale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.bandoPerSettore.map((item) => (
                    <TableRow key={item.settore}>
                      <TableCell>{item.settore}</TableCell>
                      <TableCell>{item.percentuale}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Match per Cliente</CardTitle>
              <CardDescription>Percentuale di match per cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Percentuale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.matchPerCliente.map((item) => (
                    <TableRow key={item.cliente}>
                      <TableCell>{item.cliente}</TableCell>
                      <TableCell>{item.percentuale}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ultimo Report</CardTitle>
            <CardDescription>Nessun report generato</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Genera un report per visualizzare i dati.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Report;
