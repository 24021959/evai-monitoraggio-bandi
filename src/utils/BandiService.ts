
import SupabaseBandiService from './SupabaseBandiService';
import { Bando } from '@/types';

export class BandiService {
  /**
   * Recupera tutti i bandi dal database
   */
  static async getBandi(): Promise<Bando[]> {
    return SupabaseBandiService.getBandiCombinati();
  }

  /**
   * Recupera i bandi per un intervallo di date
   */
  static async getBandiByDateRange(startDate: string, endDate: string): Promise<Bando[]> {
    try {
      const bandi = await SupabaseBandiService.getBandiCombinati();
      
      return bandi.filter(bando => {
        const scadenza = new Date(bando.scadenza);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Imposta le ore a 0 per confrontare solo le date
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        scadenza.setHours(12, 0, 0, 0);
        
        return scadenza >= start && scadenza <= end;
      });
    } catch (error) {
      console.error('Errore nel recupero dei bandi per intervallo di date:', error);
      return [];
    }
  }
}

export default BandiService;
