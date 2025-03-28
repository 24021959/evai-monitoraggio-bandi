
import React, { useState } from 'react';
import { Fonte } from '../types';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { FonteRow } from './fonti/FonteRow';
import { GoogleSheetsConfigDialog } from './fonti/GoogleSheetsConfigDialog';
import { UpdateSheetDialog } from './fonti/UpdateSheetDialog';
import { FontiTableHeader } from './fonti/FontiTableHeader';
import { useFontiUrlHandler } from '@/utils/FontiUrlHandler';

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
  const { handleSaveUrl } = useFontiUrlHandler();
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [updateSheetUrl, setUpdateSheetUrl] = useState<string>(localStorage.getItem('googleSheetUpdateUrl') || '');
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(localStorage.getItem('googleSheetUrl') || '');

  const handleConfigureGoogleSheets = () => {
    setShowImportDialog(true);
  };

  const handleEditUrl = (id: string) => {
    // This is a placeholder function as the actual URL editing
    // is now handled in the FonteRow component
  };

  return (
    <>
      <FontiTableHeader onConfigureGoogleSheets={handleConfigureGoogleSheets} />
      
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
                onEditUrl={handleEditUrl}
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
