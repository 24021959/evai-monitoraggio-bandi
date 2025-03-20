
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, PieChart, FileText } from 'lucide-react';
import ChartContainer from '@/components/ChartContainer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { mockStatistiche } from '@/data/mockData';

const Report = () => {
  // Prepara dati per i grafici
  const distribuzioneBandiData = [
    { name: 'Europei', value: mockStatistiche.distribuzioneBandi.europei, color: '#3b82f6' },
    { name: 'Statali', value: mockStatistiche.distribuzioneBandi.statali, color: '#22c55e' },
    { name: 'Regionali', value: mockStatistiche.distribuzioneBandi.regionali, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Report e Analisi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartContainer title="Distribuzione Bandi per Settore">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockStatistiche.bandoPerSettore}
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
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={mockStatistiche.matchPerCliente}
                  nameKey="cliente"
                  dataKey="percentuale"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {mockStatistiche.matchPerCliente.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#22c55e', '#ef4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentuale']} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>
      
      <h2 className="text-xl font-semibold mt-8">Download Report</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <CardTitle>Report Bandi Attivi</CardTitle>
            </div>
            <CardDescription>
              Scarica un file CSV con tutti i bandi attualmente attivi e le loro caratteristiche principali.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Il report include informazioni su:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-6">
              <li>Titolo e descrizione del bando</li>
              <li>Fonte e tipo di finanziamento</li>
              <li>Importo minimo e massimo</li>
              <li>Data di scadenza</li>
              <li>Settori di applicazione</li>
            </ul>
            <Button className="w-full flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Scarica CSV
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <CardTitle>Report Match Bandi-Clienti</CardTitle>
            </div>
            <CardDescription>
              Scarica un file CSV con tutte le corrispondenze tra bandi e clienti con i punteggi di compatibilità.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Il report include informazioni su:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-6">
              <li>Nome del cliente e bando corrispondente</li>
              <li>Punteggio di compatibilità</li>
              <li>Settori di applicazione</li>
              <li>Stato della notifica</li>
              <li>Data di scadenza del bando</li>
            </ul>
            <Button className="w-full flex items-center justify-center gap-2" variant="secondary">
              <Download className="h-4 w-4" />
              Scarica CSV
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              <CardTitle>Report Personalizzati</CardTitle>
            </div>
            <CardDescription>
              Crea report personalizzati in base alle tue esigenze specifiche.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Puoi generare report personalizzati selezionando i dati e i filtri specifici di tuo interesse. Contatta il team di supporto per richieste particolari.
            </p>
            <Button className="w-full" variant="outline">
              Crea Report Personalizzato
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Report;
