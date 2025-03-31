
import React from 'react';
import { FontiHeader } from '@/components/fonti/FontiHeader';
import { FontiLoadingState } from '@/components/fonti/FontiLoadingState';
import { useFonti } from '@/hooks/useFonti';
import { Card, CardContent } from "@/components/ui/card";
import { Database } from 'lucide-react';

const Fonti = () => {
  const { fonti, isLoading } = useFonti();

  return (
    <div className="space-y-6 animate-fade-in">
      <FontiHeader />
      
      {isLoading && <FontiLoadingState />}
      
      <Card className="shadow-md border-t-4 border-t-blue-500 overflow-hidden">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : fonti.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="mx-auto bg-blue-50 text-blue-500 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <Database className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium text-gray-700">Nessuna fonte disponibile</p>
              <p className="text-sm mt-2 text-gray-500">Le fonti vengono configurate dall'amministratore di sistema</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {fonti.map(fonte => (
                <li key={fonte.id} className="py-4 px-2 hover:bg-blue-50 transition-colors rounded-md">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white h-10 w-10 rounded-full flex items-center justify-center mr-4">
                      <span className="font-semibold">{fonte.nome.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="font-medium text-gray-800">{fonte.nome}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Fonti;
