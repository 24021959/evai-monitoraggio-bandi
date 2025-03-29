
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Users, GitCompare, Database } from 'lucide-react';

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  linkTo 
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  linkTo: string 
}) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="bg-white rounded-xl shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(linkTo)}
    >
      <div className="bg-blue-50 text-blue-600 p-3 rounded-full w-fit mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-4 flex-grow">{description}</p>
      <Button 
        variant="ghost" 
        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 justify-start p-0"
        onClick={(e) => {
          e.stopPropagation();
          navigate(linkTo);
        }}
      >
        Visualizza
      </Button>
    </div>
  );
};

const Index = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Gestione Completa dei Bandi
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Monitora, analizza e trova i bandi più adatti alle tue esigenze aziendali
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={<BarChart3 size={24} />}
          title="Dashboard"
          description="Visualizza statistiche e monitoraggio in tempo reale dei bandi attivi"
          linkTo="/"
        />
        
        <FeatureCard
          icon={<FileText size={24} />}
          title="Bandi"
          description="Sfoglia, filtra e cerca tra tutti i bandi disponibili"
          linkTo="/bandi"
        />
        
        <FeatureCard
          icon={<Users size={24} />}
          title="Clienti"
          description="Gestisci l'anagrafica clienti e le loro preferenze"
          linkTo="/clienti"
        />
        
        <FeatureCard
          icon={<GitCompare size={24} />}
          title="Match"
          description="Trova i bandi più adatti per i tuoi clienti"
          linkTo="/match"
        />
        
        <FeatureCard
          icon={<Database size={24} />}
          title="Fonti"
          description="Configura le fonti da cui importare i bandi"
          linkTo="/fonti"
        />
        
        <FeatureCard
          icon={<FileText size={24} />}
          title="Importa Bandi"
          description="Importa bandi da file esterni o altre sorgenti"
          linkTo="/importa-bandi"
        />
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-sm mt-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Inizia ad utilizzare il sistema</h3>
            <p className="text-gray-600">Consulta la dashboard per una panoramica completa</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={() => window.location.href = '/'}
          >
            Vai alla Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
