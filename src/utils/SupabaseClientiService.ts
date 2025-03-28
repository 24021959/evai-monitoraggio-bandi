
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
      codiceATECO: row.codiceateco
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
      codiceateco: cliente.codiceATECO
    };
  }
}

export default SupabaseClientiService;
