
import { supabase } from '@/integrations/supabase/client';
import { Bando } from '@/types';
import { FirecrawlService } from './FirecrawlService';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseBandiService {
  /**
   * Recupera tutti i bandi dal database Supabase
   */
  static async getBandi(): Promise<Bando[]> {
    try {
      const { data, error } = await supabase
        .from('bandi')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore nel recupero dei bandi:', error);
        return [];
      }

      // Converte i dati del database nel formato Bando
      return data.map(this.mapDbRowToBando);
    } catch (error) {
      console.error('Errore durante il recupero dei bandi:', error);
      return [];
    }
  }

  /**
   * Salva un bando nel database
   */
  static async saveBando(bando: Bando): Promise<boolean> {
    try {
      // Assicuriamoci che il bando abbia un ID valido (UUID)
      // Se l'ID non è un UUID valido, ne generiamo uno nuovo
      let bandonId = bando.id;
      if (!bandonId || bandonId.includes('imported-')) {
        bandonId = uuidv4();
        console.log(`Generato nuovo UUID per bando importato: ${bandonId}`);
      }

      // Creiamo una copia del bando con l'ID corretto
      const bandoToSave = {
        ...bando,
        id: bandonId
      };

      // Convertiamo il bando nel formato del database
      const dbBando = this.mapBandoToDbRow(bandoToSave);

      const { error } = await supabase
        .from('bandi')
        .upsert(dbBando, { onConflict: 'id' });

      if (error) {
        console.error('Errore nel salvataggio del bando:', error);
        return false;
      }

      console.log('Bando salvato con successo:', bandoToSave.id);
      return true;
    } catch (error) {
      console.error('Errore durante il salvataggio del bando:', error);
      return false;
    }
  }

  /**
   * Elimina un bando dal database
   */
  static async deleteBando(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bandi')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Errore nell\'eliminazione del bando:', error);
        return false;
      }

      console.log('Bando eliminato con successo:', id);
      return true;
    } catch (error) {
      console.error('Errore durante l\'eliminazione del bando:', error);
      return false;
    }
  }

  /**
   * Recupera un bando specifico dal database
   */
  static async getBando(id: string): Promise<Bando | null> {
    try {
      const { data, error } = await supabase
        .from('bandi')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Errore nel recupero del bando:', error);
        return null;
      }

      return this.mapDbRowToBando(data);
    } catch (error) {
      console.error('Errore durante il recupero del bando:', error);
      return null;
    }
  }

  /**
   * Importa i bandi dal FirecrawlService a Supabase
   */
  static async importFromFirecrawl(): Promise<number> {
    try {
      const bandiLocali = FirecrawlService.getSavedBandi();
      
      let contatore = 0;
      
      for (const bando of bandiLocali) {
        const salvato = await this.saveBando(bando);
        if (salvato) {
          contatore++;
        }
      }
      
      return contatore;
    } catch (error) {
      console.error('Errore durante l\'importazione dei bandi da Firecrawl:', error);
      return 0;
    }
  }

  /**
   * Importa i bandi dalla sessionStorage a Supabase
   */
  static async importFromSessionStorage(): Promise<number> {
    try {
      const bandiImportatiString = sessionStorage.getItem('bandiImportati');
      if (!bandiImportatiString) {
        return 0;
      }
      
      const bandiImportati = JSON.parse(bandiImportatiString);
      
      let contatore = 0;
      
      for (const bando of bandiImportati) {
        try {
          // Assicuriamo che ogni bando abbia tutti i campi necessari
          const bandoCompleto = {
            ...bando,
            settori: bando.settori || [],
            fonte: bando.fonte || 'Importato',
            tipo: bando.tipo || 'altro'
          };
          
          const salvato = await this.saveBando(bandoCompleto);
          if (salvato) {
            contatore++;
            console.log(`Bando importato con successo: ${bando.titolo}`);
          } else {
            console.error(`Errore nel salvataggio del bando in Supabase: ${bando.titolo}`);
          }
        } catch (err) {
          console.error(`Errore nell'elaborazione del bando: ${bando.titolo}`, err);
        }
      }
      
      return contatore;
    } catch (error) {
      console.error('Errore durante l\'importazione dei bandi dalla sessionStorage:', error);
      return 0;
    }
  }

  /**
   * Mappa una riga del database nel formato Bando
   */
  private static mapDbRowToBando(row: any): Bando {
    return {
      id: row.id,
      titolo: row.titolo,
      descrizione: row.descrizione,
      descrizioneCompleta: row.descrizione_completa,
      fonte: row.fonte,
      url: row.url,
      tipo: row.tipo,
      settori: row.settori || [],
      importoMin: row.importo_min,
      importoMax: row.importo_max,
      budgetDisponibile: row.budget_disponibile,
      scadenza: row.scadenza,
      scadenzaDettagliata: row.scadenza_dettagliata,
      dataEstrazione: row.data_estrazione,
      requisiti: row.requisiti,
      modalitaPresentazione: row.modalita_presentazione,
      ultimiAggiornamenti: row.ultimi_aggiornamenti
    };
  }

  /**
   * Mappa un Bando in una riga del database
   */
  private static mapBandoToDbRow(bando: Bando): any {
    return {
      id: bando.id,
      titolo: bando.titolo,
      descrizione: bando.descrizione,
      descrizione_completa: bando.descrizioneCompleta,
      fonte: bando.fonte,
      url: bando.url,
      tipo: bando.tipo,
      settori: bando.settori || [],
      importo_min: bando.importoMin,
      importo_max: bando.importoMax,
      budget_disponibile: bando.budgetDisponibile,
      scadenza: bando.scadenza,
      scadenza_dettagliata: bando.scadenzaDettagliata,
      data_estrazione: bando.dataEstrazione,
      requisiti: bando.requisiti,
      modalita_presentazione: bando.modalitaPresentazione,
      ultimi_aggiornamenti: bando.ultimiAggiornamenti
    };
  }
}

export default SupabaseBandiService;
