
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import MatchTable from '@/components/MatchTable';
import { MatchResult } from '@/utils/MatchService';

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
          <DialogTitle className="text-xl">Nuovi Match Trovati</DialogTitle>
          <DialogDescription>
            Abbiamo trovato {matches.length} potenziali match con i tuoi clienti dopo l'importazione di {totalBandi} bandi.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {matches.length > 0 ? (
            <MatchTable 
              matches={matches} 
              onViewDetails={handleViewDetails}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nessun match rilevante trovato per i nuovi bandi.</p>
              <p className="text-sm mt-2">Prova ad aggiungere più dettagli ai tuoi clienti per migliorare la compatibilità.</p>
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
