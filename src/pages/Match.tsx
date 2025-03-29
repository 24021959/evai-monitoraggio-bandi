
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Archive, RefreshCw } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Cliente, Match } from "@/types";
import SupabaseMatchService from '@/utils/SupabaseMatchService';
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import SupabaseClientiService from '@/utils/SupabaseClientiService';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

// Define a type for our extended match data
interface MatchDisplay {
  id: string;
  cliente: {
    id: string;
    nome: string;
    settore: string;
  };
  bando: {
    id: string;
    titolo: string;
    fonte: string;
    scadenza: string;
  };
  punteggio: number;
  dataMatch: string;
  isNew: boolean;
  isArchived: boolean;
}

const MatchPage = () => {
  const { toast } = useToast();
  const [activeMatches, setActiveMatches] = useState<MatchDisplay[]>([]);
  const [archivedMatches, setArchivedMatches] = useState<MatchDisplay[]>([]);
  const [filterCliente, setFilterCliente] = useState<string>('');
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterScore, setFilterScore] = useState<string>('');
  const [lastImportDate, setLastImportDate] = useState<string | null>(null);

  // Columns for the DataTable component
  const columns: ColumnDef<MatchDisplay>[] = [
    {
      accessorKey: "cliente.nome",
      header: "Cliente",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.cliente.nome}</div>
          <div className="text-xs text-gray-500">{row.original.cliente.settore}</div>
        </div>
      ),
    },
    {
      accessorKey: "bando.titolo",
      header: "Bando",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.bando.titolo}</div>
          <div className="text-xs text-gray-500">{row.original.bando.fonte}</div>
          {row.original.isNew && (
            <Badge className="mt-1 bg-green-100 text-green-800">Nuovo</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "punteggio",
      header: "Match",
      cell: ({ row }) => {
        const score = row.original.punteggio;
        return (
          <Badge className={
            score > 85 ? "bg-green-100 text-green-800" : 
            score > 70 ? "bg-yellow-100 text-yellow-800" : 
            "bg-gray-100 text-gray-800"
          }>
            {score}%
          </Badge>
        );
      },
    },
    {
      accessorKey: "bando.scadenza",
      header: "Scadenza",
      cell: ({ row }) => {
        try {
          return new Date(row.original.bando.scadenza).toLocaleDateString('it-IT');
        } catch (e) {
          return row.original.bando.scadenza || 'N/D';
        }
      },
    },
    {
      accessorKey: "dataMatch",
      header: "Data Match",
      cell: ({ row }) => {
        try {
          return new Date(row.original.dataMatch).toLocaleDateString('it-IT');
        } catch (e) {
          return row.original.dataMatch || 'N/D';
        }
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => archiveMatch(row.original.id)}
            className="text-gray-500"
          >
            <Archive className="h-4 w-4 mr-1" />
            Archivia
          </Button>
        </div>
      ),
    },
  ];

  // Archived matches columns (similar but with Restore instead of Archive)
  const archivedColumns: ColumnDef<MatchDisplay>[] = [
    ...columns.slice(0, columns.length - 1),
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => restoreMatch(row.original.id)}
            className="text-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Ripristina
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch data (clients, matches)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Get clients
      const clientiData = await SupabaseClientiService.getClienti();
      setClienti(clientiData);
      
      // Get latest import date
      const bandiData = await SupabaseBandiService.getBandi();
      if (bandiData.length > 0) {
        const sortedBandi = [...bandiData].sort((a, b) => {
          return new Date(b.dataEstrazione || 0).getTime() - new Date(a.dataEstrazione || 0).getTime();
        });
        if (sortedBandi[0].dataEstrazione) {
          setLastImportDate(sortedBandi[0].dataEstrazione);
        }
      }
      
      // Get matches
      await loadMatches();
      
      toast({
        title: "Dati caricati",
        description: "I match sono stati caricati con successo",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel caricamento dei dati",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load matches
  const loadMatches = async () => {
    try {
      const matchesData = await SupabaseMatchService.getMatches();
      
      // Process matches for display
      const processedMatches = await processMatchesForDisplay(matchesData);
      
      // Split into active and archived
      setActiveMatches(processedMatches.filter(m => !m.isArchived));
      setArchivedMatches(processedMatches.filter(m => m.isArchived));
    } catch (error) {
      console.error("Error loading matches:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel caricamento dei match",
        variant: "destructive",
      });
    }
  };

  // Process matches to add display information
  const processMatchesForDisplay = async (matches: Match[]) => {
    // Get all bandi and clienti data
    const bandiData = await SupabaseBandiService.getBandi();
    const clientiData = await SupabaseClientiService.getClienti();
    
    // Find the latest import date
    let latestImport = null;
    if (bandiData.length > 0) {
      const sortedBandi = [...bandiData].sort((a, b) => {
        return new Date(b.dataEstrazione || 0).getTime() - new Date(a.dataEstrazione || 0).getTime();
      });
      if (sortedBandi[0].dataEstrazione) {
        latestImport = new Date(sortedBandi[0].dataEstrazione);
      }
    }
    
    // Create display matches
    return matches.map(match => {
      const bando = bandiData.find(b => b.id === match.bandoId) || { 
        id: 'unknown',
        titolo: 'Bando non disponibile',
        fonte: 'N/D',
        scadenza: 'N/D',
        tipo: 'altro',
        settori: []
      };
      
      const cliente = clientiData.find(c => c.id === match.clienteId) || {
        id: 'unknown',
        nome: 'Cliente non disponibile',
        settore: 'N/D',
        regione: 'N/D',
        provincia: 'N/D',
        fatturato: 0,
        interessiSettoriali: [],
        dipendenti: 0,
        email: 'N/D'
      };
      
      const matchDate = new Date(match.data_creazione || new Date());
      
      // Determine if this is a new match from the latest import
      const isNew = latestImport && matchDate >= latestImport;
      
      return {
        id: match.id,
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          settore: cliente.settore
        },
        bando: {
          id: bando.id,
          titolo: bando.titolo,
          fonte: bando.fonte,
          scadenza: bando.scadenza
        },
        punteggio: match.compatibilita,
        dataMatch: match.data_creazione || new Date().toISOString(),
        isNew,
        isArchived: match.archiviato || false
      };
    });
  };

  // Function to generate matches automatically
  const generateMatches = async () => {
    setIsLoading(true);
    try {
      const bandiData = await SupabaseBandiService.getBandi();
      const clientiData = await SupabaseClientiService.getClienti();
      
      if (bandiData.length === 0 || clientiData.length === 0) {
        toast({
          title: "Dati insufficienti",
          description: "Non ci sono bandi o clienti sufficienti per generare match",
          variant: "destructive",
        });
        return;
      }
      
      const matchResults = await SupabaseMatchService.generateAndSaveMatches(clientiData, bandiData);
      
      toast({
        title: "Match generati",
        description: `Sono stati generati ${matchResults.length} nuovi match`,
      });
      
      // Reload matches
      await loadMatches();
    } catch (error) {
      console.error("Error generating matches:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella generazione dei match",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to archive a match
  const archiveMatch = async (matchId: string) => {
    try {
      await SupabaseMatchService.updateMatchArchiveStatus(matchId, true);
      
      // Move from active to archived
      const matchToArchive = activeMatches.find(m => m.id === matchId);
      if (matchToArchive) {
        setActiveMatches(activeMatches.filter(m => m.id !== matchId));
        setArchivedMatches([...archivedMatches, {...matchToArchive, isArchived: true}]);
      }
      
      toast({
        title: "Match archiviato",
        description: "Il match è stato archiviato con successo",
      });
    } catch (error) {
      console.error("Error archiving match:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'archiviazione del match",
        variant: "destructive",
      });
    }
  };

  // Function to restore a match from archive
  const restoreMatch = async (matchId: string) => {
    try {
      await SupabaseMatchService.updateMatchArchiveStatus(matchId, false);
      
      // Move from archived to active
      const matchToRestore = archivedMatches.find(m => m.id === matchId);
      if (matchToRestore) {
        setArchivedMatches(archivedMatches.filter(m => m.id !== matchId));
        setActiveMatches([...activeMatches, {...matchToRestore, isArchived: false}]);
      }
      
      toast({
        title: "Match ripristinato",
        description: "Il match è stato ripristinato con successo",
      });
    } catch (error) {
      console.error("Error restoring match:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel ripristino del match",
        variant: "destructive",
      });
    }
  };

  // Function to export matches to CSV
  const exportMatchesCSV = () => {
    const matches = [...activeMatches, ...archivedMatches];
    if (matches.length === 0) {
      toast({
        title: "Nessun dato",
        description: "Non ci sono match da esportare",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const csv = SupabaseMatchService.generateMatchesCSV(
        matches.map(m => ({
          id: m.id,
          clienteId: m.cliente.id,
          bandoId: m.bando.id,
          compatibilita: m.punteggio,
          notificato: false,
          data_creazione: m.dataMatch,
          bando_titolo: m.bando.titolo,
          cliente_nome: m.cliente.nome,
          archiviato: m.isArchived || false
        }))
      );
      
      // Download CSV file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `match_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export completato",
        description: "I match sono stati esportati con successo",
      });
    } catch (error) {
      console.error("Error exporting matches:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'esportazione dei match",
        variant: "destructive",
      });
    }
  };

  // Filter functions
  const getFilteredMatches = (matches: MatchDisplay[]) => {
    let filtered = [...matches];
    
    if (filterCliente) {
      filtered = filtered.filter(m => m.cliente.id === filterCliente);
    }
    
    if (filterScore) {
      const minScore = parseInt(filterScore);
      filtered = filtered.filter(m => m.punteggio >= minScore);
    }
    
    return filtered;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Match</h1>
          <p className="text-gray-500">
            Match tra bandi e clienti
            {lastImportDate && (
              <span> - Ultima importazione: {format(new Date(lastImportDate), 'dd/MM/yyyy')}</span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={generateMatches}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Genera Match
          </Button>
          
          <Button
            onClick={exportMatchesCSV}
            variant="outline"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Esporta CSV
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filtri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filterCliente">Cliente</Label>
              <Select value={filterCliente} onValueChange={setFilterCliente}>
                <SelectTrigger id="filterCliente">
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
            
            <div>
              <Label htmlFor="filterScore">Compatibilità minima</Label>
              <Select value={filterScore} onValueChange={setFilterScore}>
                <SelectTrigger id="filterScore">
                  <SelectValue placeholder="Qualsiasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Qualsiasi</SelectItem>
                  <SelectItem value="50">Almeno 50%</SelectItem>
                  <SelectItem value="70">Almeno 70%</SelectItem>
                  <SelectItem value="85">Almeno 85%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-4">
          <TabsTrigger value="active">Match Attivi</TabsTrigger>
          <TabsTrigger value="archived">Archiviati</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Match Attivi</CardTitle>
              <CardDescription>
                Match attivi tra bandi e clienti. I match evidenziati come "Nuovi" sono stati generati nell'ultima importazione di bandi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getFilteredMatches(activeMatches)}
                searchColumn="bando.titolo"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle>Match Archiviati</CardTitle>
              <CardDescription>
                Match che sono stati archiviati. Puoi ripristinarli se necessario.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={archivedColumns}
                data={getFilteredMatches(archivedMatches)}
                searchColumn="bando.titolo"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchPage;
