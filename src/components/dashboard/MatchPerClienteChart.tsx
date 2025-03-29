
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ChartContainer from '@/components/ChartContainer';

interface MatchClienteItem {
  cliente: string;
  percentuale: number;
}

interface MatchPerClienteChartProps {
  matchData: MatchClienteItem[];
}

const MatchPerClienteChart: React.FC<MatchPerClienteChartProps> = ({ matchData }) => {
  return (
    <ChartContainer title="Match per Cliente" bgColor="bg-gradient-to-br from-green-50 to-white">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={matchData}
              nameKey="cliente"
              dataKey="percentuale"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
            >
              {matchData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#0066cc', '#ff9900', '#00cc44', '#cc3300'][index % 4]} />
              ))}
            </Pie>
            <Legend 
              formatter={(value) => <span style={{ color: '#000000', fontWeight: 500 }}>{value}</span>}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Percentuale']}
              contentStyle={{ backgroundColor: 'white', borderColor: '#cccccc' }}
              labelStyle={{ fontWeight: 'bold', color: '#333333' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};

export default MatchPerClienteChart;
