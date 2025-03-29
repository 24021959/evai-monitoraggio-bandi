
import { Match, Bando, Cliente } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import SupabaseClientiService from './SupabaseClientiService';

// Mock implementation of a Supabase match service
class SupabaseMatchService {
  // Storage for mock matches
  private static matchStorage: Match[] = [
    {
      id: 'match-1',
      clienteId: 'cliente-1',
      bandoId: 'bando-1',
      compatibilita: 85,
      notificato: true,
      bando_titolo: 'Bando per l\'innovazione nel settore agricolo',
      cliente_nome: 'Azienda Agricola Rossi',
      data_creazione: '2024-01-15',
      archiviato: false
    },
    {
      id: 'match-2',
      clienteId: 'cliente-2',
      bandoId: 'bando-2',
      compatibilita: 75,
      notificato: true,
      bando_titolo: 'Incentivi per l\'efficienza energetica nelle PMI',
      cliente_nome: 'GreenTech Solutions Srl',
      data_creazione: '2024-01-20',
      archiviato: false
    }
  ];

  // Get all matches
  static async getMatches(): Promise<Match[]> {
    // In a real implementation, this would fetch from Supabase
    console.log('Fetching all matches');
    return this.matchStorage;
  }

  // Get non-archived matches
  static async getActiveMatches(): Promise<Match[]> {
    // In a real implementation, this would filter in the Supabase query
    return this.matchStorage.filter(match => !match.archiviato);
  }

  // Get archived matches
  static async getArchivedMatches(): Promise<Match[]> {
    // In a real implementation, this would filter in the Supabase query
    return this.matchStorage.filter(match => match.archiviato);
  }

  // Archive a match
  static async archiveMatch(matchId: string): Promise<boolean> {
    const matchIndex = this.matchStorage.findIndex(m => m.id === matchId);
    if (matchIndex !== -1) {
      this.matchStorage[matchIndex].archiviato = true;
      return true;
    }
    return false;
  }

  // Restore a match from archive
  static async restoreMatch(matchId: string): Promise<boolean> {
    const matchIndex = this.matchStorage.findIndex(m => m.id === matchId);
    if (matchIndex !== -1) {
      this.matchStorage[matchIndex].archiviato = false;
      return true;
    }
    return false;
  }

  // Generate matches for a list of bandi
  static async generateMatchesForBandi(bandi: Bando[]): Promise<number> {
    try {
      const clienti = await SupabaseClientiService.getClienti();
      let matchCount = 0;

      for (const bando of bandi) {
        for (const cliente of clienti) {
          // Convert database field names to match Cliente interface
          const clienteFormatted: Cliente = {
            id: cliente.id,
            nome: cliente.nome,
            settore: cliente.settore,
            regione: cliente.regione,
            provincia: cliente.provincia,
            fatturato: cliente.fatturato,
            // Map interessisettoriali to interessiSettoriali (camel case)
            interessiSettoriali: Array.isArray(cliente.interessisettoriali) ? 
              cliente.interessisettoriali : 
              (typeof cliente.interessisettoriali === 'string' ? 
                [cliente.interessisettoriali] : []),
            dipendenti: cliente.dipendenti,
            email: cliente.email,
            telefono: cliente.telefono,
            annoFondazione: cliente.annofondazione,
            formaGiuridica: cliente.formagiuridica,
            codiceATECO: cliente.codiceateco
          };

          // Calculate compatibility
          const compatibility = this.calculateCompatibility(bando, clienteFormatted);
          
          if (compatibility > 40) { // Only create matches with compatibility > 40%
            const newMatch: Match = {
              id: uuidv4(),
              clienteId: cliente.id,
              bandoId: bando.id,
              compatibilita: compatibility,
              notificato: false,
              bando_titolo: bando.titolo,
              cliente_nome: cliente.nome,
              data_creazione: new Date().toISOString(),
              archiviato: false
            };
            
            this.matchStorage.push(newMatch);
            matchCount++;
          }
        }
      }
      
      return matchCount;
    } catch (error) {
      console.error('Error generating matches:', error);
      return 0;
    }
  }

  // Calculate compatibility between a bando and a cliente
  private static calculateCompatibility(bando: Bando, cliente: Cliente): number {
    let score = 0;
    
    // Check sectoral interests match
    const clienteInterests = cliente.interessiSettoriali.map(s => s.toLowerCase());
    const bandoSectors = bando.settori.map(s => s.toLowerCase());
    
    // For each matching sector, add 20 points (max 60)
    let sectorMatchCount = 0;
    for (const sector of bandoSectors) {
      if (clienteInterests.some(interest => sector.includes(interest) || interest.includes(sector))) {
        sectorMatchCount++;
      }
    }
    score += Math.min(sectorMatchCount * 20, 60);
    
    // Region match gives 20 points
    if (bando.tipo === 'regionale') {
      // For regional bandi, check if the region matches
      const regionMatch = bando.fonte.toLowerCase().includes(cliente.regione.toLowerCase());
      if (regionMatch) {
        score += 20;
      }
    } else {
      // For non-regional bandi, automatically give 10 points
      score += 10;
    }
    
    // Company size appropriateness (based on funding amount)
    const fundingAppropriate = bando.importoMax 
      ? (bando.importoMax < cliente.fatturato * 0.5)
      : false;
    
    if (fundingAppropriate) {
      score += 20;
    }
    
    // Normalize to 0-100
    return Math.min(Math.max(score, 0), 100);
  }
}

export default SupabaseMatchService;
