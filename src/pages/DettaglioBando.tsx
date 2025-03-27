
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Bando } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Euro, FileText, Target, ExternalLink, Info, Users, Clock, List } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

const DettaglioBando = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bando, setBando] = useState<Bando | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // First check saved bandi
      const tuttiBandi = FirecrawlService.getSavedBandi();
      let bandoTrovato = tuttiBandi.find(b => b.id === id);
      
      // If not found, check imported bandi from session storage
      if (!bandoTrovato) {
        const bandiImportatiString = sessionStorage.getItem('bandiImportati');
        if (bandiImportatiString) {
          const bandiImportati = JSON.parse(bandiImportatiString);
          bandoTrovato = bandiImportati.find((b: Bando) => b.id === id);
        }
      }
      
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
    if (id && bando) {
      // Check if the bando is from the imported ones in session storage
      const bandiImportatiString = sessionStorage.getItem('bandiImportati');
      if (bandiImportatiString) {
        const bandiImportati = JSON.parse(bandiImportatiString);
        const isBandoImportato = bandiImportati.some((b: Bando) => b.id === id);
        
        if (isBandoImportato) {
          const newBandiImportati = bandiImportati.filter((b: Bando) => b.id !== id);
          sessionStorage.setItem('bandiImportati', JSON.stringify(newBandiImportati));
        } else {
          FirecrawlService.deleteBando(id);
        }
      } else {
        FirecrawlService.deleteBando(id);
      }
      
      toast({
        title: "Bando eliminato",
        description: "Il bando è stato eliminato con successo"
      });
      navigate('/bandi');
    }
  };

  const handleApriUrlBando = () => {
    if (bando?.url) {
      window.open(bando.url, '_blank');
    } else {
      toast({
        title: "Link non disponibile",
        description: "Il link al bando originale non è disponibile",
        variant: "destructive"
      });
    }
  };

  const handleVerificaRequisiti = () => {
    toast({
      title: "Funzionalità in sviluppo",
      description: "La verifica dei requisiti sarà disponibile nelle prossime versioni",
      variant: "default"
    });
  };

  const formatImporto = (min?: number, max?: number, budgetDisponibile?: string) => {
    if (budgetDisponibile) {
      return budgetDisponibile;
    }
    
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
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs text-white px-2 py-1 rounded-full ${getTipoClass(bando.tipo)}`}>
                {bando.tipo}
              </span>
              <span className="text-sm text-gray-500">{bando.fonte}</span>
            </div>
            <CardTitle className="text-2xl leading-tight">{bando.titolo}</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <Calendar className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-800">Scadenza</h3>
                  <p className="text-lg">{bando.scadenzaDettagliata || new Date(bando.scadenza).toLocaleDateString('it-IT')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-green-50 p-4 rounded-lg border border-green-100">
                <Euro className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800">Importo Finanziamento</h3>
                  <p className="text-lg">{formatImporto(bando.importoMin, bando.importoMax, bando.budgetDisponibile)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-purple-50 p-4 rounded-lg border border-purple-100">
                <Target className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-purple-800">Settori Target</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {bando.settori && bando.settori.map((settore, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                        {settore}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {bando.dataEstrazione && (
                <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <Clock className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Data Estrazione</h3>
                    <p>{bando.dataEstrazione}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-6 w-6 text-amber-600" />
                  <h3 className="font-semibold text-amber-800 text-lg">Descrizione del Bando</h3>
                </div>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {bando.descrizioneCompleta || bando.descrizione || 'Nessuna descrizione disponibile'}
                </p>
              </div>
              
              {bando.requisiti && (
                <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-6 w-6 text-indigo-600" />
                    <h3 className="font-semibold text-indigo-800 text-lg">Requisiti</h3>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{bando.requisiti}</p>
                </div>
              )}
              
              {bando.modalitaPresentazione && (
                <div className="bg-teal-50 p-5 rounded-lg border border-teal-100">
                  <div className="flex items-center gap-2 mb-3">
                    <List className="h-6 w-6 text-teal-600" />
                    <h3 className="font-semibold text-teal-800 text-lg">Modalità di Presentazione</h3>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{bando.modalitaPresentazione}</p>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-3">Azioni Rapide</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleApriUrlBando}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Vai al Bando Originale
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleVerificaRequisiti}
                  className="flex items-center gap-2"
                >
                  <Info className="h-4 w-4" /> 
                  Verifica Requisiti
                </Button>
              </div>
            </div>
            
            <Button variant="destructive" onClick={handleEliminaBando} className="mt-2 md:mt-auto">
              Elimina Bando
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DettaglioBando;
