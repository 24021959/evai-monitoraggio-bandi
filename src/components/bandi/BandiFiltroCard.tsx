
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BandiSearch from './BandiSearch';
import BandiFilter from './BandiFilter';
import { Bando } from "@/types";

interface BandiFiltroCardProps {
  bandi: Bando[];
  filtro: string;
  setFiltro: (filtro: string) => void;
  fonteFiltro: string;
  setFonteFiltro: (fonte: string) => void;
  fontiCombinate: string[];
  onResetFiltri: () => void;
}

const BandiFiltroCard: React.FC<BandiFiltroCardProps> = ({
  bandi,
  filtro,
  setFiltro,
  fonteFiltro,
  setFonteFiltro,
  fontiCombinate,
  onResetFiltri
}) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-4">
        <CardTitle>Filtra Bandi</CardTitle>
        <CardDescription>Ricerca e filtra i bandi in base ai tuoi criteri</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <BandiSearch 
            bandi={bandi} 
            filtro={filtro} 
            setFiltro={setFiltro} 
          />
          
          <BandiFilter
            fonteFiltro={fonteFiltro}
            setFonteFiltro={setFonteFiltro}
            fontiCombinate={fontiCombinate}
          />
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onResetFiltri}>Azzera filtri</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BandiFiltroCard;
