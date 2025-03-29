
import { supabase } from '@/integrations/supabase/client';
import { Statistica } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { formatISO } from 'date-fns';

interface Report {
  id: string;
  titolo: string;
  descrizione?: string;
  tipo: 'cliente' | 'bando' | 'match' | 'generale';
  dati: any;
  created_at?: string;
  updated_at?: string;
}

interface ReportAnalisiTemporale {
  periodo: string;
  bandiCreati: number;
  clientiCreati: number;
  matchCreati: number;
}

interface ReportAnalisiSettoriale {
  settore: string;
  numeroBandi: number;
  numeroClienti: number;
  numeroMatch: number;
}

interface ReportAnalisiGeografica {
  regione: string;
  numeroBandi: number;
  numeroClienti: number;
  percentuale: number;
}

interface ReportPerformanceMatch {
  cliente: string;
  settore: string;
  numBandiCompatibili: number;
  compatibilitaMedia: number;
}

interface ReportAvanzato extends Statistica {
  analisiTemporale: ReportAnalisiTemporale[];
  analisiSettoriale: ReportAnalisiSettoriale[];
  analisiGeografica: ReportAnalisiGeografica[];
  performanceMatch: ReportPerformanceMatch[];
  dataGenerazione: string;
}

export class SupabaseReportService {
  /**
   * Recupera tutti i report dal database Supabase
   */
  static async getReports(): Promise<Report[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore nel recupero dei report:', error);
        return [];
      }

