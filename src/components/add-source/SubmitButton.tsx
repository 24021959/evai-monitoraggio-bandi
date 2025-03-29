
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save } from 'lucide-react';

interface SubmitButtonProps {
  isAdding: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ isAdding }) => {
  return (
    <Button 
      type="submit" 
      className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600"
      disabled={isAdding}
    >
      {isAdding ? (
        <>
          <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-current rounded-full"></span>
          Salvataggio...
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          Salva Fonte
        </>
      )}
    </Button>
  );
};
