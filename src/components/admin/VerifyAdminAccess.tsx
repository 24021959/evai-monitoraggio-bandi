
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface VerifyAdminAccessProps {
  verifyAdminClient: () => Promise<boolean>;
  adminClientVerified: boolean | null;
}

const VerifyAdminAccess: React.FC<VerifyAdminAccessProps> = ({
  verifyAdminClient,
  adminClientVerified
}) => {
  const [verifying, setVerifying] = React.useState(false);
  const [errorDetails, setErrorDetails] = React.useState<string | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    setErrorDetails(null);
    
    try {
      const result = await verifyAdminClient();
      if (!result) {
        setErrorDetails("La verifica è fallita. Assicurati che la Service Role Key sia corretta in adminClient.ts.");
      }
    } catch (error) {
      console.error("Errore durante la verifica:", error);
      setErrorDetails(error instanceof Error ? error.message : "Errore sconosciuto");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Verifica Accesso Amministrativo
        </CardTitle>
        <CardDescription>
          Verifica l'accesso amministrativo per visualizzare tutte le informazioni degli utenti
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className={adminClientVerified === true 
          ? "bg-green-50 border-green-200" 
          : adminClientVerified === false 
            ? "bg-red-50 border-red-200" 
            : "bg-blue-50 border-blue-200"
        }>
          <div className="flex items-center gap-2">
            {adminClientVerified === true 
              ? <CheckCircle2 className="h-5 w-5 text-green-600" />
              : adminClientVerified === false 
                ? <XCircle className="h-5 w-5 text-red-600" />
                : <AlertTriangle className="h-5 w-5 text-blue-600" />}
            <AlertTitle>
              {adminClientVerified === true 
                ? "Accesso Verificato" 
                : adminClientVerified === false 
                  ? "Accesso Non Verificato" 
                  : "Stato Accesso Sconosciuto"}
            </AlertTitle>
          </div>
          <AlertDescription className="mt-2">
            {adminClientVerified === true 
              ? "Il client amministrativo è configurato correttamente. Puoi visualizzare tutte le informazioni degli utenti." 
              : adminClientVerified === false
                ? "Il client amministrativo non è configurato correttamente. Alcune informazioni degli utenti potrebbero non essere visibili." 
                : "Verifica l'accesso amministrativo per accedere a tutte le funzionalità."}
                
            {errorDetails && (
              <div className="mt-2 text-red-600 text-sm border-l-2 border-red-300 pl-2">
                Dettagli errore: {errorDetails}
              </div>
            )}
          </AlertDescription>
        </Alert>

        <div className="mt-4 flex flex-col gap-2">
          <Button 
            onClick={handleVerify} 
            disabled={verifying}
            variant={adminClientVerified ? "outline" : "default"} 
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${verifying ? "animate-spin" : ""}`} />
            {verifying ? "Verifica in corso..." : "Verifica Accesso Admin"}
          </Button>
          
          {!adminClientVerified && (
            <div className="text-xs text-gray-500 mt-1">
              <p className="font-medium">Suggerimenti per la risoluzione dei problemi:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>Verifica che la Service Role Key in adminClient.ts sia corretta e aggiornata.</li>
                <li>Assicurati di avere i permessi amministrativi sul progetto Supabase.</li>
                <li>Controlla la connessione internet e che il progetto Supabase sia attivo.</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerifyAdminAccess;
