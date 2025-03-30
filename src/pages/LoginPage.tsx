
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, LogIn, Shield, Lock, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/app/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!email || !password) {
      toast({
        title: 'Dati mancanti',
        description: 'Inserisci email e password',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
    } catch (error: any) {
      console.error('Errore durante il login:', error);
      
      let errorMessage = 'Si è verificato un errore durante il login';
      
      if (error.code === 'invalid_credentials') {
        errorMessage = 'Email o password non validi. Verifica le tue credenziali.';
      } else if (error.message) {
        errorMessage = `Errore: ${error.message}`;
      }
      
      setLoginError(errorMessage);
      toast({
        title: 'Errore di accesso',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Aggiungiamo dei log per debug
  console.log('Rendering LoginPage, user:', user);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/3dae21e4-3a8f-4f07-b420-97affba19320.png" 
              alt="EV-AI Technologies Logo" 
              className="h-24"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">EV-AI Monitoraggio Bandi</h1>
        </div>

        <Card className="shadow-lg border-gray-100 bg-gray-100">
          <CardHeader className="bg-gray-100 border-b border-gray-200">
            <CardTitle className="text-center flex items-center justify-center text-blue-800 gap-2">
              <Lock className="h-5 w-5" />
              Accesso Riservato
            </CardTitle>
            <CardDescription className="text-center text-blue-600">
              Solo gli utenti autorizzati possono accedere a questa piattaforma
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@azienda.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white text-black"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white text-black"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="text-right">
                <Link to="/reset-password" className="text-sm text-blue-600 hover:underline">
                  Password dimenticata?
                </Link>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Accesso in corso...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Accedi
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-gray-600">
            <p>
              Per richiedere un account, contatta l'amministratore del sistema
            </p>
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <Shield size={14} />
              <span>Sistema ad accesso riservato</span>
            </div>
          </CardFooter>
        </Card>
        
        <p className="text-center text-sm text-gray-500 mt-8">
          © {new Date().getFullYear()} EV-AI Technologies. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
