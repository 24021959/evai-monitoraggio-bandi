
import React, { useState } from 'react';
import { mockFonti } from '@/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, HelpCircle } from 'lucide-react';
import FontiTable from '@/components/FontiTable';
import { useNavigate } from 'react-router-dom';

const Fonti = () => {
  const navigate = useNavigate();
  const [fonti, setFonti] = useState(mockFonti);
  
  const handleEdit = (id: string) => {
    console.log('Edit fonte with id:', id);
  };
  
  const handleDelete = (id: string) => {
    setFonti(fonti.filter(fonte => fonte.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestione Fonti di Dati</h1>
        <Button 
          onClick={() => navigate('/fonti/nuova')}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Nuova Fonte
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Fonti Configurate</CardTitle>
          <CardDescription>Gestisci le fonti da cui estrarre i dati sui bandi</CardDescription>
        </CardHeader>
        <CardContent>
          <FontiTable 
            fonti={fonti} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 border-blue-100">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            <CardTitle>Parser personalizzati</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Il sistema supporta parser personalizzati per estrarre dati da qualsiasi sito web. Contatta il supporto per assistenza nella configurazione di fonti con strutture complesse.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Come Funziona lo Scraping</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Il sistema si connette alle fonti configurate a intervalli regolari</li>
              <li>Estrae informazioni sui bandi attivi dalle pagine web</li>
              <li>Analizza e normalizza i dati estratti</li>
              <li>Classifica i bandi per tipo, settore e altre caratteristiche</li>
              <li>Esegue il match con i profili dei clienti</li>
            </ol>
            <Button variant="outline" className="mt-4 w-full">
              Vedi Documentazione API
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Fonti Raccomandate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Ecco alcune fonti ufficiali consigliate per i bandi di finanziamento:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-0.5">UE</span>
                <div>
                  <p className="font-medium">Portale Funding & Tenders UE</p>
                  <p className="text-sm text-gray-600">ec.europa.eu/info/funding-tenders</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-0.5">IT</span>
                <div>
                  <p className="font-medium">Ministero Imprese</p>
                  <p className="text-sm text-gray-600">mise.gov.it/bandi</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-0.5">IT</span>
                <div>
                  <p className="font-medium">Invitalia</p>
                  <p className="text-sm text-gray-600">invitalia.it/bandi</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full mt-0.5">REG</span>
                <div>
                  <p className="font-medium">Portali regionali</p>
                  <p className="text-sm text-gray-600">Siti delle singole regioni</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Fonti;
