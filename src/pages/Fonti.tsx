
import React, { useState } from 'react';
import { mockFonti } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from 'lucide-react';
import FontiTable from '@/components/FontiTable';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddSourceForm from '@/components/AddSourceForm';
import EditSourceForm from '@/components/EditSourceForm';
import { Fonte } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Fonti = () => {
  const { toast } = useToast();
  const [fonti, setFonti] = useState(mockFonti);
  const [activeTab, setActiveTab] = useState("fonti");
  const [selectedFonte, setSelectedFonte] = useState<Fonte | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingFonte, setViewingFonte] = useState<Fonte | null>(null);
  
  const handleEdit = (id: string) => {
    const fonte = fonti.find(f => f.id === id);
    if (fonte) {
      setSelectedFonte(fonte);
      setActiveTab("modifica");
    }
  };
  
  const handleView = (id: string) => {
    const fonte = fonti.find(f => f.id === id);
    if (fonte) {
      setViewingFonte(fonte);
      setViewDialogOpen(true);
    }
  };
  
  const handleSaveEdit = (updatedFonte: Fonte) => {
    setFonti(fonti.map(f => f.id === updatedFonte.id ? updatedFonte : f));
    setSelectedFonte(null);
    setActiveTab("fonti");
    toast({
      title: "Fonte aggiornata",
      description: "La fonte è stata aggiornata con successo",
      duration: 3000,
    });
  };
  
  const handleCancelEdit = () => {
    setSelectedFonte(null);
    setActiveTab("fonti");
  };
  
  const handleDelete = (id: string) => {
    setFonti(fonti.filter(fonte => fonte.id !== id));
    toast({
      title: "Fonte eliminata",
      description: "La fonte è stata eliminata con successo",
      duration: 3000,
    });
  };

  const handleAddSource = (newSource: Omit<Fonte, 'id'>) => {
    const id = `fonte-${Date.now()}`;
    setFonti([...fonti, { id, ...newSource }]);
    setActiveTab("fonti");
    toast({
      title: "Fonte aggiunta",
      description: "La fonte è stata aggiunta con successo",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestione Fonti di Dati</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="fonti">Fonti Configurate</TabsTrigger>
          <TabsTrigger value="aggiungi">Aggiungi Fonte</TabsTrigger>
          <TabsTrigger value="modifica" disabled={!selectedFonte}>Modifica Fonte</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fonti">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Fonti Configurate</CardTitle>
              <CardDescription>Gestisci le fonti da cui estrarre i dati sui bandi</CardDescription>
            </CardHeader>
            <CardContent>
              {fonti.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nessuna fonte configurata</AlertTitle>
                  <AlertDescription>
                    Aggiungi almeno una fonte per avviare il monitoraggio dei bandi.
                  </AlertDescription>
                </Alert>
              ) : (
                <FontiTable 
                  fonti={fonti} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="aggiungi">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AddSourceForm onAddSource={handleAddSource} />
            </div>
            
            <div>
              <Card className="bg-blue-50 border-blue-100">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                    <CardTitle>Suggerimenti</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Aggiungi siti web di fonti ufficiali per il monitoraggio dei bandi. Alcune fonti consigliate:
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">UE</span>
                      <span>ec.europa.eu/info/funding-tenders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">IT</span>
                      <span>mise.gov.it/bandi</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">REG</span>
                      <span>regione.lombardia.it/bandi</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="modifica">
          {selectedFonte && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EditSourceForm 
                  fonte={selectedFonte} 
                  onSave={handleSaveEdit} 
                  onCancel={handleCancelEdit} 
                />
              </div>
              
              <div>
                <Card className="bg-blue-50 border-blue-100">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-blue-500" />
                      <CardTitle>Suggerimenti</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Aggiorna i dettagli della fonte per migliorare il monitoraggio:
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>• Assicurati che l'URL sia corretto e accessibile</li>
                      <li>• Imposta su "inattivo" le fonti che non vuoi monitorare temporaneamente</li>
                      <li>• Scegli il tipo corretto per migliorare la categorizzazione</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dettagli Fonte</DialogTitle>
            <DialogDescription>
              Visualizza i dettagli della fonte selezionata
            </DialogDescription>
          </DialogHeader>
          {viewingFonte && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Nome</h4>
                <p className="text-gray-700">{viewingFonte.nome}</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">URL</h4>
                <a 
                  href={viewingFonte.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {viewingFonte.url}
                </a>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Tipo</h4>
                <span className={`text-xs text-white px-2 py-1 rounded-full inline-block ${
                  viewingFonte.tipo === 'statale' ? 'bg-green-500' : 
                  viewingFonte.tipo === 'europeo' ? 'bg-blue-500' : 
                  viewingFonte.tipo === 'regionale' ? 'bg-teal-500' : 'bg-gray-500'
                }`}>
                  {viewingFonte.tipo}
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Stato</h4>
                <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                  viewingFonte.stato === 'attivo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {viewingFonte.stato}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Fonti;
