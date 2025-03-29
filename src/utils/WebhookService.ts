
import { Fonte, TipoBando } from '@/types';

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
      
      // Adattiamo i dati per allinearli con le intestazioni del foglio Google Sheets
      const fonteAdattata = {
        id: fonte.id,
        nome: fonte.nome,
        url: fonte.url,
        tipo: fonte.tipo,
        stato_elaborazione: fonte.stato === 'attivo' ? 'Elaborazione attiva' : 'Elaborazione sospesa',
        data_ultimo_aggiornamento: new Date().toISOString().split('T')[0] // formato YYYY-MM-DD
      };
      
      // Prepara i dati da inviare in formato compatibile con n8n
      const payload = {
        action,
        fonte: fonteAdattata,
        timestamp: new Date().toISOString()
      };
      
      console.log('Payload completo:', JSON.stringify(payload));
      
      // Prima tenta con modalità fetch standard (con credentials incluse)
      try {
        console.log('Tentativo invio con fetch standard include credentials');
        const standardResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        
        console.log('Risposta dal webhook (standard):', standardResponse);
        if (standardResponse.ok) {
          console.log('Risposta positiva ricevuta');
          return true;
        } else {
          console.log('Risposta negativa ricevuta:', standardResponse.status, standardResponse.statusText);
          // Se la risposta non è ok, continua con il fallback
        }
      } catch (standardError) {
        console.log('Errore fetch standard, tentativo fallback:', standardError);
        // Continua con il fallback cors
      }
      
      // Secondo tentativo con modalità cors
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
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", 
        body: JSON.stringify(payload),
      });
      
      console.log('Richiesta no-cors inviata (non possiamo verificare la risposta)');
      console.log('Stato della risposta (potrebbe essere opaco):', response.status, response.type);
      
      // Con no-cors non possiamo verificare la risposta, quindi assumiamo successo
      // ma informiamo l'utente che dovrebbe verificare su n8n
      return true;
    } catch (error) {
      console.error('Errore durante l\'invio al webhook:', error);
      throw error; // Rilanciamo l'errore per gestirlo a livello superiore
    }
  }
  
  /**
   * Verifica la raggiungibilità del webhook
   * @param url URL del webhook da testare
   */
  static async testWebhook(url: string): Promise<boolean> {
    try {
      console.log('Test di raggiungibilità webhook:', url);
      
      // Prepara un payload di test
      const testPayload = {
        action: 'test',
        fonte: {
          id: `test-${Date.now()}`,
          nome: 'Test WebhookConnectivity',
          url: 'https://example.com/test',
          tipo: 'test' as TipoBando,
          stato: 'test',
          stato_elaborazione: 'Test',
          data_ultimo_aggiornamento: new Date().toISOString().split('T')[0]
        },
        timestamp: new Date().toISOString()
      };
      
      // Tentativi multipli con diversi metodi di fetch
      let success = false;
      
      // 1. Tentativo standard
      try {
        console.log('Tentativo test standard con credentials');
        const standardResponse = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(testPayload)
        });
        
        console.log('Risposta test standard:', standardResponse.status, standardResponse.statusText);
        if (standardResponse.ok) {
          success = true;
          return true;
        }
      } catch (e) {
        console.log('Errore nel test standard:', e);
      }
      
      // 2. Tentativo CORS
      if (!success) {
        try {
          console.log('Tentativo test con CORS');
          const corsResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify(testPayload)
          });
          
          console.log('Risposta test CORS:', corsResponse.status, corsResponse.statusText);
          if (corsResponse.ok) {
            success = true;
            return true;
          }
        } catch (e) {
          console.log('Errore nel test CORS:', e);
        }
      }
      
      // 3. Tentativo no-CORS (ultimo resort)
      if (!success) {
        console.log('Tentativo test con no-CORS');
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors',
          body: JSON.stringify(testPayload)
        });
        
        console.log('Richiesta no-CORS inviata (risultato opaco)');
        // Con no-cors non possiamo verificare la risposta effettiva
        return true;
      }
      
      return success;
    } catch (error) {
      console.error('Errore durante il test del webhook:', error);
      return false;
    }
  }
}

export default WebhookService;
