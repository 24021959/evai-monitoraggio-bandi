
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  FileText, 
  ChevronDown, 
  Building, 
  FileSearch, 
  Calendar, 
  Percent,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MatchResult } from '@/utils/MatchService';

export interface MatchTableProps {
  matches?: MatchResult[];
  onExportCSV?: () => void;
  onViewDetails?: (matchId: string) => void;
}

const MatchTable: React.FC<MatchTableProps> = ({ 
  matches = [], 
  onExportCSV,
  onViewDetails 
}) => {
  // Sort matches by score in descending order (highest first)
  const sortedMatches = [...matches].sort(
    (a, b) => b.punteggio - a.punteggio
  );
  
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  
  const toggleExpandMatch = (matchId: string) => {
    if (expandedMatch === matchId) {
      setExpandedMatch(null);
    } else {
      setExpandedMatch(matchId);
    }
  };
  
  // Funzione per determinare il colore del badge in base al punteggio
  const getBadgeClassName = (punteggio: number) => {
    if (punteggio >= 85) return "bg-green-100 text-green-800 hover:bg-green-200";
    if (punteggio >= 70) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    if (punteggio >= 50) return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };
  
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-1/3">Cliente</TableHead>
            <TableHead className="w-1/3">Bando</TableHead>
            <TableHead className="w-1/6">Match</TableHead>
            <TableHead className="w-1/6">Scadenza</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMatches.length > 0 ? (
            sortedMatches.map((match) => (
              <React.Fragment key={match.id}>
                <TableRow className="hover:bg-slate-50 border-b transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center">
                        <Building className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{match.cliente.nome}</div>
                        <div className="text-xs text-slate-500">{match.cliente.settore}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileSearch className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{match.bando.titolo}</div>
                        <div className="text-xs text-slate-500">{match.bando.fonte}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className={getBadgeClassName(match.punteggio)}>
                            <Percent className="h-3 w-3 mr-1" />
                            {match.punteggio}%
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Compatibilità calcolata in base a requisiti e caratteristiche</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="text-sm">
                        {new Date(match.bando.scadenza).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleExpandMatch(match.id)}
                      aria-label={expandedMatch === match.id ? "Chiudi dettagli" : "Mostra dettagli"}
                    >
                      {expandedMatch === match.id ? 
                        <ChevronDown className="h-4 w-4 text-slate-600" /> : 
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                      }
                    </Button>
                  </TableCell>
                </TableRow>
                
                {/* Riga espansa con dettagli */}
                {expandedMatch === match.id && match.dettaglioMatch && (
                  <TableRow className="bg-slate-50">
                    <TableCell colSpan={5} className="py-3 px-4">
                      <div className="rounded-md border border-slate-200 bg-white p-4">
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Info className="h-4 w-4 mr-2 text-blue-500" />
                          Dettagli compatibilità
                        </h4>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {match.dettaglioMatch.map((detail, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2 mt-0.5">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="mt-4 flex justify-end">
                          {onViewDetails && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => onViewDetails(match.id)}
                              className="text-xs"
                            >
                              Visualizza scheda completa
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FileSearch className="h-8 w-8 text-slate-300" />
                  <div>Nessun match trovato.</div>
                  <div className="text-sm">Importa bandi e clienti per generare match.</div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {sortedMatches.length > 0 && (
        <div className="flex justify-end">
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600" 
            onClick={onExportCSV}
          >
            <FileText className="h-4 w-4" />
            Esporta CSV
          </Button>
        </div>
      )}
    </div>
  );
};

export default MatchTable;
