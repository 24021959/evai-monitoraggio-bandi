
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  icon?: React.ReactNode;
  bgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  color = 'blue',
  icon,
  bgColor = 'bg-white'
}) => {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    gray: 'text-gray-500',
  };

  return (
    <div className={`${bgColor} p-6 rounded-lg border shadow-sm hover:shadow transition-shadow`}>
      <h3 className="text-lg font-normal text-gray-600 mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        {icon && <div className="mr-4">{icon}</div>}
        <div className={`text-4xl font-bold ${colorClasses[color]}`}>{value}</div>
      </div>
    </div>
  );
};

export default StatCard;
