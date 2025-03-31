
import React from 'react';
import { FontiHeader } from '@/components/fonti/FontiHeader';
import { FontiLoadingState } from '@/components/fonti/FontiLoadingState';
import { useFonti } from '@/hooks/useFonti';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Fonti = () => {
  const { fonti, isLoading } = useFonti();

  return (
    <div className="space-y-6 animate-fade-in">
      <FontiHeader />
      
      {isLoading && <FontiLoadingState />}
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Fonti Configurate</CardTitle>
          <CardDescription>Lista delle fonti da cui vengono estratti i bandi</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : fonti.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nessuna fonte disponibile</p>
              <p className="text-sm mt-2">Le fonti vengono configurate dall'amministratore di sistema</p>
            </div>
          ) : (
            <ul className="divide-y">
              {fonti.map(fonte => (
                <li key={fonte.id} className="py-3">
                  <div className="font-medium">{fonte.nome}</div>
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
