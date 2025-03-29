
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import ChartContainer from '@/components/ChartContainer';
import { Bando } from '@/types';

interface UltimiBandiListProps {
  bandi: Bando[];
  isLoading: boolean;
}

const UltimiBandiList: React.FC<UltimiBandiListProps> = ({ bandi, isLoading }) => {
  const navigate = useNavigate();
  
  return (
    <ChartContainer title="Ultimi Bandi" bgColor="bg-gradient-to-br from-amber-50 to-white">
      <div className="overflow-y-auto max-h-64">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center text-gray-400">
            Caricamento in corso...
          </div>
        ) : bandi.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr className="text-sm text-gray-600">
                <th className="text-left py-2 font-medium">Titolo</th>
                <th className="text-right py-2 font-medium">Scadenza</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {bandi.map((bando) => (
                <tr key={bando.id} className="border-t">
                  <td className="py-2 text-blue-500 hover:underline">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/bandi/${bando.id}`); }}>
                      {bando.titolo}
                    </a>
                  </td>
                  <td className="py-2 text-right text-gray-600">
                    {bando.scadenzaDettagliata || new Date(bando.scadenza).toLocaleDateString('it-IT')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-400">
            Nessun bando disponibile
          </div>
        )}
      </div>
      <div className="mt-4 text-right">
        <Button variant="outline" size="sm" onClick={() => navigate('/bandi')}
               className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          Vedi tutti i bandi
        </Button>
      </div>
    </ChartContainer>
  );
};

export default UltimiBandiList;
