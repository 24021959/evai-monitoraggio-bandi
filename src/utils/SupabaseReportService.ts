
import { supabase } from '@/integrations/supabase/client';
import { Statistica } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface Report {
  id: string;
  titolo: string;
  descrizione?: string;
  tipo: 'cliente' | 'bando' | 'match' | 'generale';
  dati: any;
  created_at?: string;
  updated_at?: string;
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
  static async saveStatisticsReport(statistica: Statistica): Promise<boolean> {
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
   * Funzione di supporto per validare i tipi di report
   */
  private static validateReportType(tipo: string): 'cliente' | 'bando' | 'match' | 'generale' {
    const validTypes = ['cliente', 'bando', 'match', 'generale'];
    return validTypes.includes(tipo) ? tipo as 'cliente' | 'bando' | 'match' | 'generale' : 'generale';
  }
}

export default SupabaseReportService;
