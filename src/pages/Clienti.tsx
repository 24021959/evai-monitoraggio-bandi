
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import ClientiTable from '@/components/ClientiTable';
import { useNavigate } from 'react-router-dom';
import { Cliente } from '@/types';
import { SupabaseClientiService } from '@/utils/SupabaseClientiService';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const Clienti = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const clientiPerPagina = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  
  // Filtri
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroSettore, setFiltroSettore] = useState('');
  const [filtroFatturatoMin, setFiltroFatturatoMin] = useState('');
  const [filtroFatturatoMax, setFiltroFatturatoMax] = useState('');
  const [filtroDipendentiMin, setFiltroDipendentiMin] = useState('');
  const [filtroDipendentiMax, setFiltroDipendentiMax] = useState('');
  const [filtroRegione, setFiltroRegione] = useState('');
  const [filtroCodiceAteco, setFiltroCodiceAteco] = useState('');
  
  // Stato per il dialogo di conferma eliminazione
  const [clienteDaEliminare, setClienteDaEliminare] = useState<string | null>(null);

  // Carica clienti da Supabase
  useEffect(() => {
    const fetchClienti = async () => {
      setIsLoading(true);
      try {
        const clientiData = await SupabaseClientiService.getClienti();
        setClienti(clientiData);
      } catch (error) {
        console.error('Errore nel caricamento dei clienti:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i clienti",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClienti();
  }, [toast]);
  
  // Funzione per eliminare un cliente
  const eliminaCliente = async (id: string) => {
    try {
      const success = await SupabaseClientiService.deleteCliente(id);
      
      if (success) {
        // Aggiorna la lista dei clienti rimuovendo il cliente eliminato
        setClienti(clienti.filter(cliente => cliente.id !== id));
        
        toast({
          title: "Cliente eliminato",
          description: "Il cliente è stato eliminato con successo",
        });
      } else {
        toast({
          title: "Errore",
          description: "Impossibile eliminare il cliente",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione del cliente:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un problema durante l'eliminazione",
        variant: "destructive",
      });
    }
    
    setClienteDaEliminare(null);
  };
  
  const clientiFiltrati = clienti.filter(cliente => {
    // Filtro per ricerca generale
    const matchRicercaGenerale = 
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.settore.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.regione.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtri specifici
    const matchNome = filtroNome ? cliente.nome.toLowerCase().includes(filtroNome.toLowerCase()) : true;
    const matchSettore = filtroSettore ? cliente.settore.toLowerCase().includes(filtroSettore.toLowerCase()) : true;
    const matchFatturatoMin = filtroFatturatoMin ? cliente.fatturato >= Number(filtroFatturatoMin) : true;
    const matchFatturatoMax = filtroFatturatoMax ? cliente.fatturato <= Number(filtroFatturatoMax) : true;
    const matchDipendentiMin = filtroDipendentiMin ? cliente.dipendenti >= Number(filtroDipendentiMin) : true;
    const matchDipendentiMax = filtroDipendentiMax ? cliente.dipendenti <= Number(filtroDipendentiMax) : true;
    const matchRegione = filtroRegione ? cliente.regione.toLowerCase().includes(filtroRegione.toLowerCase()) : true;
    const matchCodiceAteco = filtroCodiceAteco ? 
      (cliente.codiceATECO && cliente.codiceATECO.toLowerCase().includes(filtroCodiceAteco.toLowerCase())) : true;
    
    // Ritorna true solo se tutti i filtri sono soddisfatti
    return matchRicercaGenerale && matchNome && matchSettore && matchFatturatoMin && 
           matchFatturatoMax && matchDipendentiMin && matchDipendentiMax && 
           matchRegione && matchCodiceAteco;
  });

  // Calcolo per la paginazione
  const indexUltimoCliente = currentPage * clientiPerPagina;
  const indexPrimoCliente = indexUltimoCliente - clientiPerPagina;
  const clientiCorrente = clientiFiltrati.slice(indexPrimoCliente, indexUltimoCliente);
  const totalePagine = Math.ceil(clientiFiltrati.length / clientiPerPagina);

  // Gestione cambio pagina
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Reset di tutti i filtri
  const resetFiltri = () => {
    setFiltroNome('');
    setFiltroSettore('');
    setFiltroFatturatoMin('');
    setFiltroFatturatoMax('');
    setFiltroDipendentiMin('');
    setFiltroDipendentiMax('');
    setFiltroRegione('');
    setFiltroCodiceAteco('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestione Clienti</h1>
        <Button 
          onClick={() => navigate('/app/nuovo-cliente')}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <PlusCircle className="h-4 w-4" />
          Nuovo Cliente
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Elenco Clienti</CardTitle>
          <CardDescription>Gestisci i tuoi clienti e monitora i bandi di loro interesse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-2/3">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca cliente..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 flex-shrink-0 w-32"
                  >
                    <Filter className="h-4 w-4" />
                    Filtri
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-4 bg-white">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filtri di ricerca</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nome</label>
                        <Input 
                          placeholder="Nome cliente" 
                          value={filtroNome}
                          onChange={(e) => setFiltroNome(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Settore</label>
                        <Input 
                          placeholder="Settore" 
                          value={filtroSettore}
                          onChange={(e) => setFiltroSettore(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fatturato min</label>
                        <Input 
                          placeholder="€" 
                          type="number"
                          value={filtroFatturatoMin}
                          onChange={(e) => setFiltroFatturatoMin(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fatturato max</label>
                        <Input 
                          placeholder="€" 
                          type="number"
                          value={filtroFatturatoMax}
                          onChange={(e) => setFiltroFatturatoMax(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Dipendenti min</label>
                        <Input 
                          placeholder="N." 
                          type="number"
                          value={filtroDipendentiMin}
                          onChange={(e) => setFiltroDipendentiMin(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Dipendenti max</label>
                        <Input 
                          placeholder="N." 
                          type="number"
                          value={filtroDipendentiMax}
                          onChange={(e) => setFiltroDipendentiMax(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Regione</label>
                        <Input 
                          placeholder="Regione" 
                          value={filtroRegione}
                          onChange={(e) => setFiltroRegione(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Codice ATECO</label>
                        <Input 
                          placeholder="Codice" 
                          value={filtroCodiceAteco}
                          onChange={(e) => setFiltroCodiceAteco(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between pt-2">
                      <Button variant="outline" onClick={resetFiltri}>Reset</Button>
                      <Button>Applica</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Caricamento clienti in corso...</p>
            </div>
          ) : clientiCorrente.length > 0 ? (
            <ClientiTable 
              clienti={clientiCorrente} 
              onViewDetails={(id) => navigate(`/clienti/${id}`)} 
              onDeleteClient={(id) => setClienteDaEliminare(id)}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nessun cliente trovato. {clienti.length > 0 ? 'Prova a modificare i filtri.' : 'Aggiungi il tuo primo cliente.'}
            </div>
          )}
          
          {totalePagine > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                  
                  {Array.from({ length: totalePagine }, (_, i) => i + 1).map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink 
                        isActive={currentPage === pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {currentPage < totalePagine && (
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
          
          {/* Dialog di conferma eliminazione */}
          <AlertDialog open={!!clienteDaEliminare} onOpenChange={() => setClienteDaEliminare(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                <AlertDialogDescription>
                  Sei sicuro di voler eliminare questo cliente? Questa azione non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => clienteDaEliminare && eliminaCliente(clienteDaEliminare)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Elimina
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clienti;
