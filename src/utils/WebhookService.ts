
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
      console.log(`URL webhook: ${webhookUrl}`);
      
      // Prepara i dati da inviare
      const payload = {
        action,
        fonte,
        timestamp: new Date().toISOString()
      };
      
      console.log('Payload completo:', JSON.stringify(payload));
      
      // Invia la richiesta al webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors", // Cambiato da no-cors a cors per ricevere una risposta
        body: JSON.stringify(payload),
      });
      
      console.log('Risposta dal webhook:', response);
      
      return true;
    } catch (error) {
      console.error('Errore durante l\'invio al webhook:', error);
      return false;
    }
  }
}

export default WebhookService;
