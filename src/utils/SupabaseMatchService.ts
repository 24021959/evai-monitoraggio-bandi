
import { Bando, Cliente, Match } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock implementation of a Supabase match service
class SupabaseMatchService {
  // Storage for mock matches
  private static matchesStorage: Match[] = [];

  // Get all matches
  static async getMatches(): Promise<Match[]> {
    // In a real implementation, this would fetch from Supabase
    console.log('Fetching all matches');
    return this.matchesStorage;
  }

  // Get matches by cliente ID
  static async getMatchesByClienteId(clienteId: string): Promise<Match[]> {
    // In a real implementation, this would fetch from Supabase
    console.log(`Fetching matches for cliente: ${clienteId}`);
    return this.matchesStorage.filter(match => match.clienteId === clienteId);
  }

  // Get matches by bando ID
  static async getMatchesByBandoId(bandoId: string): Promise<Match[]> {
    // In a real implementation, this would fetch from Supabase
    console.log(`Fetching matches for bando: ${bandoId}`);
    return this.matchesStorage.filter(match => match.bandoId === bandoId);
  }
  
  // Get matches by date range
  static async getMatchesByDateRange(startDate: string, endDate: string): Promise<Match[]> {
    // Convert dates to timestamps for comparison
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return this.matchesStorage.filter(match => {
      if (match.data_creazione) {
        const matchDate = new Date(match.data_creazione).getTime();
        return matchDate >= start && matchDate <= end;
      }
      return false;
    });
  }

  // Update match archive status
  static async updateMatchArchiveStatus(matchId: string, archiviato: boolean): Promise<boolean> {
    const matchIndex = this.matchesStorage.findIndex(match => match.id === matchId);
    if (matchIndex !== -1) {
      this.matchesStorage[matchIndex].archiviato = archiviato;
      return true;
    }
    return false;
  }

  // Generate matches for bandi
  static async generateMatchesForBandi(bandi: Bando[]): Promise<number> {
    let matchCount = 0;
    
    // Get all clients (In a real implementation, this would fetch from Supabase)
    const clienti: Cliente[] = [
      {
        id: 'cliente-1',
        nome: 'Azienda Agricola Rossi',
        settore: 'Agricoltura',
        regione: 'Lombardia',
        provincia: 'Milano',
        fatturato: 500000,
        interessiSettoriali: ['Agricoltura', 'Innovazione Agricola'],
        dipendenti: 15,
        email: 'info@rossiagricola.it'
      },
      {
        id: 'cliente-2',
        nome: 'GreenTech Solutions Srl',
        settore: 'Energia Rinnovabile',
        regione: 'Lazio',
        provincia: 'Roma',
        fatturato: 1200000,
        interessiSettoriali: ['Energia Solare', 'Eolico', 'Sostenibilità'],
        dipendenti: 40,
        email: 'info@greentech.it'
      }
    ];
    
    // For each bando, find matching clienti
    for (const bando of bandi) {
      for (const cliente of clienti) {
        // Simple matching algorithm (in a real implementation, this would be more sophisticated)
        let compatibilita = 0;
        
        // Match based on sectors of interest
        if (bando.settori && cliente.interessiSettoriali) {
          for (const settore of bando.settori) {
            if (cliente.interessiSettoriali.some(s => s.toLowerCase().includes(settore.toLowerCase()) || 
                                                  settore.toLowerCase().includes(s.toLowerCase()))) {
              compatibilita += 25; // 25% match per sector
            }
          }
        }
        
        // Additional matching criteria could be added here
        // For example, match based on region, company size, etc.
        if (compatibilita > 0) {
          // Create a match
          const match: Match = {
            id: uuidv4(),
            clienteId: cliente.id,
            bandoId: bando.id,
            compatibilita,
            notificato: false,
            bando_titolo: bando.titolo,
            cliente_nome: cliente.nome,
            data_creazione: new Date().toISOString(),
            archiviato: false
          };
          
          // Check if match already exists
          const existingMatch = this.matchesStorage.find(m => m.clienteId === match.clienteId && m.bandoId === match.bandoId);
          if (!existingMatch) {
            this.matchesStorage.push(match);
            matchCount++;
          }
        }
      }
    }
    
    console.log(`Generated ${matchCount} new matches`);
    return matchCount;
  }
  
  // Generate and save matches for clients and bandi
  static async generateAndSaveMatches(clienti: Cliente[], bandi: Bando[]): Promise<number> {
    let matchCount = 0;
    
    // For each bando, find matching clienti
    for (const bando of bandi) {
      for (const cliente of clienti) {
        // Simple matching algorithm
        let compatibilita = 0;
        
        // Match based on sectors of interest
        if (bando.settori && cliente.interessiSettoriali) {
          for (const settore of bando.settori) {
            if (cliente.interessiSettoriali.some(s => s.toLowerCase().includes(settore.toLowerCase()) || 
                                                  settore.toLowerCase().includes(s.toLowerCase()))) {
              compatibilita += 25; // 25% match per sector
            }
          }
        }
        
        // Additional matching criteria
        if (compatibilita > 0) {
          // Create a match
          const match: Match = {
            id: uuidv4(),
            clienteId: cliente.id,
            bandoId: bando.id,
            compatibilita,
            notificato: false,
            bando_titolo: bando.titolo,
            cliente_nome: cliente.nome,
            data_creazione: new Date().toISOString(),
            archiviato: false
          };
          
          // Check if match already exists
          const existingMatch = this.matchesStorage.find(m => m.clienteId === match.clienteId && m.bandoId === match.bandoId);
          if (!existingMatch) {
            this.matchesStorage.push(match);
            matchCount++;
          }
        }
      }
    }
    
    console.log(`Generated ${matchCount} new matches`);
    return matchCount;
  }
  
  // Generate matches CSV content - changing to return string directly instead of Promise
  static generateMatchesCSV(matches: Match[]): string {
    // Generate CSV header
    let csv = "ID,Cliente,Bando,Compatibilità,Data Creazione,Archiviato\n";
    
    // Add each match as a row
    for (const match of matches) {
      csv += `${match.id},${match.cliente_nome || ''},${match.bando_titolo || ''},${match.compatibilita}%,${match.data_creazione || ''},${match.archiviato ? 'Sì' : 'No'}\n`;
    }
    
    return csv;
  }
  
  // Generate bandi CSV content
  static generateBandiCSV(bandi: Bando[]): string {
    // Generate CSV header
    let csv = "ID,Titolo,Fonte,Tipo,Scadenza,Importo Min,Importo Max\n";
    
    // Add each bando as a row
    for (const bando of bandi) {
      csv += `${bando.id},${bando.titolo},${bando.fonte},${bando.tipo},${bando.scadenza},${bando.importoMin || ''},${bando.importoMax || ''}\n`;
    }
    
    return csv;
  }
}

export default SupabaseMatchService;
