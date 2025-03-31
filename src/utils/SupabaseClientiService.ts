
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseClientiService {
  /**
   * Recupera tutti i clienti dal database Supabase
   */
  static async getClienti(): Promise<Cliente[]> {
    try {
      const { data, error } = await supabase
        .from('clienti')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        console.error('Errore nel recupero dei clienti:', error);
        return [];
      }

      return data.map(this.mapDbRowToCliente);
    } catch (error) {
      console.error('Errore durante il recupero dei clienti:', error);
      return [];
    }
  }

  /**
   * Salva un cliente nel database
   */
  static async saveCliente(cliente: Cliente): Promise<boolean> {
    try {
      // Assicuriamoci che il cliente abbia un ID
      if (!cliente.id) {
        cliente.id = uuidv4();
      }

      // Convertiamo il cliente nel formato del database
      const dbCliente = this.mapClienteToDbRow(cliente);

      const { error } = await supabase
        .from('clienti')
        .upsert(dbCliente, { onConflict: 'id' });

      if (error) {
        console.error('Errore nel salvataggio del cliente:', error);
        return false;
      }

      console.log('Cliente salvato con successo:', cliente.id);
      return true;
    } catch (error) {
      console.error('Errore durante il salvataggio del cliente:', error);
      return false;
    }
  }

  /**
   * Elimina un cliente dal database
   */
  static async deleteCliente(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clienti')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Errore nell\'eliminazione del cliente:', error);
        return false;
      }

      console.log('Cliente eliminato con successo:', id);
      return true;
    } catch (error) {
      console.error('Errore durante l\'eliminazione del cliente:', error);
      return false;
    }
  }

  /**
   * Recupera un cliente specifico dal database
   */
  static async getCliente(id: string): Promise<Cliente | null> {
    try {
      const { data, error } = await supabase
        .from('clienti')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Errore nel recupero del cliente:', error);
        return null;
      }

      return this.mapDbRowToCliente(data);
    } catch (error) {
      console.error('Errore durante il recupero del cliente:', error);
      return null;
    }
  }

  /**
   * Mappa una riga del database nel formato Cliente
   */
  private static mapDbRowToCliente(row: any): Cliente {
    return {
      id: row.id,
      nome: row.nome,
      settore: row.settore,
      regione: row.regione,
      provincia: row.provincia,
      fatturato: row.fatturato,
      interessiSettoriali: row.interessisettoriali || [],
      dipendenti: row.dipendenti,
      email: row.email,
      telefono: row.telefono,
      annoFondazione: row.annofondazione,
      formaGiuridica: row.formagiuridica,
      codiceATECO: row.codiceateco,
      esperienzaFinanziamenti: row.esperienzafinanziamenti,
      tecnologieSpecifiche: row.tecnologiespecifiche || [],
      criteriESG: row.criteriESG || [],
      capacitaRD: row.capacitaRD,
      presenzaInternazionale: row.presenzainternazionale,
      faseDiCrescita: row.fasedicrescita,
      stabilitaFinanziaria: row.stabilitafinanziaria,
      competenzeDipendenti: row.competenzedipendenti || [],
      partnership: row.partnership || [],
      certificazioni: row.certificazioni || [],
      interessi: row.interessi || [],
      userId: row.userId || ''
    };
  }

  /**
   * Mappa un Cliente in una riga del database
   */
  private static mapClienteToDbRow(cliente: Cliente): any {
    return {
      id: cliente.id,
      nome: cliente.nome,
      settore: cliente.settore,
      regione: cliente.regione,
      provincia: cliente.provincia,
      fatturato: cliente.fatturato,
      interessisettoriali: cliente.interessiSettoriali || [],
      dipendenti: cliente.dipendenti,
      email: cliente.email,
      telefono: cliente.telefono,
      annofondazione: cliente.annoFondazione,
      formagiuridica: cliente.formaGiuridica,
      codiceateco: cliente.codiceATECO,
      esperienzafinanziamenti: cliente.esperienzaFinanziamenti,
      tecnologiespecifiche: cliente.tecnologieSpecifiche || [],
      criteriESG: cliente.criteriESG || [],
      capacitaRD: cliente.capacitaRD,
      presenzainternazionale: cliente.presenzaInternazionale,
      fasedicrescita: cliente.faseDiCrescita,
      stabilitafinanziaria: cliente.stabilitaFinanziaria,
      competenzedipendenti: cliente.competenzeDipendenti || [],
      partnership: cliente.partnership || [],
      certificazioni: cliente.certificazioni || [],
      interessi: cliente.interessi || [],
      userId: cliente.userId || ''
    };
  }

  /**
   * Mappa una riga del database nel formato Cliente
   */
  mapData(data: any): Cliente {
    return {
      id: data.id,
      nome: data.nome,
      settore: data.settore,
      regione: data.regione,
      provincia: data.provincia,
      fatturato: data.fatturato,
      interessiSettoriali: data.interessisettoriali || data.interessiSettoriali || [],
      dipendenti: data.dipendenti,
      email: data.email,
      telefono: data.telefono,
      annoFondazione: data.annofondazione || data.annoFondazione,
      formaGiuridica: data.formagiuridica || data.formaGiuridica,
      codiceATECO: data.codiceateco || data.codiceATECO,
      esperienzaFinanziamenti: data.esperienzaFinanziamenti || '',
      tecnologieSpecifiche: data.tecnologieSpecifiche || [],
      criteriESG: data.criteriESG || [],
      capacitaRD: data.capacitaRD || '',
      presenzaInternazionale: data.presenzaInternazionale || '',
      faseDiCrescita: data.faseDiCrescita || '',
      stabilitaFinanziaria: data.stabilitaFinanziaria || '',
      competenzeDipendenti: data.competenzeDipendenti || [],
      partnership: data.partnership || [],
      certificazioni: data.certificazioni || [],
      interessi: data.interessi || [],
      userId: data.userId || ''
    };
  }
}

export default SupabaseClientiService;
