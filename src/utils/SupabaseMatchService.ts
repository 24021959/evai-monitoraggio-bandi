
import { supabase } from '@/integrations/supabase/client';
import { Match } from '@/types';
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
        .order('compatibilita', { ascending: false });

      if (error) {
        console.error('Errore nel recupero dei match:', error);
        return [];
      }

      return data.map(this.mapDbRowToMatch);
    } catch (error) {
      console.error('Errore durante il recupero dei match:', error);
      return [];
    }
  }

  /**
   * Salva un match nel database
   */
  static async saveMatch(match: Match): Promise<boolean> {
    try {
      // Assicuriamoci che il match abbia un ID
      if (!match.id) {
        match.id = uuidv4();
      }

      // Convertiamo il match nel formato del database
      const dbMatch = this.mapMatchToDbRow(match);

      const { error } = await supabase
        .from('match')
        .upsert(dbMatch, { onConflict: 'id' });

      if (error) {
        console.error('Errore nel salvataggio del match:', error);
        return false;
      }

      console.log('Match salvato con successo:', match.id);
      return true;
    } catch (error) {
      console.error('Errore durante il salvataggio del match:', error);
      return false;
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
   * Recupera i match per un cliente specifico
   */
  static async getMatchesByCliente(clienteId: string): Promise<Match[]> {
    try {
      const { data, error } = await supabase
        .from('match')
        .select('*')
        .eq('clienteId', clienteId)
        .order('compatibilita', { ascending: false });

      if (error) {
        console.error('Errore nel recupero dei match per il cliente:', error);
        return [];
      }

      return data.map(this.mapDbRowToMatch);
    } catch (error) {
      console.error('Errore durante il recupero dei match per il cliente:', error);
      return [];
    }
  }

  /**
   * Recupera i match per un bando specifico
   */
  static async getMatchesByBando(bandoId: string): Promise<Match[]> {
    try {
      const { data, error } = await supabase
        .from('match')
        .select('*')
        .eq('bandoId', bandoId)
        .order('compatibilita', { ascending: false });

      if (error) {
        console.error('Errore nel recupero dei match per il bando:', error);
        return [];
      }

      return data.map(this.mapDbRowToMatch);
    } catch (error) {
      console.error('Errore durante il recupero dei match per il bando:', error);
      return [];
    }
  }

  /**
   * Aggiorna lo stato di notifica di un match
   */
  static async updateNotificaMatch(id: string, notificato: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('match')
        .update({ notificato })
        .eq('id', id);

      if (error) {
        console.error('Errore nell\'aggiornamento della notifica del match:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della notifica del match:', error);
      return false;
    }
  }

  /**
   * Mappa una riga del database nel formato Match
   */
  private static mapDbRowToMatch(row: any): Match {
    return {
      id: row.id,
      clienteId: row.clienteId,
      bandoId: row.bandoId,
      compatibilita: row.compatibilita,
      notificato: row.notificato
    };
  }

  /**
   * Mappa un Match in una riga del database
   */
  private static mapMatchToDbRow(match: Match): any {
    return {
      id: match.id,
      clienteId: match.clienteId,
      bandoId: match.bandoId,
      compatibilita: match.compatibilita,
      notificato: match.notificato
    };
  }
}

export default SupabaseMatchService;
