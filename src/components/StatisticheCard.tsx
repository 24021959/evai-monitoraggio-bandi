
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
  height?: number;
  simplifiedLabels?: boolean;
}

// Default colors with better contrast for visibility
const COLORS = ['#0066cc', '#00cc44', '#ff9900', '#cc3300', '#9900cc', '#00cccc', '#cc0099', '#666666'];

const StatisticheCard: React.FC<StatisticheCardProps> = ({
  title,
  description,
  data,
  colors = COLORS,
  height = 400,
  simplifiedLabels = false
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

  // Format labels for better readability - simplified if requested
  const renderCustomLabel = ({ name, percent }: { name: string, percent: number }) => {
    // Only show label if percentage is significant enough
    if (percent < 0.05) return null;
    
    // For simplified labels, just show the name (no percentage)
    if (simplifiedLabels) {
      // Truncate long names if needed
      const displayName = name.length > 12 ? name.substring(0, 10) + "..." : name;
      return displayName;
    }
    
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={height / 3}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={renderCustomLabel}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || colors[index % colors.length]} 
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => {
                return [`${value}`, simplifiedLabels ? name : 'Valore'];
              }}
              contentStyle={{ 
                backgroundColor: 'white', 
                borderColor: '#cccccc',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#333333', marginBottom: '5px' }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span style={{ 
                  color: '#333333', 
                  fontSize: '14px', 
                  fontWeight: 500,
                  padding: '0 8px'
                }}>
                  {simplifiedLabels ? value : value.length > 20 ? value.substring(0, 18) + "..." : value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StatisticheCard;
