
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar, FileText, Globe } from 'lucide-react';
import { Bando } from '@/types';
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const BandiImportati = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bandiImportati, setBandiImportati] = useState<Bando[]>([]);
  const [dataImportazione, setDataImportazione] = useState<string>('');
  
  useEffect(() => {
    loadBandiImportati();
  }, []);
  
  const loadBandiImportati = () => {
    try {
      const bandiStr = sessionStorage.getItem('ultimiBandiImportati');
      const dataStr = sessionStorage.getItem('dataUltimaImportazione');
      
      if (bandiStr) {
        const bandi = JSON.parse(bandiStr);
        setBandiImportati(bandi);
        
        if (dataStr) {
          const data = new Date(dataStr);
          setDataImportazione(format(data, "dd MMMM yyyy, HH:mm", { locale: it }));
        }
      } else {
        toast({
          title: "Nessun dato disponibile",
          description: "Non ci sono bandi importati da visualizzare",
        });
      }
    } catch (error) {
      console.error('Errore nel caricamento dei bandi importati:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i bandi importati",
        variant: "destructive",
      });
    }
  };
  
  // Definizione delle colonne per la tabella
  const columns: ColumnDef<Bando>[] = [
    {
      accessorKey: "titolo",
      header: "Titolo",
      cell: ({ row }) => {
        const bando = row.original;
        return (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
            <div className="font-medium">{bando.titolo}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "fonte",
      header: "Fonte",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <span>{row.original.fonte}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "scadenza",
      header: "Scadenza",
      cell: ({ row }) => {
        const bando = row.original;
        const data = bando.scadenza ? new Date(bando.scadenza) : null;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{data ? format(data, "dd/MM/yyyy", { locale: it }) : "N/D"}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const bando = row.original;
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/bandi/${bando.id}`)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              Visualizza
            </Button>
          </div>
        );
      },
    },
  ];
  
  const handleBack = () => {
    navigate('/app/strumenti/importa-bandi');
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bandi Importati</h1>
        
        <Button 
          onClick={handleBack} 
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna all'importazione
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Elenco bandi importati</span>
            {dataImportazione && (
              <span className="text-sm font-normal text-gray-500">
                Importati il {dataImportazione}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bandiImportati.length > 0 ? (
            <DataTable 
              columns={columns} 
              data={bandiImportati} 
              searchColumn="titolo"
            />
          ) : (
            <div className="py-8 text-center text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p>Nessun bando importato da visualizzare</p>
              <p className="text-sm mt-1">Importa dei bandi per visualizzarli qui</p>
              <Button 
                onClick={handleBack} 
                variant="outline" 
                className="mt-4"
              >
                Vai all'importazione
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BandiImportati;
