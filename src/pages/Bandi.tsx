
import React from 'react';
import BandiFiltroCard from '@/components/bandi/BandiFiltroCard';
import BandiGrid from '@/components/bandi/BandiGrid';
import BandiEmptyState from '@/components/bandi/BandiEmptyState';
import { useBandiData } from '@/hooks/useBandiData';

const Bandi = () => {
  const {
    bandi,
    filtro,
    setFiltro,
    fonteFiltro,
    setFonteFiltro,
    loading,
    bandiFiltrati,
    handleViewDetail,
    handleDeleteBando,
    handleResetFiltri,
    fontiCombinate
  } = useBandiData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Elenco Bandi</h1>
      </div>
      
      <BandiFiltroCard
        bandi={bandi}
        filtro={filtro}
        setFiltro={setFiltro}
        fonteFiltro={fonteFiltro}
        setFonteFiltro={setFonteFiltro}
        fontiCombinate={fontiCombinate}
        onResetFiltri={handleResetFiltri}
      />
      
      <div>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : bandiFiltrati.length === 0 ? (
          <BandiEmptyState />
        ) : (
          <BandiGrid 
            bandi={bandiFiltrati}
            onViewDetail={handleViewDetail}
            onDelete={handleDeleteBando}
          />
        )}
      </div>
    </div>
  );
};

export default Bandi;
