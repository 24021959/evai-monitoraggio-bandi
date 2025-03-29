
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ChartContainer from '@/components/ChartContainer';

interface DistributionItem {
  name: string;
  value: number;
  color: string;
}

interface BandiDistributionChartProps {
  distributionData: DistributionItem[];
  isLoading: boolean;
}

const BandiDistributionChart: React.FC<BandiDistributionChartProps> = ({ 
  distributionData, 
  isLoading 
}) => {
  // Custom label renderer with red text color
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
    if (percent === 0) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#ea384c" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontWeight="bold"
        stroke="#ffffff"
        strokeWidth="0.5"
        fontSize="12"
      >
        {`${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <ChartContainer title="Distribuzione Bandi" bgColor="bg-gradient-to-br from-blue-50 to-white">
      <div className="h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Caricamento in corso...
          </div>
        ) : distributionData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
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
  );
};

export default BandiDistributionChart;
