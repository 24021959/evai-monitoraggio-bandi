import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Search } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Bando, Cliente, Match } from "@/types";
import SupabaseService from '@/utils/SupabaseService';
import { v4 as uuidv4 } from 'uuid';

const MatchPage = () => {
  const { toast } = useToast();
  const [bandi, setBandi] = useState<Bando[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedBando, setSelectedBando] = useState<string>('');
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Bando[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const bandiData = await SupabaseService.getBandi();
      setBandi(bandiData);
      const clientiData = await SupabaseService.getClienti();
      setClienti(clientiData);
      const matchesData = await SupabaseService.getMatches();
      setMatches(matchesData);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel caricamento dei dati",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term) {
      const results = bandi.filter(bando =>
        bando.titolo.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleMatch = async () => {
    if (!selectedBando || !selectedCliente) {
      toast({
        title: "Errore",
        description: "Seleziona un bando e un cliente per creare un match",
        variant: "destructive",
      });
      return;
    }

    const bando = bandi.find(b => b.id === selectedBando);
    const cliente = clienti.find(c => c.id === selectedCliente);

    if (!bando || !cliente) {
      toast({
        title: "Errore",
        description: "Bando o cliente non trovato",
        variant: "destructive",
      });
      return;
    }

    const newMatch: Match = {
      id: uuidv4(),
      bando_id: selectedBando,
      cliente_id: selectedCliente,
      bando_titolo: bando.titolo,
      cliente_nome: cliente.nome,
      data_creazione: new Date().toISOString(),
    };

    try {
      const results = await SupabaseService.saveMatch(newMatch);
      setMatches(results as Match[]); // Properly cast results to Match[] type
      toast({
        title: "Successo",
        description: "Match creato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore nella creazione del match",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      await SupabaseService.deleteMatch(matchId);
      setMatches(matches.filter(match => match.id !== matchId));
      toast({
        title: "Successo",
        description: "Match eliminato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'eliminazione del match",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Crea Match</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="bando">Bando</Label>
              <Input
                type="text"
                id="bando"
                placeholder="Cerca bando..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && searchResults.length > 0 && (
                <Card className="mt-2">
                  <CardContent className="p-2">
                    <ul>
                      {searchResults.map(bando => (
                        <li
                          key={bando.id}
                          className="hover:bg-gray-100 p-2 cursor-pointer"
                          onClick={() => {
                            setSelectedBando(bando.id);
                            setSearchTerm(bando.titolo);
                            setSearchResults([]);
                          }}
                        >
                          {bando.titolo}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {searchTerm && searchResults.length === 0 && (
                <Card className="mt-2">
                  <CardContent className="p-2">
                    Nessun bando trovato.
                  </CardContent>
                </Card>
              )}
            </div>
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Select onValueChange={setSelectedCliente}>
                <SelectTrigger id="cliente">
                  <SelectValue placeholder="Seleziona Cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clienti.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleMatch} disabled={isLoading}>
              Crea Match
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Lista Match</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bando</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data Creazione</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map(match => (
                <TableRow key={match.id}>
                  <TableCell>{match.bando_titolo}</TableCell>
                  <TableCell>{match.cliente_nome}</TableCell>
                  <TableCell>{new Date(match.data_creazione).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMatch(match.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Elimina
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchPage;
