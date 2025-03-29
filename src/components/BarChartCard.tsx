
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DataItem {
  [key: string]: string | number;
}

interface BarConfig {
  dataKey: string;
  fill: string;
  name?: string;
  yAxisId?: string;
}

interface BarChartCardProps {
  title: string;
  description?: string;
  data: DataItem[];
  bars: BarConfig[];
  xAxisDataKey: string;
  xAxisAngle?: number;
  showSecondYAxis?: boolean;
}

const BarChartCard: React.FC<BarChartCardProps> = ({
  title,
  description,
  data,
  bars,
  xAxisDataKey,
  xAxisAngle = 0,
  showSecondYAxis = false,
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

  const bottomMargin = xAxisAngle !== 0 ? 60 : 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: bottomMargin }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxisDataKey} 
              angle={xAxisAngle} 
              textAnchor={xAxisAngle !== 0 ? "end" : "middle"} 
              height={xAxisAngle !== 0 ? 60 : 30} 
            />
            <YAxis yAxisId="left" orientation="left" />
            {showSecondYAxis && (
              <YAxis yAxisId="right" orientation="right" />
            )}
            <Tooltip />
            <Legend />
            {bars.map((bar, index) => (
              <Bar 
                key={index}
                dataKey={bar.dataKey} 
                fill={bar.fill} 
                name={bar.name || bar.dataKey} 
                yAxisId={bar.yAxisId || "left"}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BarChartCard;
