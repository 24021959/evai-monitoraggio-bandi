
import { Fonte } from '@/types';

/**
 * Servizio che gestisce le chiamate ai webhook per l'integrazione con n8n o altre piattaforme
 */
export class WebhookService {
  /**
   * Invia una fonte al webhook configurato
   * @param fonte Fonte da inviare
   * @param action Azione da eseguire: 'add', 'update', 'delete'
   */
  static async sendToWebhook(fonte: Fonte, action: 'add' | 'update' | 'delete'): Promise<boolean> {
    try {
      const webhookUrl = localStorage.getItem('n8nWebhookUrl');
      
      if (!webhookUrl) {
        console.error('URL del webhook n8n non configurato');
        return false;
      }
      
      console.log(`Invio dati a webhook n8n (${action}):`, fonte);
      
      // Prepara i dati da inviare
      const payload = {
        action,
        fonte,
        timestamp: new Date().toISOString()
      };
      
      // Invia la richiesta al webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // Necessario per evitare problemi CORS
        body: JSON.stringify(payload),
      });
      
      // Con mode: 'no-cors' non possiamo leggere la risposta
      // Assumiamo che l'operazione sia andata a buon fine
      console.log('Richiesta webhook inviata con successo');
      return true;
    } catch (error) {
      console.error('Errore durante l\'invio al webhook:', error);
      return false;
    }
  }
}

export default WebhookService;
