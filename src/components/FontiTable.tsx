
import React from 'react';
import { Fonte } from '../types';
import { Trash2, CheckCircle, AlertCircle, Clock, ArrowRight, StopCircle } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Progress } from '@/components/ui/progress';

interface FontiTableProps {
  fonti: Fonte[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  currentScrapingId?: string | null;
  scrapingProgress?: number;
  onStopScraping?: () => void;
}

const FontiTable: React.FC<FontiTableProps> = ({ 
  fonti, 
  onEdit, 
  onDelete, 
  currentScrapingId, 
  scrapingProgress = 0,
  onStopScraping
}) => {
  const getTipoClass = (tipo: string) => {
    switch (tipo) {
      case 'statale':
        return 'bg-green-500';
      case 'europeo':
        return 'bg-blue-500';
      case 'regionale':
        return 'bg-teal-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Scraping</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fonti.map((fonte) => {
            const isScraped = FirecrawlService.isSourceScraped(fonte.id);
            const isCurrentlyScraping = currentScrapingId === fonte.id;
            
            let scrapingStatus;
            if (isCurrentlyScraping) {
              scrapingStatus = (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="h-4 w-4 animate-pulse" />
                      <span className="text-xs">In corso ({scrapingProgress}%)</span>
                    </div>
                    {onStopScraping && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={onStopScraping}
                        className="text-red-500 hover:text-red-700 h-6 px-2"
                      >
                        <StopCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Progress value={scrapingProgress} className="h-2 bg-gray-200" indicatorClassName="bg-green-500" />
                </div>
              );
            } else if (isScraped) {
              scrapingStatus = (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Completato</span>
                </div>
              );
            } else {
              // Find next unscraped source
              const nextUnscrapedSource = FirecrawlService.getNextUnscrapedSource(fonti);
              const isNext = nextUnscrapedSource && nextUnscrapedSource.id === fonte.id;
              
              scrapingStatus = (
                <div className={`flex items-center gap-1 ${isNext ? 'text-orange-500' : 'text-gray-500'}`}>
                  {isNext ? (
                    <>
                      <ArrowRight className="h-4 w-4 animate-bounce" />
                      <span className="text-xs font-medium">Prossima</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">In attesa</span>
                    </>
                  )}
                </div>
              );
            }
            
            return (
              <TableRow key={fonte.id} className={isCurrentlyScraping ? 'bg-blue-50' : ''}>
                <TableCell className="font-medium">{fonte.nome}</TableCell>
                <TableCell>
                  <a 
                    href={fonte.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {fonte.url}
                  </a>
                </TableCell>
                <TableCell>
                  <span className={`text-xs text-white px-2 py-1 rounded-full ${getTipoClass(fonte.tipo)}`}>
                    {fonte.tipo}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full ${fonte.stato === 'attivo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {fonte.stato}
                  </span>
                </TableCell>
                <TableCell>
                  {scrapingStatus}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onEdit(fonte.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Dettagli
                      </Button>
                    )}
                    {onDelete && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onDelete(fonte.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default FontiTable;
