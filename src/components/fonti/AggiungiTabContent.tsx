
import React from 'react';
import { Card } from "@/components/ui/card";
import AddSourceForm from '@/components/add-source/AddSourceForm';
import { Fonte } from '@/types';

interface AggiungiTabContentProps {
  onAddSource: (newSource: Omit<Fonte, 'id'>) => Promise<void>;
}

export const AggiungiTabContent: React.FC<AggiungiTabContentProps> = ({ onAddSource }) => {
  return (
    <div className="grid grid-cols-1">
      <div>
        <AddSourceForm onAddSource={onAddSource} />
      </div>
    </div>
  );
};
