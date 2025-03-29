import { supabase } from '@/integrations/supabase/client';
import { Bando } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import SupabaseMatchService from './SupabaseMatchService';

class SupabaseBandiService {
  static async getBandi(): Promise<Bando[]> {
    try {
      const { data, error } = await supabase
        .from('bandi')
        .select('*')
        .order('scadenza', { ascending: true });

      if (error) {
        console.error('Errore nel recupero dei bandi:', error);
        return [];
      }

      return data.map(row => ({
        id: row.id,
        titolo: row.titolo,
        fonte: row.fonte,
        descrizione: row.descrizione || undefined,
        descrizioneCompleta: row.descrizione_completa || undefined,
        tipo: row.tipo,
        settori: row.settori || [],
        scadenza: row.scadenza,
        importoMin: row.importo_min || undefined,
        importoMax: row.importo_max || undefined,
        url: row.url || undefined,
        dataEstrazione: row.data_estrazione || undefined,
        requisiti: row.requisiti || undefined,
        scadenzaDettagliata: row.scadenza_dettagliata || undefined,
        budgetDisponibile: row.budget_disponibile || undefined,
        modalitaPresentazione: row.modalita_presentazione || undefined,
        ultimiAggiornamenti: row.ultimi_aggiornamenti || undefined
      }));
    } catch (error) {
      console.error('Errore durante il recupero dei bandi:', error);
      return [];
    }
  }

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

      return {
        id: data.id,
        titolo: data.titolo,
        fonte: data.fonte,
        descrizione: data.descrizione || undefined,
        descrizioneCompleta: data.descrizione_completa || undefined,
        tipo: data.tipo,
        settori: data.settori || [],
        scadenza: data.scadenza,
        importoMin: data.importo_min || undefined,
        importoMax: data.importo_max || undefined,
        url: data.url || undefined,
        dataEstrazione: data.data_estrazione || undefined,
        requisiti: data.requisiti || undefined,
        scadenzaDettagliata: data.scadenza_dettagliata || undefined,
        budgetDisponibile: data.budget_disponibile || undefined,
        modalitaPresentazione: data.modalita_presentazione || undefined,
        ultimiAggiornamenti: data.ultimi_aggiornamenti || undefined
      };
    } catch (error) {
      console.error('Errore durante il recupero del bando:', error);
      return null;
    }
  }

  static async saveBando(bando: Bando): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bandi')
        .upsert({
          id: bando.id,
          titolo: bando.titolo,
          fonte: bando.fonte,
          descrizione: bando.descrizione || null,
          descrizione_completa: bando.descrizioneCompleta || null,
          tipo: bando.tipo,
          settori: bando.settori || [],
          scadenza: bando.scadenza,
          importo_min: bando.importoMin || null,
          importo_max: bando.importoMax || null,
          url: bando.url || null,
          data_estrazione: bando.dataEstrazione || null,
          requisiti: bando.requisiti || null,
          scadenza_dettagliata: bando.scadenzaDettagliata || null,
          budget_disponibile: bando.budgetDisponibile || null,
          modalita_presentazione: bando.modalitaPresentazione || null,
          ultimi_aggiornamenti: bando.ultimiAggiornamenti || null
        }, { onConflict: 'id' });

      if (error) {
        console.error('Errore nel salvataggio del bando:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Errore durante il salvataggio del bando:', error);
      return false;
    }
  }

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

      return true;
    } catch (error) {
      console.error('Errore durante l\'eliminazione del bando:', error);
      return false;
    }
  }

  static async importBandi(bandi: Bando[]): Promise<{ success: boolean; count: number; matchCount: number }> {
    try {
      let importCount = 0;
      let matchCount = 0;

      // Process each bando
      for (const bando of bandi) {
        // Generate a UUID if not provided
        const bandoId = bando.id || uuidv4();
        
        // Check if bando with the same ID already exists
        const { data: existingBando } = await supabase
          .from('bandi')
          .select('id')
          .eq('id', bandoId)
          .single();
        
        if (existingBando) {
          console.log(`Bando ${bandoId} already exists, skipping...`);
          continue;
        }

        // Format bando for insertion
        const formattedBando = {
          id: bandoId,
          titolo: bando.titolo,
          fonte: bando.fonte,
          descrizione: bando.descrizione || null,
          descrizione_completa: bando.descrizioneCompleta || null,
          tipo: bando.tipo,
          settori: Array.isArray(bando.settori) ? bando.settori : [],
          scadenza: bando.scadenza,
          importo_min: bando.importoMin || null,
          importo_max: bando.importoMax || null,
          url: bando.url || null,
          data_estrazione: new Date().toISOString().split('T')[0],
          requisiti: bando.requisiti || null,
          scadenza_dettagliata: bando.scadenzaDettagliata || null,
          budget_disponibile: bando.budgetDisponibile || null,
          modalita_presentazione: bando.modalitaPresentazione || null,
          ultimi_aggiornamenti: bando.ultimiAggiornamenti || null
        };

        // Insert bando
        const { error } = await supabase
          .from('bandi')
          .insert([formattedBando]);

        if (error) {
          console.error(`Error importing bando ${bandoId}:`, error);
          continue;
        }

        importCount++;
        
        // Generate matches for this new bando
        try {
          const newMatchCount = await SupabaseMatchService.generateMatchesForBando(bando);
          matchCount += newMatchCount;
          console.log(`Generated ${newMatchCount} matches for bando ${bandoId}`);
        } catch (matchError) {
          console.error(`Error generating matches for bando ${bandoId}:`, matchError);
        }
      }

      return { 
        success: true, 
        count: importCount,
        matchCount: matchCount
      };
    } catch (error) {
      console.error('Error during bandi import:', error);
      return { success: false, count: 0, matchCount: 0 };
    }
  }
}

export default SupabaseBandiService;
