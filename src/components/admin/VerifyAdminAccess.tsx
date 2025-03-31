
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, RefreshCw } from "lucide-react";
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

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyAdminClient();
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
          <AlertTitle className="flex items-center gap-2">
            {adminClientVerified === true 
              ? "✅ Accesso Verificato" 
              : adminClientVerified === false 
                ? "❌ Accesso Non Verificato" 
                : "⚠️ Stato Accesso Sconosciuto"}
          </AlertTitle>
          <AlertDescription>
            {adminClientVerified === true 
              ? "Il client amministrativo è configurato correttamente. Puoi visualizzare tutte le informazioni degli utenti." 
              : adminClientVerified === false
                ? "Il client amministrativo non è configurato correttamente. Alcune informazioni degli utenti potrebbero non essere visibili." 
                : "Verifica l'accesso amministrativo per accedere a tutte le funzionalità."}
          </AlertDescription>
        </Alert>

        <div className="mt-4">
          <Button 
            onClick={handleVerify} 
            disabled={verifying}
            variant={adminClientVerified ? "outline" : "default"} 
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${verifying ? "animate-spin" : ""}`} />
            {verifying ? "Verifica in corso..." : "Verifica Accesso Admin"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerifyAdminAccess;
