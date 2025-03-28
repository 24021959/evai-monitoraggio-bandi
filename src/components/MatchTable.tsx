
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, FileText } from 'lucide-react';

export interface MatchTableProps {
  matches?: Array<{
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
  }>;
  onExportCSV?: () => void;
}

const MatchTable: React.FC<MatchTableProps> = ({ matches = [], onExportCSV }) => {
  // Dati di esempio se non ci sono match
  const exampleMatches = [
    {
      id: '1',
      cliente: {
        id: 'c1',
        nome: 'Tecno Soluzioni SRL',
        settore: 'Informatica'
      },
      bando: {
        id: 'b1',
        titolo: 'Innovazione Digitale PMI',
        fonte: 'MIMIT',
        scadenza: '2023-12-31'
      },
      punteggio: 94,
      dataMatch: '2023-06-15'
    },
    {
      id: '2',
      cliente: {
        id: 'c2',
        nome: 'Green Power SpA',
        settore: 'Energia'
      },
      bando: {
        id: 'b2',
        titolo: 'Green Energy Transition',
        fonte: 'UE',
        scadenza: '2023-11-30'
      },
      punteggio: 88,
      dataMatch: '2023-06-14'
    },
    {
      id: '3',
      cliente: {
        id: 'c3',
        nome: 'Agritech SA',
        settore: 'Agricoltura'
      },
      bando: {
        id: 'b3',
        titolo: 'Agricoltura Sostenibile',
        fonte: 'Regione',
        scadenza: '2023-10-15'
      },
      punteggio: 79,
      dataMatch: '2023-06-13'
    }
  ];
  
  const displayMatches = matches.length > 0 ? matches : exampleMatches;
  
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Bando</TableHead>
            <TableHead>Match</TableHead>
            <TableHead>Scadenza</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayMatches.map((match) => (
            <TableRow key={match.id}>
              <TableCell>
                <div className="font-medium">{match.cliente.nome}</div>
                <div className="text-xs text-gray-500">{match.cliente.settore}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{match.bando.titolo}</div>
                <div className="text-xs text-gray-500">{match.bando.fonte}</div>
              </TableCell>
              <TableCell>
                <Badge className={
                  match.punteggio > 85 ? "bg-green-100 text-green-800" : 
                  match.punteggio > 70 ? "bg-yellow-100 text-yellow-800" : 
                  "bg-gray-100 text-gray-800"
                }>
                  {match.punteggio}%
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(match.bando.scadenza).toLocaleDateString('it-IT')}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {displayMatches === exampleMatches && (
        <div className="text-xs text-gray-500 italic text-center">
          Dati di esempio visualizzati. Importa bandi e clienti per vedere match reali.
        </div>
      )}
      
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={onExportCSV}>
          <FileText className="h-4 w-4" />
          Esporta CSV
        </Button>
      </div>
    </div>
  );
};

export default MatchTable;
