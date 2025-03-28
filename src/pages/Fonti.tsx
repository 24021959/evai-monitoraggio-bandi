
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, AlertCircle } from 'lucide-react';
import FontiTable from '@/components/FontiTable';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddSourceForm from '@/components/AddSourceForm';
import EditSourceForm from '@/components/EditSourceForm';
import { Fonte } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from '@tanstack/react-query';
import SupabaseFontiService from '@/utils/SupabaseFontiService';

const Fonti = () => {
  const { toast } = useToast();
  const [fonti, setFonti] = useState<Fonte[]>([]);
  const [activeTab, setActiveTab] = useState("fonti");
  const [selectedFonte, setSelectedFonte] = useState<Fonte | null>(null);
  const [currentScrapingFonte, setCurrentScrapingFonte] = useState<Fonte | null>(null);
  
  const { data: supabaseFonti, isLoading } = useQuery({
    queryKey: ['fonti'],
    queryFn: async () => {
      const sources = await SupabaseFontiService.getFonti();
      console.log('Fonti caricate da Supabase:', sources);
      return sources;
    }
  });
  
  useEffect(() => {
    if (supabaseFonti && supabaseFonti.length > 0) {
      setFonti(supabaseFonti);
    }
  }, [supabaseFonti]);
  
  const handleEdit = (id: string) => {
    const fonte = fonti.find(f => f.id === id);
    if (fonte) {
      setSelectedFonte(fonte);
      setActiveTab("modifica");
    }
  };
  
  const handleSaveEdit = async (updatedFonte: Fonte) => {
    setFonti(fonti.map(f => f.id === updatedFonte.id ? updatedFonte : f));
    try {
      const success = await SupabaseFontiService.saveFonte(updatedFonte);
      if (success) {
        toast({
          title: "Fonte aggiornata",
          description: "La fonte è stata aggiornata con successo",
          duration: 3000,
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'aggiornamento della fonte",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
    setSelectedFonte(null);
    setActiveTab("fonti");
  };
  
  const handleCancelEdit = () => {
    setSelectedFonte(null);
    setActiveTab("fonti");
  };
  
  const handleDelete = async (id: string) => {
    try {
      const success = await SupabaseFontiService.deleteFonte(id);
      if (success) {
        setFonti(fonti.filter(fonte => fonte.id !== id));
        toast({
          title: "Fonte eliminata",
          description: "La fonte è stata eliminata con successo",
          duration: 3000,
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione della fonte",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleAddSource = async (newSource: Omit<Fonte, 'id'>) => {
    try {
      const newFonte: Fonte = { id: `temp-${Date.now()}`, ...newSource };
      const success = await SupabaseFontiService.saveFonte(newFonte);
      if (success) {
        const updatedFonti = await SupabaseFontiService.getFonti();
        setFonti(updatedFonti);
        setActiveTab("fonti");
        toast({
          title: "Fonte aggiunta",
          description: "La fonte è stata aggiunta con successo",
          duration: 3000,
        });
      } else {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'aggiunta della fonte",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: `Si è verificato un errore: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestione Fonti di Dati</h1>
      </div>
      
      {isLoading && (
        <Card className="bg-gray-50 border-gray-100">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
            <p className="text-center mt-4 text-gray-500">Caricamento fonti in corso...</p>
          </CardContent>
        </Card>
      )}
      
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
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : fonti.length === 0 ? (
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
                  currentScrapingId={currentScrapingFonte?.id}
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
    </div>
  );
};

export default Fonti;