      // Assicuriamoci che i tipi siano corretti
      return data.map(row => ({
        ...row,
        tipo: this.validateReportType(row.tipo)
      })) as Report[];
    } catch (error) {
      console.error('Errore durante il recupero dei report:', error);
      return [];
    }
  }

  /**
   * Salva un report di statistiche nel database
   */
  static async saveStatisticsReport(statistica: Statistica | ReportAvanzato): Promise<boolean> {
    try {
      const report: Report = {
        id: uuidv4(),
        titolo: `Report statistiche del ${new Date().toLocaleDateString('it-IT')}`,
        descrizione: 'Report automatico delle statistiche del sistema',
        tipo: 'generale',
        dati: statistica
      };

      const { error } = await supabase
        .from('reports')
        .insert(report);

      if (error) {
        console.error('Errore nel salvataggio del report:', error);
        return false;
      }

      console.log('Report salvato con successo:', report.id);
      return true;
    } catch (error) {
      console.error('Errore durante il salvataggio del report:', error);
      return false;
    }
  }

  /**
   * Elimina un report dal database
   */
  static async deleteReport(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Errore nell\'eliminazione del report:', error);
        return false;
      }

      console.log('Report eliminato con successo:', id);
      return true;
    } catch (error) {
      console.error('Errore durante l\'eliminazione del report:', error);
      return false;
    }
  }

  /**
   * Recupera un report specifico dal database
   */
  static async getReport(id: string): Promise<Report | null> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Errore nel recupero del report:', error);
        return null;
      }

      // Assicuriamoci che il tipo sia corretto
      return {
        ...data,
        tipo: this.validateReportType(data.tipo)
      } as Report;
    } catch (error) {
      console.error('Errore durante il recupero del report:', error);
      return null;
    }
  }

  /**
   * Recupera gli ultimi report per tipo
   */
  static async getLatestReportByType(tipo: 'cliente' | 'bando' | 'match' | 'generale'): Promise<Report | null> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('tipo', tipo)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error(`Errore nel recupero dell'ultimo report di tipo ${tipo}:`, error);
        return null;
      }

      // Assicuriamoci che il tipo sia corretto
      return {
        ...data,
        tipo: this.validateReportType(data.tipo)
      } as Report;
    } catch (error) {
      console.error(`Errore durante il recupero dell'ultimo report di tipo ${tipo}:`, error);
      return null;
    }
  }

  /**
   * Genera un report avanzato con tutte le analisi
   */
  static async generateAdvancedReport(startDate?: Date, endDate?: Date): Promise<ReportAvanzato | null> {
    try {
      console.log('Generazione report avanzato...');
      
      // Otteniamo tutti i dati necessari per le analisi
      const { data: bandiData, error: bandiError } = await supabase
        .from('bandi')
        .select('*');
      
      if (bandiError) {
        console.error('Errore nel recupero dei bandi:', bandiError);
        return null;
      }
      
      const { data: clientiData, error: clientiError } = await supabase
        .from('clienti')
        .select('*');
      
      if (clientiError) {
        console.error('Errore nel recupero dei clienti:', clientiError);
        return null;
      }
      
      const { data: matchData, error: matchError } = await supabase
        .from('match')
        .select('*');
      
      if (matchError) {
        console.error('Errore nel recupero dei match:', matchError);
        return null;
      }

      // Filtrare per date se specificate
      const filteredBandi = startDate && endDate 
        ? bandiData.filter(b => {
            const createdAt = new Date(b.created_at);
            return createdAt >= startDate && createdAt <= endDate;
          })
        : bandiData;
      
      const filteredClienti = startDate && endDate 
        ? clientiData.filter(c => {
            const createdAt = new Date(c.created_at);
            return createdAt >= startDate && createdAt <= endDate;
          })
        : clientiData;
      
      const filteredMatch = startDate && endDate 
        ? matchData.filter(m => {
            const createdAt = new Date(m.created_at);
            return createdAt >= startDate && createdAt <= endDate;
          })
        : matchData;

      // Calcola la statistica base
      const statistica: Statistica = {
        bandiAttivi: filteredBandi.length,
        numeroClienti: filteredClienti.length,
        matchRecenti: filteredMatch.length,
        distribuzioneBandi: {
          europei: filteredBandi.filter(b => b.tipo === 'europeo').length,
          statali: filteredBandi.filter(b => b.tipo === 'statale').length,
          regionali: filteredBandi.filter(b => b.tipo === 'regionale').length,
        },
        bandoPerSettore: this.calcolaBandiPerSettore(filteredBandi),
        matchPerCliente: this.calcolaMatchPerCliente(filteredMatch, filteredClienti),
      };

      // Crea le analisi temporali (ultimi 6 mesi)
      const analisiTemporale = this.generaAnalisiTemporale(filteredBandi, filteredClienti, filteredMatch);
      
      // Crea le analisi settoriali
      const analisiSettoriale = this.generaAnalisiSettoriale(filteredBandi, filteredClienti, filteredMatch);
      
      // Crea le analisi geografiche
      const analisiGeografica = this.generaAnalisiGeografica(filteredBandi, filteredClienti);
      
      // Crea le performance dei match per cliente
      const performanceMatch = this.generaPerformanceMatch(filteredMatch, filteredClienti);

      // Compone il report avanzato
      const reportAvanzato: ReportAvanzato = {
        ...statistica,
        analisiTemporale,
        analisiSettoriale,
        analisiGeografica,
        performanceMatch,
        dataGenerazione: formatISO(new Date())
      };

      return reportAvanzato;
    } catch (error) {
      console.error('Errore durante la generazione del report avanzato:', error);
      return null;
    }
  }

  /**
   * Esporta un report in formato CSV
   */
  static exportReportToCSV(reportData: ReportAvanzato): string {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Statistiche generali
      csvContent += "Statistiche Generali\n";
      csvContent += `Bandi Attivi,${reportData.bandiAttivi}\n`;
      csvContent += `Numero Clienti,${reportData.numeroClienti}\n`;
      csvContent += `Match Recenti,${reportData.matchRecenti}\n\n`;
      
      // Distribuzione bandi
      csvContent += "Distribuzione Bandi\n";
      csvContent += `Tipo,Numero\n`;
      csvContent += `Europei,${reportData.distribuzioneBandi.europei}\n`;
      csvContent += `Statali,${reportData.distribuzioneBandi.statali}\n`;
      csvContent += `Regionali,${reportData.distribuzioneBandi.regionali}\n\n`;
      
      // Bandi per settore
      csvContent += "Bandi per Settore\n";
      csvContent += `Settore,Percentuale\n`;
      reportData.bandoPerSettore.forEach(item => {
        csvContent += `"${item.settore}",${item.percentuale}\n`;
      });
      csvContent += "\n";
      
      // Match per cliente
      csvContent += "Match per Cliente\n";
      csvContent += `Cliente,Percentuale\n`;
      reportData.matchPerCliente.forEach(item => {
        csvContent += `"${item.cliente}",${item.percentuale}\n`;
      });
      csvContent += "\n";
      
      // Analisi temporale
      csvContent += "Analisi Temporale\n";
      csvContent += `Periodo,Bandi Creati,Clienti Creati,Match Creati\n`;
      reportData.analisiTemporale.forEach(item => {
        csvContent += `"${item.periodo}",${item.bandiCreati},${item.clientiCreati},${item.matchCreati}\n`;
      });
      csvContent += "\n";
      
      // Analisi settoriale
      csvContent += "Analisi Settoriale\n";
      csvContent += `Settore,Numero Bandi,Numero Clienti,Numero Match\n`;
      reportData.analisiSettoriale.forEach(item => {
        csvContent += `"${item.settore}",${item.numeroBandi},${item.numeroClienti},${item.numeroMatch}\n`;
      });
      csvContent += "\n";
      
      // Analisi geografica
      csvContent += "Analisi Geografica\n";
      csvContent += `Regione,Numero Bandi,Numero Clienti,Percentuale\n`;
      reportData.analisiGeografica.forEach(item => {
        csvContent += `"${item.regione}",${item.numeroBandi},${item.numeroClienti},${item.percentuale}\n`;
      });
      csvContent += "\n";
      
      // Performance match
      csvContent += "Performance Match\n";
      csvContent += `Cliente,Settore,Bandi Compatibili,Compatibilità Media\n`;
      reportData.performanceMatch.forEach(item => {
        csvContent += `"${item.cliente}","${item.settore}",${item.numBandiCompatibili},${item.compatibilitaMedia}\n`;
      });
      
      return csvContent;
    } catch (error) {
      console.error('Errore durante l\'esportazione del report in CSV:', error);
      return "Errore nell'esportazione";
    }
  }

  /**
   * Exporta un report in formato JSON
   */
  static exportReportToJSON(reportData: ReportAvanzato): string {
    try {
      return JSON.stringify(reportData, null, 2);
    } catch (error) {
      console.error('Errore durante l\'esportazione del report in JSON:', error);
      return "{}";
    }
  }

  /**
   * Funzione di supporto per calcolare i bandi per settore
   */
  private static calcolaBandiPerSettore(bandi: any[]): { settore: string, percentuale: number }[] {
    // Estrai tutti i settori dai bandi
    const settoriCount: Record<string, number> = {};
    let totalSettori = 0;
    
    bandi.forEach(bando => {
      if (bando.settori && Array.isArray(bando.settori)) {
        bando.settori.forEach((settore: string) => {
          settoriCount[settore] = (settoriCount[settore] || 0) + 1;
          totalSettori++;
        });
      }
    });
    
    // Converti in array con percentuali
    return Object.entries(settoriCount)
      .map(([settore, count]) => ({
        settore,
        percentuale: Math.round((count / Math.max(totalSettori, 1)) * 100)
      }))
      .sort((a, b) => b.percentuale - a.percentuale)
      .slice(0, 10); // Prendi i primi 10 settori
  }

  /**
   * Funzione di supporto per calcolare i match per cliente
   */
  private static calcolaMatchPerCliente(matches: any[], clienti: any[]): { cliente: string, percentuale: number }[] {
    const clientiMap = new Map();
    clienti.forEach(cliente => {
      clientiMap.set(cliente.id, cliente.nome);
    });
    
    const matchPerCliente: Record<string, number> = {};
    matches.forEach(match => {
      const clienteId = match.clienteid;
      const clienteNome = clientiMap.get(clienteId) || 'Cliente sconosciuto';
      matchPerCliente[clienteNome] = (matchPerCliente[clienteNome] || 0) + 1;
    });
    
    const totalMatches = matches.length;
    
    return Object.entries(matchPerCliente)
      .map(([cliente, count]) => ({
        cliente,
        percentuale: Math.round((count / Math.max(totalMatches, 1)) * 100)
      }))
      .sort((a, b) => b.percentuale - a.percentuale)
      .slice(0, 10); // Prendi i primi 10 clienti
  }

  /**
   * Genera analisi temporale per gli ultimi 6 mesi
   */
  private static generaAnalisiTemporale(bandi: any[], clienti: any[], matches: any[]): ReportAnalisiTemporale[] {
    const result: ReportAnalisiTemporale[] = [];
    const now = new Date();
    
    // Genera gli ultimi 6 mesi
    for (let i = 5; i >= 0; i--) {
      const dataInizio = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dataFine = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const bandiCreati = bandi.filter(b => {
        const createdAt = new Date(b.created_at);
        return createdAt >= dataInizio && createdAt <= dataFine;
      }).length;
      
      const clientiCreati = clienti.filter(c => {
        const createdAt = new Date(c.created_at);
        return createdAt >= dataInizio && createdAt <= dataFine;
      }).length;
      
      const matchCreati = matches.filter(m => {
        const createdAt = new Date(m.created_at);
        return createdAt >= dataInizio && createdAt <= dataFine;
      }).length;
      
      const nomeMese = dataInizio.toLocaleString('it-IT', { month: 'long' });
      const anno = dataInizio.getFullYear();
      
      result.push({
        periodo: `${nomeMese} ${anno}`,
        bandiCreati,
        clientiCreati,
        matchCreati
      });
    }
    
    return result;
  }

  /**
   * Genera analisi settoriale
   */
  private static generaAnalisiSettoriale(bandi: any[], clienti: any[], matches: any[]): ReportAnalisiSettoriale[] {
    const settoriMap = new Map<string, { numeroBandi: number, numeroClienti: number, numeroMatch: number }>();
    
    // Raccoglie i settori dai bandi
    bandi.forEach(bando => {
      if (bando.settori && Array.isArray(bando.settori)) {
        bando.settori.forEach((settore: string) => {
          if (!settoriMap.has(settore)) {
            settoriMap.set(settore, { numeroBandi: 0, numeroClienti: 0, numeroMatch: 0 });
          }
          const data = settoriMap.get(settore)!;
          data.numeroBandi += 1;
        });
      }
    });
    
    // Raccoglie i settori dai clienti
    clienti.forEach(cliente => {
      if (cliente.interessisettoriali && Array.isArray(cliente.interessisettoriali)) {
        cliente.interessisettoriali.forEach((settore: string) => {
          if (!settoriMap.has(settore)) {
            settoriMap.set(settore, { numeroBandi: 0, numeroClienti: 0, numeroMatch: 0 });
          }
          const data = settoriMap.get(settore)!;
          data.numeroClienti += 1;
        });
      } else if (cliente.settore) {
        const settore = cliente.settore;
        if (!settoriMap.has(settore)) {
          settoriMap.set(settore, { numeroBandi: 0, numeroClienti: 0, numeroMatch: 0 });
        }
        const data = settoriMap.get(settore)!;
        data.numeroClienti += 1;
      }
    });
    
    // Calcola numeri match per settore (semplificazione usando settore cliente)
    const clienteSettoreMap = new Map<string, string>();
    clienti.forEach(cliente => {
      clienteSettoreMap.set(cliente.id, cliente.settore || 'Altro');
    });
    
    matches.forEach(match => {
      const clienteId = match.clienteid;
      const settore = clienteSettoreMap.get(clienteId) || 'Altro';
      
      if (!settoriMap.has(settore)) {
        settoriMap.set(settore, { numeroBandi: 0, numeroClienti: 0, numeroMatch: 0 });
      }
      const data = settoriMap.get(settore)!;
      data.numeroMatch += 1;
    });
    
    // Converti la mappa in array
    return Array.from(settoriMap.entries())
      .map(([settore, data]) => ({
        settore,
        ...data
      }))
      .filter(item => item.numeroBandi > 0 || item.numeroClienti > 0)
      .sort((a, b) => (b.numeroBandi + b.numeroClienti) - (a.numeroBandi + a.numeroClienti))
      .slice(0, 10); // Prendi i primi 10 settori
  }

  /**
   * Genera analisi geografica
   */
  private static generaAnalisiGeografica(bandi: any[], clienti: any[]): ReportAnalisiGeografica[] {
    const regioniMap = new Map<string, { numeroBandi: number, numeroClienti: number }>();
    
    // Conta regioni dai clienti
    clienti.forEach(cliente => {
      if (cliente.regione) {
        const regione = cliente.regione;
        if (!regioniMap.has(regione)) {
          regioniMap.set(regione, { numeroBandi: 0, numeroClienti: 0 });
        }
        const data = regioniMap.get(regione)!;
        data.numeroClienti += 1;
      }
    });
    
    // Semplice approssimazione per bandi regionali (assumendo che il nome contenga la regione)
    bandi.forEach(bando => {
      if (bando.tipo === 'regionale' && bando.titolo) {
        const regioniItaliane = [
          'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 
          'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche', 
          'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana', 
          'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
        ];
        
        for (const regione of regioniItaliane) {
          if (bando.titolo.includes(regione) || (bando.descrizione && bando.descrizione.includes(regione))) {
            if (!regioniMap.has(regione)) {
              regioniMap.set(regione, { numeroBandi: 0, numeroClienti: 0 });
            }
            const data = regioniMap.get(regione)!;
            data.numeroBandi += 1;
            break;
          }
        }
      }
    });
    
    // Calcola il totale di clienti
    const totaleClienti = clienti.length;
    
    // Converti la mappa in array con percentuali
    return Array.from(regioniMap.entries())
      .map(([regione, data]) => ({
        regione,
        ...data,
        percentuale: Math.round((data.numeroClienti / Math.max(totaleClienti, 1)) * 100)
      }))
      .sort((a, b) => b.numeroClienti - a.numeroClienti);
  }

  /**
   * Genera performance dei match
   */
  private static generaPerformanceMatch(matches: any[], clienti: any[]): ReportPerformanceMatch[] {
    const clienteMatchMap = new Map<string, { totalScore: number, count: number, nome: string, settore: string }>();
    
    // Estrai i dati su clienti
    const clienteInfoMap = new Map<string, { nome: string, settore: string }>();
    clienti.forEach(cliente => {
      clienteInfoMap.set(cliente.id, { 
        nome: cliente.nome || 'Cliente sconosciuto',
        settore: cliente.settore || 'Altro'
      });
    });
    
    // Calcola punteggi per match
    matches.forEach(match => {
      const clienteId = match.clienteid;
      if (!clienteMatchMap.has(clienteId)) {
        const clienteInfo = clienteInfoMap.get(clienteId) || { nome: 'Cliente sconosciuto', settore: 'Altro' };
        clienteMatchMap.set(clienteId, { 
          totalScore: 0, 
          count: 0, 
          nome: clienteInfo.nome,
          settore: clienteInfo.settore
        });
      }
      
      const data = clienteMatchMap.get(clienteId)!;
      data.totalScore += match.compatibilita || 0;
      data.count += 1;
    });
    
    // Converti in array con medie
    return Array.from(clienteMatchMap.entries())
      .map(([_, data]) => ({
        cliente: data.nome,
        settore: data.settore,
        numBandiCompatibili: data.count,
        compatibilitaMedia: Math.round(data.totalScore / Math.max(data.count, 1))
      }))
      .sort((a, b) => b.compatibilitaMedia - a.compatibilitaMedia)
      .slice(0, 10); // Prendi i primi 10 clienti
  }

  /**
   * Funzione di supporto per validare i tipi di report
   */
  private static validateReportType(tipo: string): 'cliente' | 'bando' | 'match' | 'generale' {
    const validTypes = ['cliente', 'bando', 'match', 'generale'];
    return validTypes.includes(tipo) ? tipo as 'cliente' | 'bando' | 'match' | 'generale' : 'generale';
  }
}

export default SupabaseReportService;
