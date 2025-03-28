
import { Bando, Cliente, Match } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface MatchResult {
  id: string;
  cliente: {
    id: string;
    nome: string;
    settore: string;
  };
  bando: {
    id: string;
    titolo: string;
    fonte: string;
    scadenza: string;
  };
  punteggio: number;
  dataMatch: string;
}

class MatchService {
  /**
   * Calcola la compatibilità tra un bando e un cliente
   * @param bando Bando da valutare
   * @param cliente Cliente da valutare
   * @returns Punteggio di compatibilità (0-100)
   */
  static calculateMatch(bando: Bando, cliente: Cliente): number {
    // Se il bando non ha settori o il cliente non ha interessi settoriali, il match è zero
    if (!bando.settori || !cliente.interessiSettoriali || 
        !Array.isArray(bando.settori) || !Array.isArray(cliente.interessiSettoriali) ||
        bando.settori.length === 0 || cliente.interessiSettoriali.length === 0) {
      return 0;
    }
    
    // Calcoliamo l'overlap tra i settori del bando e gli interessi del cliente
    const settoriInComune = bando.settori.filter(settore => 
      cliente.interessiSettoriali.some(interesse => 
        interesse.toLowerCase() === settore.toLowerCase()
      )
    );
    
    // Se non ci sono settori in comune, il match è zero
    if (settoriInComune.length === 0) {
      return 0;
    }
    
    // Calcoliamo il punteggio basato sulla percentuale di settori in comune
    // rispetto agli interessi del cliente (max 100 punti)
    const punteggio = Math.min(
      100,
      Math.round((settoriInComune.length / cliente.interessiSettoriali.length) * 100)
    );
    
    return punteggio;
  }
  
  /**
   * Genera match tra clienti e bandi
   * @param clienti Array di clienti
   * @param bandi Array di bandi
   * @returns Array di MatchResult
   */
  static generateMatches(clienti: Cliente[], bandi: Bando[]): MatchResult[] {
    const results: MatchResult[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    clienti.forEach(cliente => {
      bandi.forEach(bando => {
        const punteggio = this.calculateMatch(bando, cliente);
        
        // Aggiungiamo solo i match con punteggio > 0
        if (punteggio > 0) {
          results.push({
            id: uuidv4(),
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
            punteggio,
            dataMatch: today
          });
        }
      });
    });
    
    // Ordina per punteggio decrescente
    return results.sort((a, b) => b.punteggio - a.punteggio);
  }
  
  /**
   * Formatta una lista di match per visualizzazione
   * @param matches Array di Match
   * @returns Array di oggetti con i dati formattati
   */
  static formatMatchesForDisplay(matches: Match[]): any[] {
    return matches.map(match => {
      const bando = match.bandoId ? { titolo: 'N/D', scadenza: null, settori: [] } : { titolo: 'N/D', scadenza: null, settori: [] };
      const cliente = match.clienteId ? { nome: 'N/D', interessiSettoriali: [] } : { nome: 'N/D', interessiSettoriali: [] };
      
      return {
        id: match.id,
        cliente: cliente.nome,
        bando: bando.titolo,
        compatibilita: match.compatibilita,
        notificato: match.notificato ? 'Sì' : 'No',
        scadenza: bando.scadenza || 'N/D',
        settori: Array.isArray(bando.settori) 
          ? bando.settori.join(', ') 
          : typeof bando.settori === 'string' 
            ? bando.settori 
            : 'N/D'
      };
    });
  }
  
  /**
   * Esporta i match in formato CSV
   * @param matches Array di Match
   * @returns Stringa in formato CSV
   */
  static exportMatchesToCSV(matches: Match[]): string {
    // Definizione delle intestazioni
    const headers = [
      'ID', 
      'Cliente', 
      'Bando', 
      'Compatibilità (%)', 
      'Notificato', 
      'Scadenza', 
      'Settori in comune'
    ].join(',');
    
    // Formattazione delle righe
    const rows = matches.map(match => {
      const bando = match.bandoId ? { titolo: 'N/D', scadenza: null, settori: [] } : { titolo: 'N/D', scadenza: null, settori: [] };
      const cliente = match.clienteId ? { nome: 'N/D', interessiSettoriali: [] } : { nome: 'N/D', interessiSettoriali: [] };
      
      // Trovare settori in comune
      let settoriInComune: string[] = [];
      if (Array.isArray(bando.settori) && Array.isArray(cliente.interessiSettoriali)) {
        settoriInComune = bando.settori.filter(settore => 
          cliente.interessiSettoriali.some(interesse => 
            interesse.toLowerCase() === settore.toLowerCase()
          )
        );
      }
      
      return [
        match.id,
        `"${(cliente.nome || 'N/D').replace(/"/g, '""')}"`, // Escape double quotes
        `"${(bando.titolo || 'N/D').replace(/"/g, '""')}"`,
        match.compatibilita,
        match.notificato ? 'Sì' : 'No',
        bando.scadenza || 'N/D',
        `"${settoriInComune.join('; ').replace(/"/g, '""')}"`
      ].join(',');
    });
    
    // Unione di intestazioni e righe
    return [headers, ...rows].join('\n');
  }
  
  /**
   * Avvia il download di un file CSV
   * @param csvContent Contenuto del CSV
   * @param filename Nome del file
   */
  static downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default MatchService;
