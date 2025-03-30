import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FileText, Users, GitCompare } from 'lucide-react';
import StatCard from '@/components/StatCard';
import ChartContainer from '@/components/ChartContainer';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Bando, Cliente } from '@/types';
import SupabaseBandiService from '@/utils/SupabaseBandiService';
import SupabaseClientiService from '@/utils/SupabaseClientiService';
import SupabaseMatchService from '@/utils/SupabaseMatchService';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [allBandi, setAllBandi] = useState<Bando[]>([]);
  const [clientiCount, setClientiCount] = useState<number>(0);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [fontDistribution, setFontDistribution] = useState<{fonte: string, valore: number}[]>([]);
  
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        console.log('Dashboard: Loading combined bandi...');
        // Carica bandi combinati (da Supabase, localStorage e sessionStorage) senza duplicati
        const combinedBandi = await SupabaseBandiService.getBandiCombinati();
        setAllBandi(combinedBandi);
        console.log("Dashboard: Unique bandi count:", combinedBandi.length);
        
        // Calcola distribuzione fonti
        const fontiCount: Record<string, number> = {};
        combinedBandi.forEach(bando => {
          if (bando.fonte) {
            fontiCount[bando.fonte] = (fontiCount[bando.fonte] || 0) + 1;
          }
        });
        
        // Converti a formato per grafico a torta
        const fontiData = Object.entries(fontiCount)
          .map(([fonte, valore]) => ({ fonte, valore }))
          .sort((a, b) => b.valore - a.valore);
        
        setFontDistribution(fontiData);
        console.log("Dashboard: Fonts distribution:", fontiData);
        
        if (combinedBandi.length === 0) {
          console.log("Dashboard: No bandi found in any source");
        }
        
        // Carica il numero di clienti
        const clienti = await SupabaseClientiService.getClienti();
        setClientiCount(clienti.length);
        console.log("Dashboard: Clienti count:", clienti.length);

        // Carica il numero di match
        const matches = await SupabaseMatchService.getMatches();
        setMatchCount(matches.length);
        console.log("Dashboard: Match count:", matches.length);
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
  
  const CHART_COLORS = ['#0066cc', '#00cc44', '#ff9900', '#cc3300', '#9900cc', '#00cccc', '#cc0099', '#5A6474'];

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
          value={allBandi.length} 
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
          value={isLoading ? '...' : matchCount} 
          color="yellow" 
          icon={<GitCompare className="w-8 h-8 text-yellow-500" />}
          bgColor="bg-amber-50"
        />
      </div>
      
      {/* Grafici principali */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Distribuzione Fonti" bgColor="bg-gradient-to-br from-blue-50 to-white">
          <div className="h-64">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                Caricamento in corso...
              </div>
            ) : fontDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fontDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : null}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valore"
                    nameKey="fonte"
                  >
                    {fontDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
    </div>
  );
};

export default Dashboard;
