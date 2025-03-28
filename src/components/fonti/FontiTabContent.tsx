
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertCircle, AlertTitle, AlertDescription } from "@/components/ui/alert";
import FontiTable from '@/components/FontiTable';
import { Fonte } from '@/types';

interface FontiTabContentProps {
  fonti: Fonte[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const FontiTabContent: React.FC<FontiTabContentProps> = ({ 
  fonti, 
  isLoading, 
  onEdit, 
  onDelete 
}) => {
  return (
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
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </CardContent>
    </Card>
  );
};
