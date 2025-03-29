
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
  dettaglioMatch?: string[];
}

class MatchService {
  /**
   * Calcola la compatibilità tra un bando e un cliente analizzando i requisiti
   * e le caratteristiche del cliente
   * @param bando Bando da valutare
   * @param cliente Cliente da valutare
   * @returns Punteggio di compatibilità (0-100) e dettagli del match
   */
  static calculateMatch(bando: Bando, cliente: Cliente): { punteggio: number, dettaglioMatch: string[] } {
    let punteggio = 0;
    const dettaglioMatch: string[] = [];
    const fattoriDiPeso = {
      settori: 50,
      regione: 15,
      dimensioneAzienda: 20,
      altriRequisiti: 15
    };
    
    // 1. Match sui settori (peso 50%)
    let punteggioSettori = 0;
    if (bando.settori && Array.isArray(bando.settori) && bando.settori.length > 0 && 
        cliente.interessiSettoriali && Array.isArray(cliente.interessiSettoriali) && cliente.interessiSettoriali.length > 0) {
      
      const settoriInComune = bando.settori.filter(settore => 
        cliente.interessiSettoriali.some(interesse => 
          interesse.toLowerCase().includes(settore.toLowerCase()) || 
          settore.toLowerCase().includes(interesse.toLowerCase())
        )
      );
      
      if (settoriInComune.length > 0) {
        punteggioSettori = Math.round((settoriInComune.length / Math.max(1, cliente.interessiSettoriali.length)) * 100);
        dettaglioMatch.push(`Settori in comune: ${settoriInComune.join(', ')} (${punteggioSettori}%)`);
      } else {
        dettaglioMatch.push('Nessun settore in comune');
      }
    } else {
      dettaglioMatch.push('Dati settoriali mancanti');
    }
    
    // 2. Match sulla regione/territorio (peso 15%)
    let punteggioRegione = 0;
    if (bando.requisiti && cliente.regione) {
      const requisitiLower = bando.requisiti.toLowerCase();
      const regioneLower = cliente.regione.toLowerCase();
      
      if (requisitiLower.includes(regioneLower)) {
        punteggioRegione = 100;
        dettaglioMatch.push(`Regione compatibile: ${cliente.regione}`);
      } else if (requisitiLower.includes('nazionale') || requisitiLower.includes('tutte le regioni')) {
        punteggioRegione = 100;
        dettaglioMatch.push('Bando nazionale, compatibile con tutte le regioni');
      } else {
        dettaglioMatch.push('Regione non specificatamente inclusa nei requisiti');
      }
    }
    
    // 3. Match sulla dimensione aziendale (fatturato, dipendenti) (peso 20%)
    let punteggioDimensione = 0;
    if (bando.requisiti && (cliente.dipendenti || cliente.fatturato)) {
      const requisitiLower = bando.requisiti.toLowerCase();
      
      // Analisi requisiti sui dipendenti
      if (cliente.dipendenti) {
        if (
          (requisitiLower.includes('piccole imprese') && cliente.dipendenti < 50) ||
          (requisitiLower.includes('medie imprese') && cliente.dipendenti >= 50 && cliente.dipendenti < 250) ||
          (requisitiLower.includes('grandi imprese') && cliente.dipendenti >= 250)
        ) {
          punteggioDimensione += 50;
          dettaglioMatch.push(`Dimensione aziendale compatibile: ${cliente.dipendenti} dipendenti`);
        }
      }
      
      // Analisi requisiti sul fatturato
      if (cliente.fatturato) {
        if (
          (requisitiLower.includes('piccole imprese') && cliente.fatturato < 10000000) ||
          (requisitiLower.includes('medie imprese') && cliente.fatturato >= 10000000 && cliente.fatturato < 50000000) ||
          (requisitiLower.includes('grandi imprese') && cliente.fatturato >= 50000000)
        ) {
          punteggioDimensione += 50;
          dettaglioMatch.push(`Fatturato aziendale compatibile: ${cliente.fatturato} €`);
        }
      }
    } else if (!bando.requisiti) {
      // Se non ci sono requisiti specifici, diamo un punteggio neutro
      punteggioDimensione = 50;
      dettaglioMatch.push('Nessun requisito dimensionale specificato');
    } else {
      dettaglioMatch.push('Dati dimensionali del cliente mancanti');
    }
    
    // 4. Altri requisiti (forma giuridica, anno fondazione, etc.) (peso 15%)
    let punteggioAltriRequisiti = 0;
    if (bando.requisiti) {
      const requisitiLower = bando.requisiti.toLowerCase();
      let fattoriCorrispondenti = 0;
      let fattoriTotali = 0;
      
      // Forma giuridica
      if (cliente.formaGiuridica) {
        fattoriTotali++;
        if (requisitiLower.includes(cliente.formaGiuridica.toLowerCase())) {
          fattoriCorrispondenti++;
          dettaglioMatch.push(`Forma giuridica compatibile: ${cliente.formaGiuridica}`);
        }
      }
      
      // Anno fondazione
      if (cliente.annoFondazione) {
        fattoriTotali++;
        // Controllo se ci sono riferimenti a età dell'azienda o anno di fondazione
        const annoAttuale = new Date().getFullYear();
        const etaAzienda = annoAttuale - cliente.annoFondazione;
        
        if (
          (requisitiLower.includes('start-up') && etaAzienda <= 5) ||
          (requisitiLower.includes('nuove imprese') && etaAzienda <= 3) ||
          (!requisitiLower.includes('nuove imprese') && !requisitiLower.includes('start-up'))
        ) {
          fattoriCorrispondenti++;
          dettaglioMatch.push(`Anno fondazione compatibile: ${cliente.annoFondazione} (${etaAzienda} anni)`);
        }
      }
      
      if (fattoriTotali > 0) {
        punteggioAltriRequisiti = Math.round((fattoriCorrispondenti / fattoriTotali) * 100);
      } else {
        punteggioAltriRequisiti = 50; // Valore neutro se non ci sono dati da confrontare
        dettaglioMatch.push('Dati aggiuntivi non disponibili per la valutazione');
      }
    } else {
      punteggioAltriRequisiti = 50; // Valore neutro se non ci sono requisiti specifici
    }
    
    // Calcolo del punteggio finale ponderato
    punteggio = Math.round(
      (punteggioSettori * fattoriDiPeso.settori +
      punteggioRegione * fattoriDiPeso.regione +
      punteggioDimensione * fattoriDiPeso.dimensioneAzienda +
      punteggioAltriRequisiti * fattoriDiPeso.altriRequisiti) / 100
    );
    
    // Aggiungiamo un riepilogo del punteggio
    dettaglioMatch.unshift(`Punteggio complessivo: ${punteggio}%`);
    
    return { punteggio, dettaglioMatch };
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
        const { punteggio, dettaglioMatch } = this.calculateMatch(bando, cliente);
        
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
            dataMatch: today,
            dettaglioMatch
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
