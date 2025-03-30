
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
      console.log('SupabaseBandiService: Fetching bandi from Supabase');
      const { data, error } = await supabase
        .from('bandi')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore nel recupero dei bandi:', error);
        return [];
      }

      // Converte i dati del database nel formato Bando
      console.log(`SupabaseBandiService: Retrieved ${data.length} bandi from Supabase`);
      return data.map(this.mapDbRowToBando);
    } catch (error) {
      console.error('Errore durante il recupero dei bandi:', error);
      return [];
    }
  }

  /**
   * Recupera tutti i bandi combinati (Supabase + localStorage + sessionStorage) senza duplicati
   * Modificato per evitare la duplicazione continua dei bandi
   */
  static async getBandiCombinati(): Promise<Bando[]> {
    try {
      // 1. Carica bandi da Supabase
      const supaBandi = await this.getBandi();
      console.log(`SupabaseBandiService: Retrieved ${supaBandi.length} bandi from Supabase for combined list`);
      
      // 2. Carica bandi dal localStorage
      const localBandi = FirecrawlService.getSavedBandi();
      console.log(`SupabaseBandiService: Retrieved ${localBandi.length} bandi from localStorage for combined list`);
      
      // 3. Carica bandi importati da sessionStorage
      let importedBandi: Bando[] = [];
      const importedBandiStr = sessionStorage.getItem('bandiImportati');
      if (importedBandiStr) {
        try {
          importedBandi = JSON.parse(importedBandiStr);
          console.log(`SupabaseBandiService: Retrieved ${importedBandi.length} bandi from sessionStorage for combined list`);
        } catch (error) {
          console.error('Error parsing imported bandi:', error);
        }
      }
      
      // 4. Combina tutti i bandi, rimuovendo duplicati basati su ID
      const allBandiMap = new Map<string, Bando>();
      
      // Priorità a Supabase - aggiungiamo tutti i bandi da Supabase
      supaBandi.forEach(bando => {
        allBandiMap.set(bando.id, bando);
      });
      
      // Creiamo un set di chiavi univoche normalizzate basate su titolo+fonte per identificare duplicati
      const titoloFonteSet = new Set(
        supaBandi.map(b => {
          const titoloNormalizzato = b.titolo.trim().toLowerCase().replace(/\s+/g, ' ');
          const fonteNormalizzata = b.fonte.trim().toLowerCase();
          return `${titoloNormalizzato}|${fonteNormalizzata}`;
        })
      );
      
      // Poi localStorage (solo se non già presenti in Supabase)
      for (const bando of localBandi) {
        // Verifichiamo prima se non c'è già un bando con questo ID
        if (!allBandiMap.has(bando.id)) {
          // Verifichiamo anche se non esiste già un bando con lo stesso titolo e fonte normalizzati
          const titoloNormalizzato = bando.titolo.trim().toLowerCase().replace(/\s+/g, ' ');
          const fonteNormalizzata = bando.fonte.trim().toLowerCase();
          const chiave = `${titoloNormalizzato}|${fonteNormalizzata}`;
          
          if (!titoloFonteSet.has(chiave)) {
            // Solo in questo caso lo salviamo in Supabase (una tantum)
            try {
              await this.saveBando(bando);
              console.log(`Bando dal localStorage salvato in Supabase: ${bando.id}`);
              allBandiMap.set(bando.id, bando);
              titoloFonteSet.add(chiave);
            } catch (err) {
              console.error(`Errore nel salvare il bando dal localStorage in Supabase: ${bando.id}`, err);
            }
          }
        }
      }
      
      // Solo la prima volta importiamo i bandi da sessionStorage a Supabase
      // Le volte successive, li mostreremo solo se non esistono già bandi simili
      const bandiImportatiFlag = sessionStorage.getItem('bandiImportatiFlag');
      if (!bandiImportatiFlag && importedBandi.length > 0) {
        for (const bando of importedBandi) {
          const titoloNormalizzato = bando.titolo.trim().toLowerCase().replace(/\s+/g, ' ');
          const fonteNormalizzata = bando.fonte.trim().toLowerCase();
          const chiave = `${titoloNormalizzato}|${fonteNormalizzata}`;
          
          if (!titoloFonteSet.has(chiave)) {
            try {
              // Creiamo un ID valido se non esiste
              if (!bando.id || !this.isValidUUID(bando.id)) {
                bando.id = uuidv4();
              }
              
              await this.saveBando(bando);
              console.log(`Bando da sessionStorage salvato in Supabase: ${bando.id}`);
              allBandiMap.set(bando.id, bando);
              titoloFonteSet.add(chiave);
            } catch (err) {
              console.error(`Errore nel salvare il bando da sessionStorage in Supabase: ${bando.id}`, err);
            }
          }
        }
        
        // Impostiamo il flag per evitare di importare più volte
        sessionStorage.setItem('bandiImportatiFlag', 'true');
      } else {
        console.log('I bandi da sessionStorage sono già stati importati in precedenza.');
      }
      
      const combinedBandi = Array.from(allBandiMap.values());
      console.log(`SupabaseBandiService: Combined unique bandi count: ${combinedBandi.length}`);
      
      return combinedBandi;
    } catch (error) {
      console.error('Errore durante il recupero dei bandi combinati:', error);
      return [];
    }
  }

  /**
   * Salva un bando nel database
   */
  static async saveBando(bando: Bando): Promise<boolean> {
    try {
      // Ensure the bando has a valid UUID ID
      let bandoId = bando.id;
      if (!bandoId || !this.isValidUUID(bandoId)) {
        bandoId = uuidv4();
        console.log(`Generated new UUID for bando: ${bandoId}`);
      }

      // Create a copy of the bando with the correct ID
      const bandoToSave = {
        ...bando,
        id: bandoId
      };

      // Convert bando to database row format
      const dbBando = this.mapBandoToDbRow(bandoToSave);

      // Check if bando already exists in Supabase
      const { data: existingBando } = await supabase
        .from('bandi')
        .select('id')
        .eq('id', bandoId)
        .maybeSingle();

      if (existingBando) {
        console.log(`Bando with ID ${bandoId} already exists in Supabase, updating...`);
      }

      const { error } = await supabase
        .from('bandi')
        .upsert(dbBando, { onConflict: 'id' });

      if (error) {
        console.error('Error saving bando:', error);
        return false;
      }

      console.log('Bando saved successfully to Supabase:', bandoToSave.id);
      return true;
    } catch (error) {
      console.error('Error during bando save:', error);
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

      console.log('Bando eliminato con successo da Supabase:', id);
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
        .maybeSingle();

      if (error) {
        console.error('Errore nel recupero del bando:', error);
        return null;
      }

      if (!data) {
        console.log(`Bando con ID ${id} non trovato in Supabase, cercando in localStorage`);
        // Se il bando non è stato trovato in Supabase, cercalo in localStorage
        const localBandi = FirecrawlService.getSavedBandi();
        const localBando = localBandi.find(b => b.id === id);
        
        if (localBando) {
          console.log(`Bando con ID ${id} trovato in localStorage`);
          return localBando;
        }
        
        // Cerca anche nei bandi importati
        const importedBandiStr = sessionStorage.getItem('bandiImportati');
        if (importedBandiStr) {
          try {
            const importedBandi = JSON.parse(importedBandiStr);
            const importedBando = importedBandi.find((b: Bando) => b.id === id);
            if (importedBando) {
              console.log(`Bando con ID ${id} trovato nei bandi importati`);
              return importedBando;
            }
          } catch (err) {
            console.error('Errore nel parsing dei bandi importati:', err);
          }
        }
        
        console.log(`Bando con ID ${id} non trovato in nessuna fonte`);
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
      
      // Recuperiamo prima i bandi esistenti per evitare duplicazioni
      const bandiEsistenti = await this.getBandi();
      const titoliFonteEsistenti = new Set(
        bandiEsistenti.map(b => {
          // Normalizziamo i testi per confronto più accurato
          const titoloNormalizzato = b.titolo.trim().toLowerCase().replace(/\s+/g, ' ');
          const fonteNormalizzata = b.fonte.trim().toLowerCase(); 
          return `${titoloNormalizzato}|${fonteNormalizzata}`;
        })
      );
      
      let contatore = 0;
      
      for (const bando of bandiImportati) {
        try {
          // Verifichiamo che non esista già un bando con lo stesso titolo e fonte normalizzati
          const titoloNormalizzato = bando.titolo.trim().toLowerCase().replace(/\s+/g, ' ');
          const fonteNormalizzata = bando.fonte.trim().toLowerCase();
          const chiave = `${titoloNormalizzato}|${fonteNormalizzata}`;
          
          if (!titoliFonteEsistenti.has(chiave)) {
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
              titoliFonteEsistenti.add(chiave);
              console.log(`Bando importato e salvato con successo in Supabase: ${bando.titolo}`);
            } else {
              console.error(`Errore nel salvataggio del bando in Supabase: ${bando.titolo}`);
            }
          } else {
            console.log(`Bando "${bando.titolo}" da ${bando.fonte} già presente nel database, saltato.`);
          }
        } catch (err) {
          console.error(`Errore nell'elaborazione del bando: ${bando.titolo}`, err);
        }
      }
      
      // Impostiamo il flag per evitare di importare più volte
      sessionStorage.setItem('bandiImportatiFlag', 'true');
      
      return contatore;
    } catch (error) {
      console.error('Errore durante l\'importazione dei bandi dalla sessionStorage:', error);
      return 0;
    }
  }

  /**
   * Verifica se una stringa è un UUID valido
   */
  private static isValidUUID(uuid: string): boolean {
    const regexExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regexExp.test(uuid);
  }

  /**
   * Mappa una riga del database nel formato Bando
   */
  private static mapDbRowToBando(row: any): Bando {
    return {
      id: row.id,
      titolo: row.titolo,
      descrizione: row.descrizione || '',
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
