
import SupabaseClientiService from './SupabaseClientiService';
import { Cliente } from '@/types';

export class ClienteService {
  /**
   * Recupera tutti i clienti dal database
   */
  static async getClienti(): Promise<Cliente[]> {
    return SupabaseClientiService.getClienti();
  }

  /**
   * Recupera un cliente specifico dal database
   */
  static async getCliente(id: string): Promise<Cliente | null> {
    return SupabaseClientiService.getCliente(id);
  }

  /**
   * Salva un cliente nel database
   */
  static async saveCliente(cliente: Cliente): Promise<boolean> {
    return SupabaseClientiService.saveCliente(cliente);
  }

  /**
   * Elimina un cliente dal database
   */
  static async deleteCliente(id: string): Promise<boolean> {
    return SupabaseClientiService.deleteCliente(id);
  }
}

export default ClienteService;
