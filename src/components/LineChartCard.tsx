
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DataItem {
  [key: string]: string | number;
}

interface LineConfig {
  dataKey: string;
  stroke: string;
  name?: string;
}

interface LineChartCardProps {
  title: string;
  description?: string;
  data: DataItem[];
  lines: LineConfig[];
  xAxisDataKey: string;
}

const LineChartCard: React.FC<LineChartCardProps> = ({
  title,
  description,
  data,
  lines,
  xAxisDataKey
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisDataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {lines.map((line, index) => (
              <Line 
                key={index}
                type="monotone" 
                dataKey={line.dataKey} 
                stroke={line.stroke} 
                name={line.name || line.dataKey} 
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LineChartCard;
