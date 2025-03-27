
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, AlarmClock, ArrowLeftRight, Download, AlertCircle } from 'lucide-react';
import { DataTable } from "@/components/ui/data-table";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Bando } from '@/types';

// Define columns for the data table
const columns = [
  {
    accessorKey: "titolo",
    header: "Titolo",
    cell: ({ row }: any) => (
      <div className="font-medium break-words max-w-xs">
        {row.getValue("titolo")}
      </div>
    ),
  },
  {
    accessorKey: "fonte",
    header: "Fonte",
    cell: ({ row }: any) => (
      <div>{row.getValue("fonte")}</div>
    ),
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }: any) => {
      const tipo = row.getValue("tipo");
      const colorClass = 
        tipo === "europeo" ? "bg-blue-100 text-blue-800" : 
        tipo === "statale" ? "bg-green-100 text-green-800" : 
        tipo === "regionale" ? "bg-orange-100 text-orange-800" : 
        "bg-gray-100 text-gray-800";
      
      return (
        <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${colorClass}`}>
          {tipo}
        </div>
      );
    },
  },
  {
    accessorKey: "settori",
    header: "Settori",
    cell: ({ row }: any) => {
      const settori = row.getValue("settori");
      return (
        <div className="max-w-xs truncate">
          {Array.isArray(settori) ? settori.join(", ") : settori}
        </div>
      );
    },
  },
  {
    accessorKey: "importoMin",
    header: "Importo Min (€)",
    cell: ({ row }: any) => {
      const value = row.getValue("importoMin");
      return value ? (
        <div className="text-right">{Number(value).toLocaleString('it-IT')}</div>
      ) : (
        <div className="text-gray-400 text-right">N/D</div>
      );
    },
  },
  {
    accessorKey: "importoMax",
    header: "Importo Max (€)",
    cell: ({ row }: any) => {
      const value = row.getValue("importoMax");
      return value ? (
        <div className="text-right">{Number(value).toLocaleString('it-IT')}</div>
      ) : (
        <div className="text-gray-400 text-right">N/D</div>
      );
    },
  },
  {
    accessorKey: "scadenza",
    header: "Scadenza",
    cell: ({ row }: any) => {
      const scadenza = row.getValue("scadenza");
      if (!scadenza) return <div className="text-gray-400">N/D</div>;
      
      try {
        const date = new Date(scadenza);
        return <div>{format(date, 'dd/MM/yyyy', { locale: it })}</div>;
      } catch (error) {
        return <div>{scadenza}</div>;
      }
    },
  },
  {
    accessorKey: "dataEstrazione",
    header: "Estrazione",
    cell: ({ row }: any) => {
      const dataEstrazione = row.getValue("dataEstrazione");
      if (!dataEstrazione) return <div className="text-gray-400">N/D</div>;
      
      try {
        const date = new Date(dataEstrazione);
        return <div>{format(date, 'dd/MM/yyyy', { locale: it })}</div>;
      } catch (error) {
        return <div>{dataEstrazione}</div>;
      }
    },
  },
];

const RisultatiScraping = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [importedBandi, setImportedBandi] = useState<Bando[]>([]);
  const [lastImportDate, setLastImportDate] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('RisultatiScraping: Componente montato, caricamento bandi');
    
    // Load imported bandi from Google Sheets if available
    const loadBandiFromGoogleSheets = () => {
      console.log('Iniziando caricamento dei bandi estratti...');
      const importedBandiStr = sessionStorage.getItem('bandiImportati');
      
      if (importedBandiStr) {
        try {
          const parsedBandi = JSON.parse(importedBandiStr);
          if (Array.isArray(parsedBandi) && parsedBandi.length > 0) {
            setImportedBandi(parsedBandi);
            console.log(`Caricati bandi importati da Google Sheets, quantità: ${parsedBandi.length}`);
            
            // Try to extract the import date from the most recent bando
            const sortedBandi = [...parsedBandi].sort((a, b) => {
              const dateA = a.dataEstrazione ? new Date(a.dataEstrazione).getTime() : 0;
              const dateB = b.dataEstrazione ? new Date(b.dataEstrazione).getTime() : 0;
              return dateB - dateA;
            });
            
            if (sortedBandi[0]?.dataEstrazione) {
              setLastImportDate(sortedBandi[0].dataEstrazione);
            } else {
              setLastImportDate(new Date().toISOString().split('T')[0]);
            }
          } else {
            console.log('Nessun bando estratto trovato in localStorage');
          }
        } catch (error) {
          console.error('Errore nel parsing dei bandi estratti:', error);
        }
      } else {
        console.log('Nessun bando estratto trovato in localStorage');
      }
    };
    
    loadBandiFromGoogleSheets();
  }, []);
  
  const handleImportClick = () => {
    navigate('/importa-scraping');
  };
  
  const handleDownloadCSV = () => {
    if (importedBandi.length === 0) {
      toast({
        title: "Nessun dato da esportare",
        description: "Non ci sono bandi importati da Google Sheets da esportare",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare CSV headers
    const headers = ['ID', 'Titolo', 'Fonte', 'Tipo', 'Settori', 'Importo Min', 'Importo Max', 'Scadenza', 'Descrizione', 'Data Estrazione'];
    
    // Prepare data
    const csvRows = [
      headers.join(','), // Headers
      // Rows with data
      ...importedBandi.map(bando => [
        bando.id,
        `"${(bando.titolo || '').replace(/"/g, '""')}"`, // Escape quotes
        `"${(bando.fonte || '').replace(/"/g, '""')}"`,
        bando.tipo || '',
        `"${Array.isArray(bando.settori) ? bando.settori.join('; ') : ''}}"`,
        bando.importoMin || '',
        bando.importoMax || '',
        bando.scadenza || '',
        `"${(bando.descrizione || '').replace(/"/g, '""')}"`, // Escape quotes
        bando.dataEstrazione || ''
      ].join(','))
    ];
    
    // Create CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bandi_importati_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download completato",
      description: "File CSV dei bandi importati scaricato con successo",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Risultati Monitoraggio</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleDownloadCSV}
          >
            <Download className="h-4 w-4" />
            Esporta CSV
          </Button>
          <Button 
            variant="default"
            className="flex items-center gap-2"
            onClick={handleImportClick}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Importa da Google Sheets
          </Button>
        </div>
      </div>
      
      {importedBandi.length > 0 && lastImportDate ? (
        <Alert className="bg-green-50 border-green-200">
          <ArrowLeftRight className="h-4 w-4 text-green-600" />
          <AlertTitle>Dati importati con successo</AlertTitle>
          <AlertDescription>
            Sono stati importati {importedBandi.length} bandi da Google Sheets. 
            {lastImportDate && ` Ultima importazione: ${new Date(lastImportDate).toLocaleDateString('it-IT')}`}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nessun dato importato</AlertTitle>
          <AlertDescription>
            Non hai ancora importato dati da Google Sheets. Clicca su "Importa da Google Sheets" per iniziare.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="tabella" className="w-full">
        <TabsList className="grid grid-cols-2 w-60 mb-6">
          <TabsTrigger value="tabella">Vista Tabella</TabsTrigger>
          <TabsTrigger value="statistiche">Statistiche</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tabella">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Bandi Importati</CardTitle>
              <CardDescription>
                Elenco dei bandi importati da Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importedBandi.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={importedBandi}
                  searchColumn="titolo"
                  defaultPageSize={10}
                />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessun bando importato</h3>
                  <p className="mb-4">Non hai ancora importato dati da Google Sheets.</p>
                  <Button variant="outline" onClick={handleImportClick}>
                    Importa ora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistiche">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuzione per Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                {importedBandi.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const tipiCount = importedBandi.reduce((acc, bando) => {
                        const tipo = bando.tipo || 'non specificato';
                        acc[tipo] = (acc[tipo] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      
                      return Object.entries(tipiCount).map(([tipo, count]) => {
                        const percentage = Math.round((count / importedBandi.length) * 100);
                        const colorClass = 
                          tipo === "europeo" ? "bg-blue-500" : 
                          tipo === "statale" ? "bg-green-500" : 
                          tipo === "regionale" ? "bg-orange-500" : 
                          "bg-gray-500";
                        
                        return (
                          <div key={tipo} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                              <span className="capitalize">{tipo}</span>
                              <span className="text-gray-600">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${colorClass}`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Nessun dato disponibile
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Settori più frequenti</CardTitle>
              </CardHeader>
              <CardContent>
                {importedBandi.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const settoriCount: Record<string, number> = {};
                      importedBandi.forEach(bando => {
                        if (bando.settori && Array.isArray(bando.settori)) {
                          bando.settori.forEach(settore => {
                            settoriCount[settore] = (settoriCount[settore] || 0) + 1;
                          });
                        }
                      });
                      
                      return Object.entries(settoriCount)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([settore, count]) => {
                          const percentage = Math.round((count / importedBandi.length) * 100);
                          return (
                            <div key={settore} className="space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className="capitalize">{settore}</span>
                                <span className="text-gray-600">{count} ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="h-2.5 rounded-full bg-blue-500" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Nessun dato disponibile
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Scadenze</CardTitle>
              </CardHeader>
              <CardContent>
                {importedBandi.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const oggi = new Date();
                      const unMese = new Date();
                      unMese.setMonth(oggi.getMonth() + 1);
                      const treMesi = new Date();
                      treMesi.setMonth(oggi.getMonth() + 3);
                      
                      const scadutiCount = importedBandi.filter(bando => 
                        bando.scadenza && new Date(bando.scadenza) < oggi
                      ).length;
                      
                      const entrounMeseCount = importedBandi.filter(bando => 
                        bando.scadenza && 
                        new Date(bando.scadenza) >= oggi && 
                        new Date(bando.scadenza) <= unMese
                      ).length;
                      
                      const entrotreMesiCount = importedBandi.filter(bando => 
                        bando.scadenza && 
                        new Date(bando.scadenza) > unMese && 
                        new Date(bando.scadenza) <= treMesi
                      ).length;
                      
                      const oltretreMesiCount = importedBandi.filter(bando => 
                        bando.scadenza && new Date(bando.scadenza) > treMesi
                      ).length;
                      
                      const scadenzeCategories = [
                        { nome: 'Scaduti', count: scadutiCount, colorClass: 'bg-red-500' },
                        { nome: 'Entro 1 mese', count: entrounMeseCount, colorClass: 'bg-yellow-500' },
                        { nome: 'Entro 3 mesi', count: entrotreMesiCount, colorClass: 'bg-green-500' },
                        { nome: 'Oltre 3 mesi', count: oltretreMesiCount, colorClass: 'bg-blue-500' },
                      ];
                      
                      return scadenzeCategories.map(categoria => {
                        const percentage = Math.round((categoria.count / importedBandi.length) * 100);
                        return (
                          <div key={categoria.nome} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                              <span>{categoria.nome}</span>
                              <span className="text-gray-600">{categoria.count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${categoria.colorClass}`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Nessun dato disponibile
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RisultatiScraping;
