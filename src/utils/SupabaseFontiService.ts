
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

      console.log('Fonti recuperate da Supabase:', data.length);
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
      // Assicuriamoci che la fonte abbia un ID valido (UUID)
      let fonteId = fonte.id;
      if (!fonteId || fonteId.startsWith('temp-')) {
        fonteId = uuidv4();
        console.log(`Generato nuovo UUID per fonte: ${fonteId}`);
      }

      // Creiamo una copia della fonte con l'ID corretto
      const fonteToSave = {
        ...fonte,
        id: fonteId
      };

      // Convertiamo la fonte nel formato del database
      const dbFonte = this.mapFonteToDbRow(fonteToSave);

      const { error } = await supabase
        .from('fonti')
        .upsert(dbFonte, { onConflict: 'id' });

      if (error) {
        console.error('Errore nel salvataggio della fonte:', error);
        return false;
      }

      console.log('Fonte salvata con successo su Supabase:', fonteToSave.id);
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
      try {
        const salvata = await this.saveFonte(fonte);
        if (salvata) {
          contatore++;
        }
      } catch (error) {
        console.error(`Errore nel salvare la fonte ${fonte.id}:`, error);
      }
    }
    
    console.log(`Salvate ${contatore}/${fonti.length} fonti su Supabase`);
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

      console.log('Fonte eliminata con successo da Supabase:', id);
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
        .maybeSingle();

      if (error) {
        console.error('Errore nel recupero della fonte:', error);
        return null;
      }
      
      if (!data) {
        console.log(`Fonte con ID ${id} non trovata`);
        return null;
      }

      return this.mapDbRowToFonte(data);
    } catch (error) {
      console.error('Errore durante il recupero della fonte:', error);
      return null;
    }
  }

  /**
   * Sincronizza le fonti locali con quelle su Supabase
   */
  static async syncFontiWithSupabase(): Promise<boolean> {
    try {
      // 1. Ottieni le fonti locali e quelle da Supabase
      const fontiLocali = FirecrawlService.getSavedFonti();
      const fontiSupabase = await this.getFonti();
      
      if (fontiSupabase.length > 0) {
        // Se ci sono fonti su Supabase, aggiorniamo quelle locali
        console.log(`Sincronizzando ${fontiSupabase.length} fonti da Supabase a locale`);
        FirecrawlService.saveFonti(fontiSupabase);
        return true;
      } else if (fontiLocali.length > 0) {
        // Se non ci sono fonti su Supabase ma ce ne sono locali, carichiamole su Supabase
        console.log(`Sincronizzando ${fontiLocali.length} fonti da locale a Supabase`);
        const count = await this.saveFonti(fontiLocali);
        return count > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Errore durante la sincronizzazione delle fonti:', error);
      return false;
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
