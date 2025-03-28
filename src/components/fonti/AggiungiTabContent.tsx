
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HelpCircle } from 'lucide-react';
import AddSourceForm from '@/components/add-source/AddSourceForm';
import { Fonte } from '@/types';

interface AggiungiTabContentProps {
  onAddSource: (newSource: Omit<Fonte, 'id'>) => Promise<void>;
}

export const AggiungiTabContent: React.FC<AggiungiTabContentProps> = ({ onAddSource }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <AddSourceForm onAddSource={onAddSource} />
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
  );
};
