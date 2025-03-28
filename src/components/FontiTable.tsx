
import React, { useState } from 'react';
import { Fonte } from '../types';
import { Trash2, CheckCircle, Edit, ExternalLink, Save, X, FileSpreadsheet } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import GoogleSheetsService from '@/utils/GoogleSheetsService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [editingFonte, setEditingFonte] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateSheetUrl, setUpdateSheetUrl] = useState<string>(localStorage.getItem('googleSheetUpdateUrl') || '');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(localStorage.getItem('googleSheetUrl') || '');

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

  const handleEditUrl = (fonte: Fonte) => {
    setEditingFonte(fonte.id);
    setEditUrl(fonte.url);
  };

  const saveUpdateSheetUrl = () => {
    localStorage.setItem('googleSheetUpdateUrl', updateSheetUrl);
    setShowUpdateDialog(false);
    toast({
      title: "URL salvato",
      description: "L'URL per l'aggiornamento del foglio Google è stato salvato",
    });
  };

  const saveGoogleSheetUrl = () => {
    localStorage.setItem('googleSheetUrl', googleSheetUrl);
    GoogleSheetsService.setSheetUrl(googleSheetUrl);
    setShowImportDialog(false);
    toast({
      title: "URL salvato",
      description: "L'URL del foglio Google è stato salvato",
    });
  };

  const handleSaveUrl = async (fonteId: string) => {
    const fonte = fonti.find(f => f.id === fonteId);
    if (!fonte) return;

    setIsUpdating(true);

    const updatedFonte = { ...fonte, url: editUrl };
    
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
    } finally {
      setIsUpdating(false);
      setEditingFonte(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingFonte(null);
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
            {fonti.map((fonte) => {
              const isEditing = editingFonte === fonte.id;
              
              return (
                <TableRow key={fonte.id}>
                  <TableCell className="font-medium">{fonte.nome}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    ) : (
                      <a 
                        href={fonte.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1"
                      >
                        {fonte.url}
                        <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    )}
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
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleSaveUrl(fonte.id)}
                            className="text-green-500 hover:text-green-700"
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <span className="flex items-center">
                                <span className="animate-spin h-4 w-4 mr-1 border-2 border-t-transparent border-green-500 rounded-full"></span>
                                Salvataggio...
                              </span>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-1" />
                                Salva
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={handleCancelEdit}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditUrl(fonte)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            URL
                          </Button>
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
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configura URL per l'aggiornamento del foglio Google</DialogTitle>
            <DialogDescription>
              Per sincronizzare le modifiche con il foglio Google Sheets, inserisci l'URL del tuo Google Apps Script Web App che può aggiornare il foglio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="update-url" className="text-sm font-medium">URL del Web App</label>
              <Input
                id="update-url"
                value={updateSheetUrl}
                onChange={(e) => setUpdateSheetUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/your-script-id/exec"
              />
              <p className="text-xs text-gray-500">
                Nota: Dovrai creare un Google Apps Script Web App con le autorizzazioni appropriate per modificare il tuo foglio.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>Annulla</Button>
            <Button onClick={saveUpdateSheetUrl}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configura Google Sheets</DialogTitle>
            <DialogDescription>
              Inserisci l'URL del foglio Google Sheets che contiene le fonti da importare e sincronizzare.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="sheet-url" className="text-sm font-medium">URL del foglio Google</label>
              <Input
                id="sheet-url"
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1E4ZR9tgeBZV545JJuduvWHtlRqo5GyW_woBXt8ooQ8E/edit"
              />
              <p className="text-xs text-gray-500">
                Esempio: https://docs.google.com/spreadsheets/d/1E4ZR9tgeBZV545JJuduvWHtlRqo5GyW_woBXt8ooQ8E/edit
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>Annulla</Button>
            <Button onClick={saveGoogleSheetUrl}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FontiTable;
