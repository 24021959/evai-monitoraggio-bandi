
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import AddSourceForm from '@/components/add-source/AddSourceForm';
import { Fonte } from '@/types';
import { DuplicateFonteDialog } from './DuplicateFonteDialog';

interface AggiungiTabContentProps {
  onAddSource: (newSource: Omit<Fonte, 'id'>) => Promise<boolean>;
  fonti: Fonte[];
}

export const AggiungiTabContent: React.FC<AggiungiTabContentProps> = ({ 
  onAddSource,
  fonti 
}) => {
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateUrl, setDuplicateUrl] = useState('');
  const [existingFonteName, setExistingFonteName] = useState('');

  const handleAddSource = async (newSource: Omit<Fonte, 'id'>): Promise<boolean> => {
    // Check for duplicate URL
    const duplicateFonte = fonti.find(fonte => fonte.url.trim().toLowerCase() === newSource.url.trim().toLowerCase());
    
    if (duplicateFonte) {
      setDuplicateUrl(newSource.url);
      setExistingFonteName(duplicateFonte.nome);
      setShowDuplicateDialog(true);
      return false;
    }
    
    return await onAddSource(newSource);
  };

  return (
    <div className="grid grid-cols-1">
      <div>
        <AddSourceForm onAddSource={handleAddSource} />
      </div>
      
      <DuplicateFonteDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        duplicateUrl={duplicateUrl}
        existingFonteName={existingFonteName}
      />
    </div>
  );
};
