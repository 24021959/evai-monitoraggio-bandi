
import React from 'react';
import { FileText, Users, GitCompare } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { Statistica } from '@/types';

interface StatCardsSectionProps {
  bandiCount: number;
  clientiCount: number | string;
  matchCount: number;
  isLoading: boolean;
}

const StatCardsSection: React.FC<StatCardsSectionProps> = ({
  bandiCount,
  clientiCount,
  matchCount,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Bandi Attivi" 
        value={bandiCount} 
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
        value={matchCount} 
        color="yellow" 
        icon={<GitCompare className="w-8 h-8 text-yellow-500" />}
        bgColor="bg-amber-50"
      />
    </div>
  );
};

export default StatCardsSection;
