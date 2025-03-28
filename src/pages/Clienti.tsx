
import React, { useState } from 'react';
import { mockClienti } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import ClientiTable from '@/components/ClientiTable';
import { useNavigate } from 'react-router-dom';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const Clienti = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const clientiPerPagina = 10;
  
  const clientiFiltrati = mockClienti.filter(cliente => 
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.settore.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.regione.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcolo per la paginazione
  const indexUltimoCliente = currentPage * clientiPerPagina;
  const indexPrimoCliente = indexUltimoCliente - clientiPerPagina;
  const clientiCorrente = clientiFiltrati.slice(indexPrimoCliente, indexUltimoCliente);
  const totalePagine = Math.ceil(clientiFiltrati.length / clientiPerPagina);

  // Gestione cambio pagina
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestione Clienti</h1>
        <Button 
          onClick={() => navigate('/clienti/nuovo')}
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
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca cliente..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <ClientiTable 
            clienti={clientiCorrente} 
            onViewDetails={(id) => navigate(`/clienti/${id}`)} 
          />
          
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Clienti;
