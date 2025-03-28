
import { supabase } from '@/integrations/supabase/client';
import { Match, Bando, Cliente } from '@/types';
import MatchService, { MatchResult } from './MatchService';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseMatchService {
  /**
   * Recupera tutti i match dal database Supabase
   */
  static async getMatches(): Promise<Match[]> {
    try {
      const { data, error } = await supabase
        .from('match')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore nel recupero dei match:', error);
        return [];
      }

      // Mappa i dati nel formato richiesto
      return data.map(row => ({
        id: row.id,
        clienteId: row.clienteid,
        bandoId: row.bandoid,
        compatibilita: row.compatibilita,
        notificato: row.notificato || false
      }));
    } catch (error) {
      console.error('Errore durante il recupero dei match:', error);
      return [];
    }
  }

  /**
   * Salva un match nel database
   */
  static async saveMatch(match: Partial<Match>): Promise<boolean> {
    try {
      // Assicuriamoci che il match abbia un ID valido (UUID)
      let matchId = match.id;
      if (!matchId || typeof matchId !== 'string' || !matchId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        matchId = uuidv4();
        console.log(`Generato nuovo UUID per match: ${matchId}`);
      }

      const matchToSave = {
        id: matchId,
        clienteid: match.clienteId,
        bandoid: match.bandoId,
        compatibilita: match.compatibilita,
        notificato: match.notificato || false
      };

      const { error } = await supabase
        .from('match')
        .upsert(matchToSave, { onConflict: 'id' });

      if (error) {
        console.error('Errore nel salvataggio del match:', error);
        return false;
      }

      console.log('Match salvato con successo:', matchToSave.id);
      return true;
    } catch (error) {
      console.error('Errore durante il salvataggio del match:', error);
      return false;
    }
  }

  /**
   * Recupera i match per un cliente specifico
   */
  static async getMatchesForCliente(clienteId: string): Promise<Match[]> {
    try {
      const { data, error } = await supabase
        .from('match')
        .select('*')
        .eq('clienteid', clienteId)
        .order('compatibilita', { ascending: false });

      if (error) {
        console.error('Errore nel recupero dei match per cliente:', error);
        return [];
      }

      // Mappa i dati nel formato richiesto
      return data.map(row => ({
        id: row.id,
        clienteId: row.clienteid,
        bandoId: row.bandoid,
        compatibilita: row.compatibilita,
        notificato: row.notificato || false
      }));
    } catch (error) {
      console.error('Errore durante il recupero dei match per cliente:', error);
      return [];
    }
  }

  /**
   * Recupera i match per un bando specifico
   */
  static async getMatchesForBando(bandoId: string): Promise<Match[]> {
    try {
      const { data, error } = await supabase
        .from('match')
        .select('*')
        .eq('bandoid', bandoId)
        .order('compatibilita', { ascending: false });

      if (error) {
        console.error('Errore nel recupero dei match per bando:', error);
        return [];
      }

      // Mappa i dati nel formato richiesto
      return data.map(row => ({
        id: row.id,
        clienteId: row.clienteid,
        bandoId: row.bandoid,
        compatibilita: row.compatibilita,
        notificato: row.notificato || false
      }));
    } catch (error) {
      console.error('Errore durante il recupero dei match per bando:', error);
      return [];
    }
  }

  /**
   * Elimina un match dal database
   */
  static async deleteMatch(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('match')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Errore nell\'eliminazione del match:', error);
        return false;
      }

      console.log('Match eliminato con successo:', id);
      return true;
    } catch (error) {
      console.error('Errore durante l\'eliminazione del match:', error);
      return false;
    }
  }
  
  /**
   * Genera e salva match tra clienti e bandi utilizzando l'algoritmo di matching
   */
  static async generateAndSaveMatches(clienti: Cliente[], bandi: Bando[]): Promise<MatchResult[]> {
    try {
      // Genera match utilizzando l'algoritmo di MatchService
      const matchResults = MatchService.generateMatches(clienti, bandi);
      
      // Salva i match in Supabase
      for (const match of matchResults) {
        await this.saveMatch({
          id: match.id,
          clienteId: match.cliente.id,
          bandoId: match.bando.id,
          compatibilita: match.punteggio,
          notificato: false
        });
      }
      
      console.log(`Generati e salvati ${matchResults.length} match`);
      return matchResults;
    } catch (error) {
      console.error('Errore durante la generazione e salvataggio dei match:', error);
      return [];
    }
  }
  
  /**
   * Converte i match da Supabase in MatchResult
   */
  static async convertMatchesToResults(matches: Match[], clienti: Cliente[], bandi: Bando[]): Promise<MatchResult[]> {
    const clientMap = new Map<string, Cliente>();
    const bandoMap = new Map<string, Bando>();
    
    // Crea mappe per accesso rapido
    clienti.forEach(cliente => clientMap.set(cliente.id, cliente));
    bandi.forEach(bando => bandoMap.set(bando.id, bando));
    
    // Converti i match in MatchResult
    const results: MatchResult[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    for (const match of matches) {
      const cliente = clientMap.get(match.clienteId);
      const bando = bandoMap.get(match.bandoId);
      
      if (cliente && bando) {
        results.push({
          id: match.id,
          cliente: {
            id: cliente.id,
            nome: cliente.nome,
            settore: cliente.settore
          },
          bando: {
            id: bando.id,
            titolo: bando.titolo,
            fonte: bando.fonte,
            scadenza: bando.scadenza
          },
          punteggio: match.compatibilita,
          dataMatch: today // Utilizziamo la data di oggi come approssimazione
        });
      }
    }
    
    // Ordina per punteggio decrescente
    return results.sort((a, b) => b.punteggio - a.punteggio);
  }
}

export default SupabaseMatchService;
