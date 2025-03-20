
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { FileText, Users, GitCompare } from 'lucide-react';
import { mockStatistiche } from '@/data/mockData';
import StatCard from '@/components/StatCard';
import ChartContainer from '@/components/ChartContainer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Bando } from '@/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const [bandi, setBandi] = useState<Bando[]>([]);
  
  // Carica SOLO i bandi salvati quando il componente viene montato
  useEffect(() => {
    const loadedBandi = FirecrawlService.getSavedBandi();
    setBandi(loadedBandi);
    console.log("Dashboard: Caricati bandi salvati:", loadedBandi.length);
  }, []);
  
  // Calcola le statistiche in base ai bandi caricati
  const calcStatistiche = () => {
    // Conta i bandi per tipo
    const europei = bandi.filter(b => b.tipo === 'europeo').length;
    const statali = bandi.filter(b => b.tipo === 'statale').length;
    const regionali = bandi.filter(b => b.tipo === 'regionale').length;
    
    // Calcola la distribuzione percentuale per settore
    const settoriCount: Record<string, number> = {};
    bandi.forEach(bando => {
      bando.settori.forEach(settore => {
        settoriCount[settore] = (settoriCount[settore] || 0) + 1;
      });
    });
    
    const bandoPerSettore = Object.entries(settoriCount)
      .map(([settore, count]) => ({
        settore,
        percentuale: Math.round((count / bandi.length) * 100)
      }))
      .sort((a, b) => b.percentuale - a.percentuale)
      .slice(0, 5); // Prendi i primi 5 settori più frequenti
    
    return {
      bandiAttivi: bandi.length,
      distribuzioneBandi: { europei, statali, regionali },
      bandoPerSettore
    };
  };
  
  const stats = calcStatistiche();
  
  // Prepara dati per il grafico a torta
  const distribuzioneBandiData = [
    { name: 'Europei', value: stats.distribuzioneBandi.europei, color: '#3b82f6' },
    { name: 'Statali', value: stats.distribuzioneBandi.statali, color: '#22c55e' },
    { name: 'Regionali', value: stats.distribuzioneBandi.regionali, color: '#f59e0b' },
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Filtra gli ultimi 5 bandi per scadenza
  const ultimiBandi = [...bandi].sort((a, b) => 
    new Date(b.scadenza).getTime() - new Date(a.scadenza).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Statistiche principali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Bandi Attivi" value={stats.bandiAttivi} color="blue" icon={<FileText className="w-8 h-8 text-blue-500" />} />
        <StatCard title="Clienti" value={mockStatistiche.numeroClienti} color="green" icon={<Users className="w-8 h-8 text-green-500" />} />
        <StatCard title="Match Recenti" value={mockStatistiche.matchRecenti} color="yellow" icon={<GitCompare className="w-8 h-8 text-yellow-500" />} />
      </div>
      
      {/* Grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Distribuzione Bandi">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribuzioneBandiData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribuzioneBandiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
        
        <ChartContainer title="Ultimi Bandi">
          <div className="overflow-y-auto max-h-64">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Titolo</th>
                  <th className="text-right py-2">Scadenza</th>
                </tr>
              </thead>
              <tbody>
                {ultimiBandi.map((bando) => (
                  <tr key={bando.id} className="border-t">
                    <td className="py-2 text-blue-500 hover:underline">
                      <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/bandi/${bando.id}`); }}>
                        {bando.titolo}
                      </a>
                    </td>
                    <td className="py-2 text-right">
                      {new Date(bando.scadenza).toLocaleDateString('it-IT')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <Button variant="outline" size="sm" onClick={() => navigate('/bandi')}>
              Vedi tutti i bandi
            </Button>
          </div>
        </ChartContainer>
      </div>
      
      {/* Altri grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Distribuzione Bandi per Settore">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.bandoPerSettore}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="settore" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentuale']} />
                <Bar dataKey="percentuale" fill="#3b82f6" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
        
        <ChartContainer title="Match per Cliente">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockStatistiche.matchPerCliente}
                  nameKey="cliente"
                  dataKey="percentuale"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {mockStatistiche.matchPerCliente.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#22c55e', '#ef4444'][index % 4]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentuale']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
};

export default Dashboard;
