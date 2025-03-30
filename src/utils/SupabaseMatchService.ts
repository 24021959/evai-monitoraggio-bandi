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
   * Genera e salva match tra clienti e bandi utilizzando l'algoritmo di matching avanzato
   */
  static async generateAndSaveMatches(clienti: Cliente[], bandi: Bando[]): Promise<MatchResult[]> {
    try {
      console.log(`Generazione match tra ${clienti.length} clienti e ${bandi.length} bandi...`);
      
      // Genera match utilizzando l'algoritmo di MatchService
      const matchResults = MatchService.generateMatches(clienti, bandi);
      console.log(`Generati ${matchResults.length} match potenziali`);
      
      let salvati = 0;
      const matchSalvati: MatchResult[] = [];
      
      // Salva i match in Supabase
      for (const match of matchResults) {
        // Salviamo solo i match con compatibilità > 30%
        if (match.punteggio > 30) {
          const success = await this.saveMatch({
            id: match.id,
            clienteId: match.cliente.id,
            bandoId: match.bando.id,
            compatibilita: match.punteggio,
            notificato: false
          });
          
          if (success) {
            salvati++;
            matchSalvati.push(match);
          }
        }
      }
      
      console.log(`Salvati ${salvati} match su ${matchResults.length}`);
      return matchSalvati;
    } catch (error) {
      console.error('Errore durante la generazione e salvataggio dei match:', error);
      return [];
    }
  }
  
  /**
   * Trova i nuovi match dopo l'importazione di nuovi bandi
   * @param clienti Lista dei clienti
   * @param nuoviBandi Nuovi bandi importati
   * @returns Match trovati
   */
  static async findNewMatches(clienti: Cliente[], nuoviBandi: Bando[]): Promise<MatchResult[]> {
    if (nuoviBandi.length === 0 || clienti.length === 0) {
      return [];
    }
    
    try {
      // Genera match utilizzando l'algoritmo migliorato
      const matchResults = MatchService.generateMatches(clienti, nuoviBandi);
      
      // Filtra per i match con punteggio significativo
      const matchRilevanti = matchResults.filter(match => match.punteggio > 40);
      
      // Salva i match in Supabase
      const salvati: MatchResult[] = [];
      for (const match of matchRilevanti) {
        const success = await this.saveMatch({
          id: match.id,
          clienteId: match.cliente.id,
          bandoId: match.bando.id,
          compatibilita: match.punteggio,
          notificato: false
        });
        
        if (success) {
          salvati.push(match);
        }
      }
      
      return salvati.sort((a, b) => b.punteggio - a.punteggio);
    } catch (error) {
      console.error('Errore durante la ricerca di nuovi match:', error);
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
    
    for (const match of matches) {
      const cliente = clientMap.get(match.clienteId);
      const bando = bandoMap.get(match.bandoId);
      
      if (cliente && bando) {
        // Ricalcoliamo i dettagli del match
        const { dettaglioMatch } = MatchService.calculateMatch(bando, cliente);
        
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
          dataMatch: match.created_at || new Date().toISOString(),
          dettaglioMatch
        });
      }
    }
    
    // Ordina per punteggio decrescente
    return results.sort((a, b) => b.punteggio - a.punteggio);
  }

  /**
   * Recupera i match in un intervallo di date
   */
  static async getMatchesByDateRange(startDate: string, endDate: string, clienteId?: string): Promise<Match[]> {
    try {
      // Utilizziamo un intervallo di date per filtrare i match
      const { data, error } = await supabase
        .from('match')
        .select('*, bandi(*), clienti(*)')
        .gte('created_at', `${startDate}T00:00:00.000Z`)
        .lte('created_at', `${endDate}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore nel recupero dei match per intervallo di date:', error);
        return [];
      }

      // Se è specificato un cliente, filtriamo per cliente
      let filteredData = data;
      if (clienteId) {
        filteredData = data.filter(match => match.clienteid === clienteId);
      }

      // Mappiamo i dati nella struttura richiesta
      return filteredData.map(row => ({
        id: row.id,
        clienteId: row.clienteid,
        bandoId: row.bandoid,
        compatibilita: row.compatibilita,
        notificato: row.notificato || false,
        // Aggiungiamo i campi per la visualizzazione nella tabella
        bando_titolo: row.bandi?.titolo || 'Bando non disponibile',
        cliente_nome: row.clienti?.nome || 'Cliente non disponibile',
        data_creazione: row.created_at
      }));
    } catch (error) {
      console.error('Errore durante il recupero dei match per intervallo di date:', error);
      return [];
    }
  }

  /**
   * Genera un file CSV per i bandi
   */
  static generateBandiCSV(bandi: Bando[]): string {
    if (bandi.length === 0) return '';

    // Definiamo le intestazioni per il CSV
    const headers = [
      'ID', 
      'Titolo', 
      'Fonte', 
      'Tipo', 
      'Scadenza', 
      'Settori',
      'Importo Minimo',
      'Importo Massimo',
      'URL'
    ].join(',');

    // Creiamo le righe del CSV
    const rows = bandi.map(bando => {
      const settori = Array.isArray(bando.settori) 
        ? `"${bando.settori.join('; ')}"` 
        : '';
      
      return [
        bando.id,
        `"${bando.titolo.replace(/"/g, '""')}"`,
        `"${bando.fonte.replace(/"/g, '""')}"`,
        bando.tipo,
        bando.scadenza,
        settori,
        bando.importoMin || '',
        bando.importoMax || '',
        bando.url ? `"${bando.url}"` : ''
      ].join(',');
    });

    // Uniamo headers e rows
    return [headers, ...rows].join('\n');
  }

  /**
   * Genera un file CSV per i match
   */
  static generateMatchesCSV(matches: Match[]): string {
    if (matches.length === 0) return '';

    // Definiamo le intestazioni per il CSV
    const headers = [
      'ID Match', 
      'ID Bando', 
      'Titolo Bando', 
      'ID Cliente', 
      'Nome Cliente',
      'Compatibilità',
      'Data Creazione',
      'Notificato'
    ].join(',');

    // Creiamo le righe del CSV
    const rows = matches.map(match => {
      return [
        match.id,
        match.bandoId,
        match.bando_titolo ? `"${match.bando_titolo.replace(/"/g, '""')}"` : '',
        match.clienteId,
        match.cliente_nome ? `"${match.cliente_nome.replace(/"/g, '""')}"` : '',
        match.compatibilita,
        match.data_creazione ? new Date(match.data_creazione).toISOString() : '',
        match.notificato ? 'Sì' : 'No'
      ].join(',');
    });

    // Uniamo headers e rows
    return [headers, ...rows].join('\n');
  }
}

export default SupabaseMatchService;
