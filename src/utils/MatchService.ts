
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
    
    // Fattori di peso per ogni categoria di matching
    const fattoriDiPeso = {
      settori: 40,            // Ridotto da 50 a 40
      regione: 15,            // Invariato 
      dimensioneAzienda: 20,  // Invariato
      formeDiFinanziamento: 10, // Nuovo fattore
      altriRequisiti: 15      // Invariato
    };
    
    // 1. Match sui settori (peso 40%)
    let punteggioSettori = 0;
    if (bando.settori && Array.isArray(bando.settori) && bando.settori.length > 0 && 
        cliente.interessiSettoriali && Array.isArray(cliente.interessiSettoriali) && cliente.interessiSettoriali.length > 0) {
      
      // Miglioramento: utilizziamo una maggiore flessibilità nella corrispondenza dei settori
      const settoriInComune = bando.settori.filter(settore => 
        cliente.interessiSettoriali.some(interesse => {
          // Verifica corrispondenza esatta
          if (interesse.toLowerCase() === settore.toLowerCase()) return true;
          
          // Verifica se uno contiene l'altro
          if (interesse.toLowerCase().includes(settore.toLowerCase()) || 
              settore.toLowerCase().includes(interesse.toLowerCase())) return true;
              
          // Verifica corrispondenza parziale su parole chiave
          const settoreParole = settore.toLowerCase().split(/\s+/);
          const interesseParole = interesse.toLowerCase().split(/\s+/);
          
          // Se almeno due parole significative corrispondono, consideriamo una corrispondenza
          let paroleTrovate = 0;
          for (const parola of settoreParole) {
            if (parola.length > 3 && interesseParole.includes(parola)) {
              paroleTrovate++;
              if (paroleTrovate >= 2) return true;
            }
          }
          
          return false;
        })
      );
      
      if (settoriInComune.length > 0) {
        punteggioSettori = Math.min(100, Math.round((settoriInComune.length / Math.max(1, bando.settori.length)) * 100));
        
        const msg = `Settori in comune: ${settoriInComune.join(', ')} (${punteggioSettori}%)`;
        console.log(`Match settori per cliente ${cliente.id} e bando ${bando.id}: ${msg}`);
        dettaglioMatch.push(msg);
      } else {
        dettaglioMatch.push('Nessun settore in comune');
      }
    } else if (!bando.settori || bando.settori.length === 0) {
      // Se il bando non ha settori specificati, assegniamo un punteggio neutro
      punteggioSettori = 50;
      dettaglioMatch.push('Bando senza settori specificati');
    } else {
      dettaglioMatch.push('Dati settoriali mancanti');
    }
    
    // 2. Match sulla regione/territorio (peso 15%)
    let punteggioRegione = 0;
    if (bando.requisiti && cliente.regione) {
      const requisitiLower = bando.requisiti.toLowerCase();
      const regioneLower = cliente.regione.toLowerCase();
      
      // Miglioramento: migliore rilevamento di regioni e territori
      if (requisitiLower.includes(regioneLower)) {
        punteggioRegione = 100;
        dettaglioMatch.push(`Regione compatibile: ${cliente.regione}`);
      } else if (
        requisitiLower.includes('nazionale') || 
        requisitiLower.includes('tutte le regioni') ||
        requisitiLower.includes('tutto il territorio nazionale') ||
        requisitiLower.includes('tutto il territorio italiano') ||
        requisitiLower.includes('tutto il paese')
      ) {
        punteggioRegione = 100;
        dettaglioMatch.push('Bando nazionale, compatibile con tutte le regioni');
      } else if (requisitiLower.includes('nord italia') && ['lombardia', 'piemonte', 'liguria', 'valle d\'aosta', 'trentino', 'veneto', 'friuli'].includes(regioneLower)) {
        punteggioRegione = 100;
        dettaglioMatch.push('Bando per Nord Italia, compatibile con la regione del cliente');
      } else if (requisitiLower.includes('centro italia') && ['toscana', 'lazio', 'umbria', 'marche', 'abruzzo', 'molise'].includes(regioneLower)) {
        punteggioRegione = 100;
        dettaglioMatch.push('Bando per Centro Italia, compatibile con la regione del cliente');
      } else if (requisitiLower.includes('sud italia') && ['campania', 'puglia', 'basilicata', 'calabria', 'sicilia', 'sardegna'].includes(regioneLower)) {
        punteggioRegione = 100;
        dettaglioMatch.push('Bando per Sud Italia, compatibile con la regione del cliente');
      } else if (!requisitiLower.includes('regione') && !requisitiLower.includes('regioni') && !requisitiLower.includes('territorio')) {
        // Se non si menzionano esplicitamente requisiti territoriali, diamo un punteggio neutro
        punteggioRegione = 50;
        dettaglioMatch.push('Nessun requisito territoriale esplicito nel bando');
      } else {
        dettaglioMatch.push('Regione non specificatamente inclusa nei requisiti');
      }
    } else if (!bando.requisiti) {
      // Se non ci sono requisiti, diamo un punteggio neutro
      punteggioRegione = 50;
      dettaglioMatch.push('Nessun requisito regionale specificato nel bando');
    } else {
      dettaglioMatch.push('Dati regionali del cliente mancanti');
    }
    
    // 3. Match sulla dimensione aziendale (fatturato, dipendenti) (peso 20%)
    let punteggioDimensione = 0;
    if (bando.requisiti && (cliente.dipendenti || cliente.fatturato)) {
      const requisitiLower = bando.requisiti.toLowerCase();
      let punteggioDipendenti = 0;
      let punteggioFatturato = 0;
      let fattoriDimensione = 0;
      
      // Analisi requisiti sui dipendenti
      if (cliente.dipendenti !== undefined) {
        fattoriDimensione++;
        
        // Miglioramento: precisione nell'identificare le dimensioni aziendali
        if (
          (requisitiLower.includes('microimprese') && cliente.dipendenti < 10) ||
          (requisitiLower.includes('micro imprese') && cliente.dipendenti < 10) ||
          (requisitiLower.includes('piccole imprese') && cliente.dipendenti < 50) ||
          (requisitiLower.includes('medie imprese') && cliente.dipendenti >= 50 && cliente.dipendenti < 250) ||
          (requisitiLower.includes('piccole e medie imprese') && cliente.dipendenti < 250) ||
          (requisitiLower.includes('pmi') && cliente.dipendenti < 250) ||
          (requisitiLower.includes('grandi imprese') && cliente.dipendenti >= 250)
        ) {
          punteggioDipendenti = 100;
          dettaglioMatch.push(`Dimensione aziendale compatibile: ${cliente.dipendenti} dipendenti`);
        } else if (!requisitiLower.includes('dipendenti') && 
                  !requisitiLower.includes('personale') && 
                  !requisitiLower.includes('lavoratori') &&
                  !requisitiLower.includes('pmi') &&
                  !requisitiLower.includes('imprese')) {
          // Se non si menzionano requisiti sui dipendenti, diamo un punteggio neutro
          punteggioDipendenti = 50;
          dettaglioMatch.push('Nessun requisito specifico sul numero di dipendenti');
        } else {
          dettaglioMatch.push('Dimensione aziendale (dipendenti) non compatibile');
        }
      }
      
      // Analisi requisiti sul fatturato
      if (cliente.fatturato !== undefined) {
        fattoriDimensione++;
        
        // Miglioramento: precisione nell'identificare le dimensioni di fatturato
        const fatturatoInMillions = cliente.fatturato / 1000000;
        if (
          (requisitiLower.includes('microimprese') && fatturatoInMillions < 2) ||
          (requisitiLower.includes('micro imprese') && fatturatoInMillions < 2) ||
          (requisitiLower.includes('piccole imprese') && fatturatoInMillions < 10) ||
          (requisitiLower.includes('medie imprese') && fatturatoInMillions >= 10 && fatturatoInMillions < 50) ||
          (requisitiLower.includes('piccole e medie imprese') && fatturatoInMillions < 50) ||
          (requisitiLower.includes('pmi') && fatturatoInMillions < 50) ||
          (requisitiLower.includes('grandi imprese') && fatturatoInMillions >= 50)
        ) {
          punteggioFatturato = 100;
          dettaglioMatch.push(`Fatturato aziendale compatibile: ${cliente.fatturato.toLocaleString('it-IT')} €`);
        } else if (!requisitiLower.includes('fatturato') && 
                  !requisitiLower.includes('volume d\'affari') && 
                  !requisitiLower.includes('ricavi')) {
          // Se non si menzionano requisiti sul fatturato, diamo un punteggio neutro
          punteggioFatturato = 50;
          dettaglioMatch.push('Nessun requisito specifico sul fatturato');
        } else {
          dettaglioMatch.push('Fatturato aziendale non compatibile');
        }
      }
      
      // Calcolo del punteggio dimensionale totale
      if (fattoriDimensione > 0) {
        punteggioDimensione = (punteggioDipendenti + punteggioFatturato) / fattoriDimensione;
      } else {
        // Nessun dato dimensionale disponibile
        punteggioDimensione = 50; // Valore neutro
      }
    } else if (!bando.requisiti) {
      // Se non ci sono requisiti specifici, diamo un punteggio neutro
      punteggioDimensione = 50;
      dettaglioMatch.push('Nessun requisito dimensionale specificato');
    } else {
      dettaglioMatch.push('Dati dimensionali del cliente mancanti');
    }
    
    // 4. NUOVO: Match sulle forme di finanziamento (peso 10%)
    let punteggioFinanziamento = 50; // Valore predefinito neutro
    if (bando.descrizione || bando.descrizioneCompleta) {
      const descCompleta = (bando.descrizioneCompleta || bando.descrizione || '').toLowerCase();
      
      // Analizziamo il tipo di finanziamento offerto
      let tipoFinanziamento = '';
      
      if (descCompleta.includes('contributo a fondo perduto') || 
          descCompleta.includes('fondo perduto') ||
          descCompleta.includes('contributi diretti') ||
          descCompleta.includes('sovvenzione')) {
        tipoFinanziamento = 'fondo perduto';
        punteggioFinanziamento = 100; // Tipo di finanziamento più attraente
        dettaglioMatch.push('Finanziamento: contributo a fondo perduto (ottimo)');
      } else if (descCompleta.includes('finanziamento agevolato') ||
                descCompleta.includes('tasso agevolato') ||
                descCompleta.includes('prestito agevolato')) {
        tipoFinanziamento = 'finanziamento agevolato';
        punteggioFinanziamento = 85; // Molto attraente
        dettaglioMatch.push('Finanziamento: prestito a tasso agevolato (molto buono)');
      } else if (descCompleta.includes('credito d\'imposta') ||
                descCompleta.includes('credito di imposta') ||
                descCompleta.includes('agevolazione fiscale')) {
        tipoFinanziamento = 'credito imposta';
        punteggioFinanziamento = 90; // Molto attraente
        dettaglioMatch.push('Finanziamento: credito d\'imposta (molto buono)');
      } else if (descCompleta.includes('garanzia') ||
                descCompleta.includes('fondo di garanzia')) {
        tipoFinanziamento = 'garanzia';
        punteggioFinanziamento = 75; // Attraente
        dettaglioMatch.push('Finanziamento: garanzia per accesso al credito (buono)');
      } else if (descCompleta.includes('voucher') ||
                descCompleta.includes('bonus')) {
        tipoFinanziamento = 'voucher/bonus';
        punteggioFinanziamento = 90; // Molto attraente
        dettaglioMatch.push('Finanziamento: voucher/bonus (molto buono)');
      } else {
        dettaglioMatch.push('Forma di finanziamento non specificata chiaramente');
      }
    } else {
      dettaglioMatch.push('Informazioni sul finanziamento non disponibili');
    }
    
    // 5. Altri requisiti (forma giuridica, anno fondazione, etc.) (peso 15%)
    let punteggioAltriRequisiti = 0;
    if (bando.requisiti) {
      const requisitiLower = bando.requisiti.toLowerCase();
      let fattoriCorrispondenti = 0;
      let fattoriTotali = 0;
      
      // Forma giuridica
      if (cliente.formaGiuridica) {
        fattoriTotali++;
        
        // Miglioramento: identificazione più precisa delle forme giuridiche
        const formaGiuridicaLower = cliente.formaGiuridica.toLowerCase();
        if (requisitiLower.includes(formaGiuridicaLower)) {
          fattoriCorrispondenti++;
          dettaglioMatch.push(`Forma giuridica compatibile: ${cliente.formaGiuridica}`);
        } else if (
          // Categorizzazioni comuni delle forme giuridiche
          (requisitiLower.includes('società di capitali') && ['spa', 'srl', 'sapa'].some(f => formaGiuridicaLower.includes(f))) ||
          (requisitiLower.includes('società di persone') && ['snc', 'sas', 'ss'].some(f => formaGiuridicaLower.includes(f))) ||
          (requisitiLower.includes('ditte individuali') && formaGiuridicaLower.includes('ditta individuale')) ||
          (!requisitiLower.includes('forma giuridica') && !requisitiLower.includes('società'))
        ) {
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
          (requisitiLower.includes('startup') && etaAzienda <= 5) ||
          (requisitiLower.includes('nuove imprese') && etaAzienda <= 3) ||
          (requisitiLower.includes('imprese consolidate') && etaAzienda > 5) ||
          (requisitiLower.includes('aziende storiche') && etaAzienda > 20) ||
          (!requisitiLower.includes('anno') && !requisitiLower.includes('startup') && !requisitiLower.includes('start-up') && !requisitiLower.includes('nuove imprese'))
        ) {
          fattoriCorrispondenti++;
          dettaglioMatch.push(`Anno fondazione compatibile: ${cliente.annoFondazione} (${etaAzienda} anni)`);
        }
      }
      
      // Codice ATECO
      if (cliente.codiceATECO && bando.requisiti) {
        fattoriTotali++;
        const codiceAtecoCliente = cliente.codiceATECO.replace(/\./g, ''); // Rimuove i punti dal codice
        
        // Cerca codici ATECO nei requisiti (migliorato)
        let atecoCompatibile = false;
        const codiciAtecoPattern = /([A-Z]\d{2}(\.\d+)?)/g;
        const codiciNeiRequisiti = bando.requisiti.match(codiciAtecoPattern);
        
        if (codiciNeiRequisiti) {
          const codiciFormattati = codiciNeiRequisiti.map(codice => codice.replace(/\./g, ''));
          
          // Verifica se il codice del cliente è incluso nei requisiti o se c'è una corrispondenza sulla radice
          atecoCompatibile = codiciFormattati.some(codiceBando => {
            // Match esatto
            if (codiceBando === codiceAtecoCliente) return true;
            
            // Match sulla radice (es. se il bando richiede C10, va bene anche C10.1, C10.11, ecc.)
            if (codiceBando.length < codiceAtecoCliente.length) {
              return codiceAtecoCliente.startsWith(codiceBando);
            }
            
            return false;
          });
          
          if (atecoCompatibile) {
            fattoriCorrispondenti++;
            dettaglioMatch.push(`Codice ATECO compatibile: ${cliente.codiceATECO}`);
          }
        } else if (!requisitiLower.includes('ateco') && !requisitiLower.includes('codici')) {
          // Se non ci sono riferimenti a codici ATECO nei requisiti, consideriamo compatibile
          fattoriCorrispondenti++;
          dettaglioMatch.push('Nessun requisito specifico sul codice ATECO');
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
      dettaglioMatch.push('Nessun requisito aggiuntivo specificato');
    }
    
    // Calcolo del punteggio finale ponderato
    punteggio = Math.round(
      (punteggioSettori * fattoriDiPeso.settori +
      punteggioRegione * fattoriDiPeso.regione +
      punteggioDimensione * fattoriDiPeso.dimensioneAzienda +
      punteggioFinanziamento * fattoriDiPeso.formeDiFinanziamento +
      punteggioAltriRequisiti * fattoriDiPeso.altriRequisiti) / 100
    );
    
    // Aggiungiamo importi del bando se disponibili (informativo)
    if (bando.importoMin || bando.importoMax) {
      const importoMin = bando.importoMin ? bando.importoMin.toLocaleString('it-IT') + ' €' : 'non specificato';
      const importoMax = bando.importoMax ? bando.importoMax.toLocaleString('it-IT') + ' €' : 'non specificato';
      dettaglioMatch.push(`Importo: min ${importoMin}, max ${importoMax}`);
    }
    
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
