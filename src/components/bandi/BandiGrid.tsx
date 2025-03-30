
import React from 'react';
import BandoCard from '@/components/BandoCard';
import { Bando } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Clock } from 'lucide-react';

interface BandiGridProps {
  bandi: Bando[];
  onViewDetail: (id: string) => void;
  onDelete: (id: string) => void;
  evidenziaNuovi?: boolean;
}

const BandiGrid: React.FC<BandiGridProps> = ({ 
  bandi, 
  onViewDetail, 
  onDelete, 
  evidenziaNuovi = false 
}) => {
  // Identifica i bandi importati nelle ultime 24 ore
  const isNuovoBando = (bando: Bando) => {
    if (!bando.created_at) return false;
    const dataCreazione = new Date(bando.created_at);
    const oggi = new Date();
    const diffMs = oggi.getTime() - dataCreazione.getTime();
    const diffOre = diffMs / (1000 * 60 * 60);
    return diffOre <= 24;
  };

  return (
    <>
      <div className="text-sm text-gray-500 mb-2">
        Mostra {bandi.length} bandi
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bandi.map((bando, index) => {
          const isNuovo = evidenziaNuovi && isNuovoBando(bando);
          return (
            <div 
              key={bando.id} 
              className={`${index % 2 === 0 ? "" : "bg-[#FEF7CD]"} ${isNuovo ? "ring-2 ring-blue-400" : ""} rounded-lg transition-all hover:shadow-md`}
            >
              {isNuovo && (
                <div className="bg-blue-500 text-white text-xs py-1 px-2 rounded-t-lg flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Nuovo bando importato
                </div>
              )}
              <BandoCard 
                bando={bando} 
                onViewDetails={onViewDetail}
                onDelete={onDelete}
                showFullDetails={true}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default BandiGrid;
