
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HelpCircle } from 'lucide-react';
import EditSourceForm from '@/components/EditSourceForm';
import { Fonte } from '@/types';

interface ModificaTabContentProps {
  fonte: Fonte;
  onSave: (updatedFonte: Fonte) => void;
  onCancel: () => void;
}

export const ModificaTabContent: React.FC<ModificaTabContentProps> = ({ 
  fonte, 
  onSave, 
  onCancel 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <EditSourceForm 
          fonte={fonte} 
          onSave={onSave} 
          onCancel={onCancel} 
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
  );
};
