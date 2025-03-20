
import React, { useState } from 'react';
import { mockClienti } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import ClientiTable from '@/components/ClientiTable';
import { useNavigate } from 'react-router-dom';

const Clienti = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const clientiFiltrati = mockClienti.filter(cliente => 
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.settore.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.regione.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestione Clienti</h1>
        <Button 
          onClick={() => navigate('/clienti/nuovo')}
          className="flex items-center gap-2"
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
            clienti={clientiFiltrati} 
            onViewDetails={(id) => navigate(`/clienti/${id}`)} 
          />
          
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" size="icon">
              1
            </Button>
            <Button variant="outline" size="icon">
              2
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clienti;
