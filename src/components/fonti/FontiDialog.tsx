
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { useFonti } from '@/hooks/useFonti';
import FontiTable from '@/components/FontiTable';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface FontiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FontiDialog: React.FC<FontiDialogProps> = ({ open, onOpenChange }) => {
  const { fonti, isLoading } = useFonti();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Fonti Configurate</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : fonti.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Nessuna fonte configurata</AlertTitle>
              <AlertDescription>
                Non sono disponibili fonti di dati.
              </AlertDescription>
            </Alert>
          ) : (
            <FontiTable 
              fonti={fonti}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FontiDialog;
