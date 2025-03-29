
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
      
      // Prima tenta con modalità cors
      try {
        console.log('Tentativo invio con mode: cors');
        const corsResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
          body: JSON.stringify(payload),
        });
        
        console.log('Risposta dal webhook (cors):', corsResponse);
        if (corsResponse.ok) {
          console.log('Risposta positiva ricevuta');
          return true;
        } else {
          console.log('Risposta negativa ricevuta:', corsResponse.status, corsResponse.statusText);
          // Se la risposta non è ok, continua con il fallback
        }
      } catch (corsError) {
        console.log('Errore CORS, tentativo fallback:', corsError);
        // Continua con il fallback no-cors
      }
      
      // Fallback con no-cors se cors fallisce
      console.log('Tentativo invio con mode: no-cors (fallback)');
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", 
        body: JSON.stringify(payload),
      });
      
      console.log('Richiesta no-cors inviata (non possiamo verificare la risposta)');
      
      // Con no-cors non possiamo verificare la risposta, quindi assumiamo successo
      // ma informiamo l'utente che dovrebbe verificare su n8n
      return true;
    } catch (error) {
      console.error('Errore durante l\'invio al webhook:', error);
      throw error; // Rilanciamo l'errore per gestirlo a livello superiore
    }
  }
}

export default WebhookService;
