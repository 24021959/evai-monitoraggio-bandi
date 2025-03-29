
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
import { N8nWebhookConfigDialog } from './fonti/N8nWebhookConfigDialog';
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
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string>(localStorage.getItem('n8nWebhookUrl') || '');

  const handleConfigureWebhook = () => {
    setShowConfigDialog(true);
  };

  const handleEditUrl = (id: string) => {
    // This is a placeholder function as the actual URL editing
    // is now handled in the FonteRow component
  };

  return (
    <>
      <FontiTableHeader onConfigureN8n={handleConfigureWebhook} />
      
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

      <N8nWebhookConfigDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
      />
    </>
  );
};

export default FontiTable;
