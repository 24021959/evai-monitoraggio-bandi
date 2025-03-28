
import { Cliente, Bando } from '@/types';
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

export class MatchService {
  
  /**
   * Calcola il punteggio di match tra un cliente e un bando
   */
  static calculateMatchScore(cliente: Cliente, bando: Bando): number {
    let score = 0;
    let totalFactors = 0;
    
    // Match per settore
    if (cliente.settore && bando.settori && Array.isArray(bando.settori)) {
      const settoreLowerCase = cliente.settore.toLowerCase();
      // Verifica se uno dei settori del bando corrisponde al settore del cliente
      const sectorMatch = bando.settori.some(
        settore => settore.toLowerCase().includes(settoreLowerCase) || 
                  settoreLowerCase.includes(settore.toLowerCase())
      );
      
      // Se c'è corrispondenza di settore, aggiungi punti
      if (sectorMatch) {
        score += 40;
      } else if (cliente.interessiSettoriali && cliente.interessiSettoriali.length > 0) {
        // Controlla anche gli interessi settoriali se non c'è match diretto
        const interestMatch = cliente.interessiSettoriali.some(interesse => 
          bando.settori.some(s => s.toLowerCase().includes(interesse.toLowerCase()) || 
                          interesse.toLowerCase().includes(s.toLowerCase()))
        );
        if (interestMatch) {
          score += 25; // Punteggio inferiore rispetto al match diretto
        }
      }
      totalFactors += 40;
    }
    
    // Match per regione/localizzazione
    if (cliente.regione && bando.tipo) {
      if (bando.tipo === 'regionale' && bando.requisiti) {
        // Per bandi regionali, verifica se la regione del cliente è menzionata nei requisiti
        if (bando.requisiti.toLowerCase().includes(cliente.regione.toLowerCase())) {
          score += 30;
        } else {
          score -= 20; // Penalizzazione per mancata corrispondenza regionale
        }
      } else if (bando.tipo === 'statale' || bando.tipo === 'europeo') {
        // Bandi statali o europei non hanno restrizioni regionali
        score += 20;
      }
      totalFactors += 30;
    }
    
    // Match per dimensione aziendale (stimata da fatturato e dipendenti)
    if (cliente.fatturato && cliente.dipendenti && bando.requisiti) {
      const requisiti = bando.requisiti.toLowerCase();
      let dimensioneStimata = '';
      
      // Stima della dimensione aziendale
      if (cliente.fatturato < 2000000 || cliente.dipendenti < 10) {
        dimensioneStimata = 'piccola';
      } else if (cliente.fatturato < 10000000 || cliente.dipendenti < 50) {
        dimensioneStimata = 'media';
      } else {
        dimensioneStimata = 'grande';
      }
      
      // Verifica se i requisiti del bando menzionano la dimensione aziendale
      if (
        (dimensioneStimata === 'piccola' && (requisiti.includes('piccol') || requisiti.includes('pmi'))) ||
        (dimensioneStimata === 'media' && (requisiti.includes('medi') || requisiti.includes('pmi'))) ||
        (dimensioneStimata === 'grande' && requisiti.includes('grand'))
      ) {
        score += 20;
      }
      totalFactors += 20;
    }
    
    // Match per importo del bando rispetto alla dimensione aziendale
    if (cliente.fatturato && bando.importoMax) {
      const fatturatoNumerico = typeof cliente.fatturato === 'string' 
        ? parseFloat(cliente.fatturato.replace(/[^0-9.]/g, ''))
        : cliente.fatturato;
      
      // Definisci soglie di rilevanza economica in base al fatturato
      let rilevanzaEconomica = false;
      
      if (fatturatoNumerico < 2000000 && bando.importoMax > 50000) {
        rilevanzaEconomica = true;
      } else if (fatturatoNumerico >= 2000000 && fatturatoNumerico < 10000000 && bando.importoMax > 100000) {
        rilevanzaEconomica = true;
      } else if (fatturatoNumerico >= 10000000 && bando.importoMax > 500000) {
        rilevanzaEconomica = true;
      }
      
      if (rilevanzaEconomica) {
        score += 10;
      }
      totalFactors += 10;
    }
    
    // Calcola il punteggio percentuale
    const finalScore = Math.round((score / totalFactors) * 100);
    
    // Limita il punteggio tra 0 e 100
    return Math.max(0, Math.min(100, finalScore));
  }
  
  /**
   * Genera match tra clienti e bandi
   */
  static generateMatches(clienti: Cliente[], bandi: Bando[]): MatchResult[] {
    const today = new Date().toISOString().split('T')[0];
    const matches: MatchResult[] = [];
    
    for (const cliente of clienti) {
      for (const bando of bandi) {
        const matchScore = this.calculateMatchScore(cliente, bando);
        
        // Considera solo match con punteggio superiore al 60%
        if (matchScore >= 60) {
          matches.push({
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
            punteggio: matchScore,
            dataMatch: today
          });
        }
      }
    }
    
    // Ordina per punteggio decrescente
    return matches.sort((a, b) => b.punteggio - a.punteggio);
  }
  
  /**
   * Esporta i match in formato CSV
   */
  static exportMatchesToCSV(matches: MatchResult[]): string {
    // Intestazioni CSV
    const headers = [
      'ID Match',
      'Cliente ID', 
      'Cliente Nome', 
      'Cliente Settore',
      'Bando ID',
      'Bando Titolo',
      'Bando Fonte',
      'Bando Scadenza',
      'Punteggio Match (%)',
      'Data Match'
    ];
    
    // Righe dati
    const rows = matches.map(match => [
      match.id,
      match.cliente.id,
      `"${match.cliente.nome.replace(/"/g, '""')}"`, // Evita problemi con virgolette nei nomi
      `"${match.cliente.settore.replace(/"/g, '""')}"`,
      match.bando.id,
      `"${match.bando.titolo.replace(/"/g, '""')}"`,
      `"${match.bando.fonte.replace(/"/g, '""')}"`,
      match.bando.scadenza,
      match.punteggio,
      match.dataMatch
    ]);
    
    // Combina intestazioni e righe
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }
  
  /**
   * Avvia il download di un file CSV
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
