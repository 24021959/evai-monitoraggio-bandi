
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Bando } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Euro, FileText, Globe, Target } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

const DettaglioBando = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bando, setBando] = useState<Bando | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const tuttiBandi = FirecrawlService.getSavedBandi();
      const bandoTrovato = tuttiBandi.find(b => b.id === id);
      
      if (bandoTrovato) {
        setBando(bandoTrovato);
      } else {
        toast({
          title: "Bando non trovato",
          description: "Il bando richiesto non è presente nel sistema",
          variant: "destructive"
        });
      }
      
      setLoading(false);
    }
  }, [id]);

  const handleEliminaBando = () => {
    if (id) {
      FirecrawlService.deleteBando(id);
      toast({
        title: "Bando eliminato",
        description: "Il bando è stato eliminato con successo"
      });
      navigate('/bandi');
    }
  };

  const formatImporto = (min?: number, max?: number) => {
    if (min && max) {
      return `${min.toLocaleString('it-IT')} € - ${max.toLocaleString('it-IT')} €`;
    } else if (min) {
      return `da ${min.toLocaleString('it-IT')} €`;
    } else if (max) {
      return `fino a ${max.toLocaleString('it-IT')} €`;
    }
    return 'Non disponibile';
  };

  const getTipoClass = (tipo: string) => {
    switch (tipo) {
      case 'statale':
        return 'bg-green-500';
      case 'europeo':
        return 'bg-blue-500';
      case 'regionale':
        return 'bg-teal-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-12 w-12 border-4 border-green-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!bando) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/bandi')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Torna ai Bandi
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Bando non trovato</CardTitle>
            <CardDescription>Il bando richiesto non è disponibile nel sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Il bando con ID <span className="font-mono">{id}</span> non è stato trovato nel database.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/bandi')}>Torna all'elenco dei bandi</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/bandi')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Torna ai Bandi
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs text-white px-2 py-1 rounded-full ${getTipoClass(bando.tipo)}`}>
              {bando.tipo}
            </span>
            <CardTitle className="text-2xl">{bando.titolo}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {bando.fonte}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Scadenza</p>
                  <p className="font-medium">{new Date(bando.scadenza).toLocaleDateString('it-IT')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Importo Finanziamento</p>
                  <p className="font-medium">{formatImporto(bando.importoMin, bando.importoMax)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Settori Target</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {bando.settori.map((settore, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">{settore}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {bando.url && (
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Link al Bando</p>
                    <a 
                      href={bando.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visita il sito ufficiale
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Dettagli del Bando</h3>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{bando.descrizione || 'Nessun dettaglio disponibile'}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold mb-2">Azioni Suggerite</h3>
              <div className="flex gap-2">
                <Button>Verifica Compatibilità</Button>
                <Button variant="outline">Salva PDF</Button>
              </div>
            </div>
            
            <Button variant="destructive" onClick={handleEliminaBando}>
              Elimina Bando
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DettaglioBando;
