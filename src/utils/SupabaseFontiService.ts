
import { supabase } from '@/integrations/supabase/client';
import { Fonte } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { FirecrawlService } from './FirecrawlService';

export class SupabaseFontiService {
  /**
   * Recupera tutte le fonti dal database Supabase
   */
  static async getFonti(): Promise<Fonte[]> {
    try {
      const { data, error } = await supabase
        .from('fonti')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore nel recupero delle fonti:', error);
        return [];
      }

      return data.map(this.mapDbRowToFonte);
    } catch (error) {
      console.error('Errore durante il recupero delle fonti:', error);
      return [];
    }
  }

  /**
   * Salva una fonte nel database
   */
  static async saveFonte(fonte: Fonte): Promise<boolean> {
    try {
      // Assicuriamoci che la fonte abbia un ID
      if (!fonte.id) {
        fonte.id = uuidv4();
      }

      // Convertiamo la fonte nel formato del database
      const dbFonte = this.mapFonteToDbRow(fonte);

      const { error } = await supabase
        .from('fonti')
        .upsert(dbFonte, { onConflict: 'id' });

      if (error) {
        console.error('Errore nel salvataggio della fonte:', error);
        return false;
      }

      console.log('Fonte salvata con successo:', fonte.id);
      return true;
    } catch (error) {
      console.error('Errore durante il salvataggio della fonte:', error);
      return false;
    }
  }

  /**
   * Salva più fonti contemporaneamente
   */
  static async saveFonti(fonti: Fonte[]): Promise<number> {
    let contatore = 0;
    
    for (const fonte of fonti) {
      const salvata = await this.saveFonte(fonte);
      if (salvata) {
        contatore++;
      }
    }
    
    return contatore;
  }

  /**
   * Elimina una fonte dal database
   */
  static async deleteFonte(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('fonti')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Errore nell\'eliminazione della fonte:', error);
        return false;
      }

      console.log('Fonte eliminata con successo:', id);
      return true;
    } catch (error) {
      console.error('Errore durante l\'eliminazione della fonte:', error);
      return false;
    }
  }

  /**
   * Recupera una fonte specifica dal database
   */
  static async getFonte(id: string): Promise<Fonte | null> {
    try {
      const { data, error } = await supabase
        .from('fonti')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Errore nel recupero della fonte:', error);
        return null;
      }

      return this.mapDbRowToFonte(data);
    } catch (error) {
      console.error('Errore durante il recupero della fonte:', error);
      return null;
    }
  }

  /**
   * Importa le fonti da FirecrawlService a Supabase
   */
  static async importFromFirecrawl(): Promise<number> {
    try {
      const fontiLocali = FirecrawlService.getSavedFonti();
      return await this.saveFonti(fontiLocali);
    } catch (error) {
      console.error('Errore durante l\'importazione delle fonti da FirecrawlService:', error);
      return 0;
    }
  }

  /**
   * Mappa una riga del database nel formato Fonte
   */
  private static mapDbRowToFonte(row: any): Fonte {
    return {
      id: row.id,
      nome: row.nome,
      url: row.url,
      tipo: row.tipo,
      stato: row.stato
    };
  }

  /**
   * Mappa una Fonte in una riga del database
   */
  private static mapFonteToDbRow(fonte: Fonte): any {
    return {
      id: fonte.id,
      nome: fonte.nome,
      url: fonte.url,
      tipo: fonte.tipo,
      stato: fonte.stato
    };
  }
}

export default SupabaseFontiService;
