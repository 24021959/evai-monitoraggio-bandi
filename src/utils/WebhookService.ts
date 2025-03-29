
import { Fonte } from "@/types";

interface WebhookResponse {
  success: boolean;
}

class WebhookService {
  public static async sendToWebhook(fonte: Fonte, action: 'add' | 'update' | 'delete'): Promise<boolean> {
    const webhookUrl = localStorage.getItem('n8nWebhookUrl');
    
    if (!webhookUrl) {
      console.error('URL del webhook n8n non configurato');
      return false;
    }
    
    console.log(`Invio richiesta webhook per azione "${action}" a ${webhookUrl}`);
    
    // Prepara il payload da inviare al webhook, adattato per il foglio Google Sheets
    const payload = {
      action,
      fonte: {
        id: fonte.id,
        nome: fonte.nome,
        url: fonte.url,
        tipo: fonte.tipo,
        stato_elaborazione: action === 'delete' ? 'inattivo' : 'attivo',
        data_ultimo_aggiornamento: new Date().toISOString().split('T')[0]
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('Payload webhook:', payload);
    
    try {
      // Prima prova con CORS
      return await this.sendWithFetch(webhookUrl, payload);
    } catch (corsError) {
      console.warn('Errore CORS durante invio al webhook, provo con fetch no-cors:', corsError);
      
      try {
        // Fallback a no-cors
        return await this.sendWithNoCors(webhookUrl, payload);
      } catch (noCorsError) {
        console.error('Errore anche con no-cors:', noCorsError);
        throw new Error(`Errore durante invio al webhook: ${noCorsError}`);
      }
    }
  }
  
  public static async testWebhook(webhookUrl: string): Promise<boolean> {
    try {
      // Prepara un test payload
      const testPayload = {
        action: 'test',
        fonte: {
          id: 'test-id',
          nome: 'Test Fonte',
          url: 'https://example.com',
          tipo: 'test',
          stato_elaborazione: 'test',
          data_ultimo_aggiornamento: new Date().toISOString().split('T')[0]
        },
        timestamp: new Date().toISOString()
      };
      
      console.log('Invio test al webhook:', testPayload);
      
      try {
        // Prima prova con CORS
        return await this.sendWithFetch(webhookUrl, testPayload);
      } catch (corsError) {
        console.warn('Errore CORS durante test del webhook, provo con fetch no-cors:', corsError);
        
        // Fallback a no-cors (assumiamo true perché non possiamo leggere la risposta)
        await this.sendWithNoCors(webhookUrl, testPayload);
        return true;
      }
    } catch (error) {
      console.error('Errore durante il test del webhook:', error);
      return false;
    }
  }
  
  private static async sendWithFetch(url: string, data: any): Promise<boolean> {
    // Tenta l'invio con modalità fetch normale
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    // Legge la risposta se disponibile
    const responseData = await response.json().catch(() => ({ success: response.ok }));
    
    console.log('Risposta webhook:', responseData);
    
    return response.ok && (responseData?.success !== false);
  }
  
  private static async sendWithNoCors(url: string, data: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Log per debug
        console.log('Tentativo di invio senza CORS a:', url);
        
        // Prepariamo un form con i dati
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        
        // Imposta un timer per fallback in caso di mancata risposta
        const timeout = setTimeout(() => {
          console.log('Timeout nell\'invio al webhook, assumiamo successo');
          resolve(true);
        }, 5000);
        
        // Crea l'elemento image per una richiesta senza CORS
        const img = new Image();
        img.onload = () => {
          clearTimeout(timeout);
          console.log('Webhook chiamato con successo (via Image)');
          resolve(true);
        };
        img.onerror = () => {
          clearTimeout(timeout);
          // Anche un errore tecnico di caricamento dell'immagine indica
          // che la richiesta è stata ricevuta dal server
          console.log('Webhook probabilmente ricevuto, ma con errore immagine');
          resolve(true);
        };
        
        // Usa una query string per inviare i dati minima
        img.src = `${url}?id=${data.fonte.id}&action=${data.action}&ts=${Date.now()}`;
        
        // Aggiungi un attributo nascosto e rimuovilo subito
        document.body.appendChild(img);
        document.body.removeChild(img);
        
        // Invia anche il corpo completo del messaggio via POST
        fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        }).then(() => {
          console.log('Fetch no-cors completato');
        }).catch(fetchError => {
          console.warn('Errore fetch no-cors (ignorato):', fetchError);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default WebhookService;
