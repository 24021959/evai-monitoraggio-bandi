
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface StatisticheCardProps {
  title: string;
  description?: string;
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  colors?: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const StatisticheCard: React.FC<StatisticheCardProps> = ({
  title,
  description,
  data,
  colors = COLORS
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">Nessun dato disponibile</p>
        </CardContent>
      </Card>
    );
  }

  // Formatter per le etichette del grafico
  const renderCustomLabel = ({ name, percent }: { name: string, percent: number }) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={160}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={renderCustomLabel}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || colors[index % colors.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Percentuale']}
              contentStyle={{ backgroundColor: 'white', borderColor: '#cccccc' }}
              labelStyle={{ fontWeight: 'bold', color: '#333333' }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom"
              align="center"
              formatter={(value) => <span style={{ color: '#333333', fontSize: '14px', fontWeight: 500 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StatisticheCard;
