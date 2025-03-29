
import { Bando, TipoBando } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import SupabaseMatchService from './SupabaseMatchService';

// Mock implementation of a Supabase bandi service
class SupabaseBandiService {
  // Storage for mock bandi
  private static bandiStorage: Bando[] = [
    {
      id: 'bando-1',
      titolo: 'Bando per l\'innovazione nel settore agricolo',
      fonte: 'Regione Lombardia',
      descrizione: 'Finanziamenti a fondo perduto per progetti di innovazione tecnologica nelle aziende agricole lombarde.',
      tipo: 'regionale' as TipoBando,
      settori: ['Agricoltura', 'Innovazione Agricola'],
      scadenza: '2024-03-15',
      importoMin: 50000,
      importoMax: 200000,
      url: 'https://www.regione.lombardia.it/wps/portal/istituzionale/HP/servizi-e-informazioni/enti-e-operatori/attivita-produttive/Bandi-e-agevolazioni'
    },
    {
      id: 'bando-2',
      titolo: 'Incentivi per l\'efficienza energetica nelle PMI',
      fonte: 'MIMIT - Ministero delle Imprese e del Made in Italy',
      descrizione: 'Agevolazioni per investimenti in impianti di produzione di energia da fonti rinnovabili e interventi di efficientamento energetico.',
      tipo: 'statale' as TipoBando,
      settori: ['Energia Rinnovabile', 'Efficienza Energetica'],
      scadenza: '2024-04-30',
      importoMin: 30000,
      importoMax: 150000,
      url: 'https://www.mise.gov.it/it/incentivi'
    }
  ];

  // Get all bandi
  static async getBandi(): Promise<Bando[]> {
    // In a real implementation, this would fetch from Supabase
    console.log('Fetching all bandi');
    return this.bandiStorage;
  }

  // Get a specific bando by ID
  static async getBandoById(id: string): Promise<Bando | null> {
    // In a real implementation, this would fetch from Supabase
    const bando = this.bandiStorage.find(b => b.id === id);
    return bando || null;
  }

  // Import bandi
  static async importBandi(bandi: Bando[]): Promise<{ success: boolean, count: number, matchCount: number }> {
    try {
      console.log(`Importing ${bandi.length} bandi`);
      
      // Ensure all bandi have valid IDs and tipo values
      const processedBandi = bandi.map(bando => ({
        ...bando,
        id: bando.id || uuidv4(),
        tipo: (bando.tipo || 'altro') as TipoBando
      }));
      
      // Add the bandi to our storage (in a real implementation, this would insert into Supabase)
      this.bandiStorage = [...this.bandiStorage, ...processedBandi];
      
      // Generate matches for the imported bandi
      const matchCount = await SupabaseMatchService.generateMatchesForBandi(processedBandi);
      
      return {
        success: true,
        count: processedBandi.length,
        matchCount
      };
    } catch (error) {
      console.error('Error importing bandi:', error);
      return {
        success: false,
        count: 0,
        matchCount: 0
      };
    }
  }
}

export default SupabaseBandiService;
