
import { supabase } from '@/integrations/supabase/client';
import { Match, Bando, Cliente } from '@/types';
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
}

export default SupabaseMatchService;
