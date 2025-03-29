
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FontiHeader } from '@/components/fonti/FontiHeader';
import { FontiLoadingState } from '@/components/fonti/FontiLoadingState';
import { FontiTabContent } from '@/components/fonti/FontiTabContent';
import { AggiungiTabContent } from '@/components/fonti/AggiungiTabContent';
import { useFonti } from '@/hooks/useFonti';
import { Fonte } from '@/types';

const Fonti = () => {
  const [activeTab, setActiveTab] = useState("fonti");
  const {
    fonti,
    isLoading,
    importingFromSheets,
    handleDelete,
    handleAddSource,
    importFromGoogleSheets
  } = useFonti();

  // Add source handler also changes the active tab
  const onAddSource = async (newSource: Omit<Fonte, 'id'>) => {
    const success = await handleAddSource(newSource);
    if (success) {
      setActiveTab("fonti");
    }
    return success;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <FontiHeader 
        importingFromSheets={importingFromSheets}
        onImportFromGoogleSheets={importFromGoogleSheets}
      />
      
      {isLoading && <FontiLoadingState />}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="fonti" className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white">Fonti Configurate</TabsTrigger>
          <TabsTrigger value="aggiungi" className="bg-blue-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white">Aggiungi Fonte</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fonti">
          <FontiTabContent 
            fonti={fonti} 
            isLoading={isLoading}
            onDelete={handleDelete}
          />
        </TabsContent>
        
        <TabsContent value="aggiungi">
          <AggiungiTabContent 
            onAddSource={onAddSource} 
            fonti={fonti}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Fonti;
