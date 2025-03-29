
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FileText, Users, GitCompare } from 'lucide-react';
import { mockStatistiche } from '@/data/mockData';
import StatCard from '@/components/StatCard';
import ChartContainer from '@/components/ChartContainer';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Bando, Cliente } from '@/types';
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import SupabaseClientiService from '@/utils/SupabaseClientiService';
import { useToast } from '@/components/ui/use-toast';
import StatisticheCard from '@/components/StatisticheCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [allBandi, setAllBandi] = useState<Bando[]>([]);
  const [clientiCount, setClientiCount] = useState<number>(0);
  
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        console.log('Dashboard: Loading combined bandi...');
        // Carica bandi combinati (da Supabase, localStorage e sessionStorage) senza duplicati
        const combinedBandi = await SupabaseBandiService.getBandiCombinati();
        setAllBandi(combinedBandi);
        console.log("Dashboard: Unique bandi count:", combinedBandi.length);
        
        if (combinedBandi.length === 0) {
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
  
  // Updated colors for better visibility
  const distribuzioneBandiData = [
    { name: 'Europei', value: stats.distribuzioneBandi.europei, color: '#0066cc' },
    { name: 'Statali', value: stats.distribuzioneBandi.statali, color: '#00cc44' },
    { name: 'Regionali', value: stats.distribuzioneBandi.regionali, color: '#ff9900' },
    { name: 'Altri', value: stats.distribuzioneBandi.altri, color: '#5A6474' },
  ].filter(item => item.value > 0); // Show only non-zero values

  // Preparazione dati per il grafico settoriale con colori migliorati
  const bandoPerSettoreData = stats.bandoPerSettore
    .filter(item => item.percentuale > 0)
    .map((item, index) => ({
      name: item.settore,
      value: item.percentuale,
      color: ['#0066cc', '#00cc44', '#ff9900', '#cc3300', '#9900cc'][index % 5]
    }));

  const ultimiBandi = [...allBandi]
    .sort((a, b) => new Date(b.scadenza).getTime() - new Date(a.scadenza).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 pb-2 border-b border-gray-200">Dashboard</h1>
      
      {/* Statistiche principali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Bandi Attivi" 
          value={stats.bandiAttivi} 
          color="blue" 
          icon={<FileText className="w-8 h-8 text-blue-500" />}
          bgColor="bg-blue-50" 
        />
        <StatCard 
          title="Clienti" 
          value={isLoading ? '...' : clientiCount} 
          color="green" 
          icon={<Users className="w-8 h-8 text-green-500" />}
          bgColor="bg-green-50"
        />
        <StatCard 
          title="Match Recenti" 
          value={mockStatistiche.matchRecenti} 
          color="yellow" 
          icon={<GitCompare className="w-8 h-8 text-yellow-500" />}
          bgColor="bg-amber-50"
        />
      </div>
      
      {/* Grafici principali */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Distribuzione Bandi" bgColor="bg-gradient-to-br from-blue-50 to-white">
          <div className="h-64">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                Caricamento in corso...
              </div>
            ) : distribuzioneBandiData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribuzioneBandiData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : null}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distribuzioneBandiData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend 
                    formatter={(value) => <span style={{ color: '#000000', fontWeight: 500 }}>{value}</span>} 
                  />
                  <Tooltip 
                    formatter={(value) => [value, 'Quantità']} 
                    contentStyle={{ backgroundColor: 'white', borderColor: '#cccccc' }}
                    labelStyle={{ fontWeight: 'bold', color: '#333333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Nessun dato disponibile
              </div>
            )}
          </div>
        </ChartContainer>
        
        <ChartContainer title="Ultimi Bandi" bgColor="bg-gradient-to-br from-amber-50 to-white">
          <div className="overflow-y-auto max-h-64">
            {isLoading ? (
              <div className="h-32 flex items-center justify-center text-gray-400">
                Caricamento in corso...
              </div>
            ) : ultimiBandi.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="text-sm text-gray-600">
                    <th className="text-left py-2 font-medium">Titolo</th>
                    <th className="text-right py-2 font-medium">Scadenza</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {ultimiBandi.map((bando) => (
                    <tr key={bando.id} className="border-t">
                      <td className="py-2 text-blue-500 hover:underline">
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/bandi/${bando.id}`); }}>
                          {bando.titolo}
                        </a>
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {bando.scadenza ? new Date(bando.scadenza).toLocaleDateString('it-IT') : 'N/D'}
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
      </div>
      
      {/* Grafico settoriale a tutta larghezza, migliorato per la leggibilità */}
      {!isLoading && (
        <div className="mt-8">
          {bandoPerSettoreData.length > 0 ? (
            <StatisticheCard
              title="Bandi per Settore"
              description="Distribuzione percentuale per settore di attività"
              data={bandoPerSettoreData}
              colors={['#0066cc', '#00cc44', '#ff9900', '#cc3300', '#9900cc']}
              height={500}
            />
          ) : (
            <div className="border rounded-lg p-6 bg-slate-50 text-center">
              <h3 className="text-lg font-medium mb-2">Bandi per Settore</h3>
              <p className="text-gray-500">Nessun dato disponibile sui settori dei bandi</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
