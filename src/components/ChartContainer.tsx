
import React from 'react';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  bgColor?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, bgColor = 'bg-white' }) => {
  return (
    <div className={`border rounded-lg p-4 ${bgColor} shadow-sm`}>
      <h3 className="text-lg font-normal text-gray-600 mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default ChartContainer;
