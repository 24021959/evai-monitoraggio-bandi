
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FontiHeader } from '@/components/fonti/FontiHeader';
import { FontiLoadingState } from '@/components/fonti/FontiLoadingState';
import { FontiTabContent } from '@/components/fonti/FontiTabContent';
import { AggiungiTabContent } from '@/components/fonti/AggiungiTabContent';
import { ModificaTabContent } from '@/components/fonti/ModificaTabContent';
import { useFonti } from '@/hooks/useFonti';
import { Fonte } from '@/types';

const Fonti = () => {
  const [activeTab, setActiveTab] = useState("fonti");
  const {
    fonti,
    isLoading,
    selectedFonte,
    importingFromSheets,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleAddSource,
    importFromGoogleSheets
  } = useFonti();

  // Edit handler also changes the active tab
  const onEdit = (id: string) => {
    handleEdit(id);
    setActiveTab("modifica");
  };

  // Add source handler also changes the active tab
  const onAddSource = async (newSource: Omit<Fonte, 'id'>) => {
    const success = await handleAddSource(newSource);
    if (success) {
      setActiveTab("fonti");
    }
  };

  // Save edit handler also changes the active tab
  const onSaveEdit = (updatedFonte: Fonte) => {
    handleSaveEdit(updatedFonte);
    setActiveTab("fonti");
  };

  // Cancel edit handler also changes the active tab
  const onCancelEdit = () => {
    handleCancelEdit();
    setActiveTab("fonti");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <FontiHeader 
        importingFromSheets={importingFromSheets}
        onImportFromGoogleSheets={importFromGoogleSheets}
      />
      
      {isLoading && <FontiLoadingState />}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="fonti">Fonti Configurate</TabsTrigger>
          <TabsTrigger value="aggiungi">Aggiungi Fonte</TabsTrigger>
          <TabsTrigger value="modifica" disabled={!selectedFonte}>Modifica Fonte</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fonti">
          <FontiTabContent 
            fonti={fonti} 
            isLoading={isLoading}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
        
        <TabsContent value="aggiungi">
          <AggiungiTabContent onAddSource={onAddSource} />
        </TabsContent>
        
        <TabsContent value="modifica">
          {selectedFonte && (
            <ModificaTabContent 
              fonte={selectedFonte} 
              onSave={onSaveEdit} 
              onCancel={onCancelEdit} 
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Fonti;
