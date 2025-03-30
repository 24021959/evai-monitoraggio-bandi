
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import MatchTable from '@/components/MatchTable';
import { MatchResult } from '@/utils/MatchService';
import { Frown } from 'lucide-react';

interface MatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  matches: MatchResult[];
  totalBandi: number;
}

const MatchDialog = ({ isOpen, onClose, matches, totalBandi }: MatchDialogProps) => {
  const navigate = useNavigate();
  
  const handleViewAllMatches = () => {
    navigate('/match');
    onClose();
  };
  
  const handleViewDetails = (matchId: string) => {
    // Per ora navighiamo alla pagina match generale
    // In futuro si potrebbe implementare una pagina di dettaglio specifico
    navigate('/match');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {matches.length > 0 ? 'Nuovi Match Trovati' : 'Nessun Match Trovato'}
          </DialogTitle>
          <DialogDescription>
            {matches.length > 0 
              ? `Abbiamo trovato ${matches.length} potenziali match con i tuoi clienti dopo l'importazione di ${totalBandi} bandi.`
              : `Non abbiamo trovato match rilevanti per i tuoi clienti dopo l'importazione di ${totalBandi} bandi.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {matches.length > 0 ? (
            <MatchTable 
              matches={matches} 
              onViewDetails={handleViewDetails}
            />
          ) : (
            <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center space-y-4">
              <Frown className="h-16 w-16 text-gray-300" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-600">Nessun match rilevante trovato per i nuovi bandi.</p>
                <p className="text-sm">Prova ad aggiungere più dettagli ai tuoi clienti per migliorare la compatibilità.</p>
                <p className="text-sm text-gray-400 italic">Puoi modificare i profili dei clienti aggiungendo settori di interesse e requisiti specifici.</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Chiudi
          </Button>
          {matches.length > 0 && (
            <Button onClick={handleViewAllMatches} className="bg-blue-500 hover:bg-blue-600">
              Visualizza tutti i match
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MatchDialog;
