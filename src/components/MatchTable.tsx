
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
  // Sort matches by date in descending order (newest first)
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(b.dataMatch).getTime() - new Date(a.dataMatch).getTime()
  );
  
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
          {sortedMatches.length > 0 ? (
            sortedMatches.map((match) => (
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                Nessun match trovato. Importa bandi e clienti per generare match.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <div className="flex justify-end">
        <Button variant="default" size="sm" className="flex items-center gap-2" onClick={onExportCSV}>
          <FileText className="h-4 w-4" />
          Esporta CSV
        </Button>
      </div>
    </div>
  );
};

export default MatchTable;
