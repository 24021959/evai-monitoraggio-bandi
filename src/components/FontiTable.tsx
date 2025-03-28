
import React, { useState } from 'react';
import { Fonte } from '../types';
import { FileSpreadsheet } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { FonteRow } from './fonti/FonteRow';
import { GoogleSheetsConfigDialog } from './fonti/GoogleSheetsConfigDialog';
import { UpdateSheetDialog } from './fonti/UpdateSheetDialog';

interface FontiTableProps {
  fonti: Fonte[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const FontiTable: React.FC<FontiTableProps> = ({ 
  fonti, 
  onEdit, 
  onDelete
}) => {
  const { toast } = useToast();
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [updateSheetUrl, setUpdateSheetUrl] = useState<string>(localStorage.getItem('googleSheetUpdateUrl') || '');
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(localStorage.getItem('googleSheetUrl') || '');

  const handleSaveUrl = async (fonteId: string, newUrl: string) => {
    const fonte = fonti.find(f => f.id === fonteId);
    if (!fonte) return;

    const updatedFonte = { ...fonte, url: newUrl };
    
    try {
      const updated = await GoogleSheetsService.updateFonteInSheet(updatedFonte);
      
      if (updated) {
        toast({
          title: "URL aggiornato",
          description: "L'URL della fonte è stato aggiornato con successo sia localmente che nel foglio Google",
        });
      } else {
        toast({
          title: "URL aggiornato parzialmente",
          description: "L'URL è stato aggiornato localmente. Per aggiornare il foglio Google, configurare l'URL di aggiornamento.",
          variant: "default"
        });
        setShowUpdateDialog(true);
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dell'URL",
        variant: "destructive"
      });
      console.error("Errore durante l'aggiornamento:", error);
    }
  };

  return (
    <>
      <div className="flex justify-between mb-4">
        <Button 
          variant="outline" 
          onClick={() => setShowImportDialog(true)}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Configura Google Sheets
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fonti.map((fonte) => (
              <FonteRow 
                key={fonte.id}
                fonte={fonte}
                onEdit={onEdit}
                onDelete={onDelete}
                onEditUrl={() => {}}
                onSaveUrl={handleSaveUrl}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <GoogleSheetsConfigDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        googleSheetUrl={googleSheetUrl}
        setGoogleSheetUrl={setGoogleSheetUrl}
      />

      <UpdateSheetDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        updateSheetUrl={updateSheetUrl}
        setUpdateSheetUrl={setUpdateSheetUrl}
      />
    </>
  );
};

export default FontiTable;
