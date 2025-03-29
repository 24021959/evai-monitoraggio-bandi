
import React, { useEffect, useState } from 'react';
import { mockStatistiche } from '@/data/mockData';
import { Bando } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import SupabaseClientiService from '@/utils/SupabaseClientiService';

// Import refactored components
import StatCardsSection from '@/components/dashboard/StatCardsSection';
import BandiDistributionChart from '@/components/dashboard/BandiDistributionChart';
import UltimiBandiList from '@/components/dashboard/UltimiBandiList';
import MatchPerClienteChart from '@/components/dashboard/MatchPerClienteChart';

const Dashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [allBandi, setAllBandi] = useState<Bando[]>([]);
  const [clientiCount, setClientiCount] = useState<number>(0);
  
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        console.log('Dashboard: Loading bandi...');
        // Get bandi from Supabase
        const bandiFromDB = await SupabaseBandiService.getBandi();
        setAllBandi(bandiFromDB);
        console.log("Dashboard: Bandi count:", bandiFromDB.length);
        
        if (bandiFromDB.length === 0) {
          console.log("Dashboard: No bandi found in any source");
        }
        
        // Carica il numero di clienti
        const clienti = await SupabaseClientiService.getClienti();
        setClientiCount(clienti.length);
        console.log("Dashboard: Clienti count:", clienti.length);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i dati",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllData();
  }, [toast]);
  
  const calcStatistiche = () => {
    const europei = allBandi.filter(b => b.tipo === 'europeo').length;
    const statali = allBandi.filter(b => b.tipo === 'statale').length;
    const regionali = allBandi.filter(b => b.tipo === 'regionale').length;
    const altri = allBandi.filter(b => b.tipo !== 'europeo' && b.tipo !== 'statale' && b.tipo !== 'regionale').length;
    
    const settoriCount: Record<string, number> = {};
    allBandi.forEach(bando => {
      if (bando.settori && Array.isArray(bando.settori)) {
        bando.settori.forEach(settore => {
          settoriCount[settore] = (settoriCount[settore] || 0) + 1;
        });
      }
    });
    
    const bandoPerSettore = Object.entries(settoriCount)
      .map(([settore, count]) => ({
        settore,
        percentuale: allBandi.length > 0 ? Math.round((count / allBandi.length) * 100) : 0
      }))
      .sort((a, b) => b.percentuale - a.percentuale)
      .slice(0, 5);
    
    return {
      bandiAttivi: allBandi.length,
      distribuzioneBandi: { europei, statali, regionali, altri },
      bandoPerSettore
    };
  };
  
  const stats = calcStatistiche();
  
  // Prepare data for BandiDistributionChart
  const distribuzioneBandiData = [
    { name: 'Europei', value: stats.distribuzioneBandi.europei, color: '#0066cc' },
    { name: 'Statali', value: stats.distribuzioneBandi.statali, color: '#00cc44' },
    { name: 'Regionali', value: stats.distribuzioneBandi.regionali, color: '#ff9900' },
    { name: 'Altri', value: stats.distribuzioneBandi.altri, color: '#5A6474' },
  ].filter(item => item.value > 0); // Show only non-zero values

  // Prepare data for UltimiBandiList
  const ultimiBandi = [...allBandi]
    .sort((a, b) => new Date(b.scadenza).getTime() - new Date(a.scadenza).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 pb-2 border-b border-gray-200">Dashboard</h1>
      
      {/* Stats Cards Section */}
      <StatCardsSection 
        bandiCount={stats.bandiAttivi}
        clientiCount={clientiCount}
        matchCount={mockStatistiche.matchRecenti}
        isLoading={isLoading}
      />
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BandiDistributionChart 
          distributionData={distribuzioneBandiData}
          isLoading={isLoading}
        />
        
        <UltimiBandiList 
          bandi={ultimiBandi}
          isLoading={isLoading}
        />
      </div>
      
      {/* Match per Cliente Section */}
      <div className="grid grid-cols-1 gap-6">
        <MatchPerClienteChart matchData={mockStatistiche.matchPerCliente} />
      </div>
    </div>
  );
};

export default Dashboard;
