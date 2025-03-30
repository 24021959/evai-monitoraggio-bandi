
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DisabledAccountMessage = () => {
  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Account Disattivato</h1>
      <p className="text-lg max-w-md text-gray-700 mb-6">
        Il tuo account è stato temporaneamente disattivato dall'amministratore.
        Contatta il supporto per ulteriori informazioni.
      </p>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => window.location.href = '/login'}
      >
        <LogOut className="h-4 w-4" />
        Torna alla pagina di login
      </Button>
    </div>
  );
};

export default DisabledAccountMessage;
