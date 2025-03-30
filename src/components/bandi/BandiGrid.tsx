
import React from 'react';
import BandoCard from '@/components/BandoCard';
import { Bando } from "@/types";

interface BandiGridProps {
  bandi: Bando[];
  onViewDetail: (id: string) => void;
  onDelete: (id: string) => void;
}

const BandiGrid: React.FC<BandiGridProps> = ({ bandi, onViewDetail, onDelete }) => {
  return (
    <>
      <div className="text-sm text-gray-500 mb-2">
        Mostra {bandi.length} bandi
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bandi.map((bando, index) => (
          <div key={bando.id} className={index % 2 === 0 ? "" : "bg-[#FEF7CD] rounded-lg"}>
            <BandoCard 
              bando={bando} 
              onViewDetails={onViewDetail}
              onDelete={onDelete}
              showFullDetails={true}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default BandiGrid;
