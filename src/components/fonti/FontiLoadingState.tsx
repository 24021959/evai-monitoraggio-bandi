
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export const FontiLoadingState: React.FC = () => {
  return (
    <Card className="bg-gray-50 border-gray-100">
      <CardContent className="pt-6">
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
        <p className="text-center mt-4 text-gray-500">Caricamento fonti in corso...</p>
      </CardContent>
    </Card>
  );
};
