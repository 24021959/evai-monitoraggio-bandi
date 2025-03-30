
import { Bando } from "@/types";

class GoogleSheetsService {
  private static readonly SHEET_URL_KEY = 'googleSheetUrl';

  public static getSheetUrl(): string | null {
    return localStorage.getItem(this.SHEET_URL_KEY);
  }

  public static setSheetUrl(url: string): void {
    localStorage.setItem(this.SHEET_URL_KEY, url);
  }

  private static extractSheetId(url: string): string | null {
    const regex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  private static mapSheetRowsToBandi(table: any): Bando[] {
    if (!table || !table.cols || !table.rows) {
      console.error('I dati del foglio non hanno il formato atteso');
      return [];
    }
    
    // Log dettagliato per debug
    console.log(`Dati del foglio - Colonne: ${table.cols.length}, Righe: ${table.rows.length}`);
    console.log('Intestazioni colonne:', table.cols.map((col: any) => col.label));
    
    const headers = table.cols.map((col: any) => col.label);
    
    // Controllo per verificare che ci siano le colonne principali
    const requiredColumns = ['nome', 'descrizione', 'fonte', 'tipo'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      console.error(`Colonne obbligatorie mancanti: ${missingColumns.join(', ')}`);
      console.log('Colonne disponibili:', headers.join(', '));
    }
    
    return table.rows.map((row: any) => {
      const bando: any = {};
      
      // Verifica che row.c (celle della riga) esista e sia un array
      if (!row.c || !Array.isArray(row.c)) {
        console.error('Formato riga non valido:', row);
        return null;
      }
      
      headers.forEach((header: string, index: number) => {
        // Verifica che l'indice sia valido per l'array di celle
        if (index >= row.c.length) {
          console.warn(`Indice ${index} non valido per la riga:`, row.c);
          bando[header] = '';
          return;
        }
        
        const cell = row.c[index];
        let value = null;
        
        // Gestione più robusta dei valori delle celle
        if (cell) {
          // Prima controlliamo v (value)
          if (cell.v !== undefined && cell.v !== null) {
            value = cell.v;
          } 
          // Poi controlliamo f (formatted value) se v non è disponibile
          else if (cell.f !== undefined && cell.f !== null) {
            value = cell.f;
          }
        }
        
        if (value === null) {
          value = '';
        }
        
        bando[header] = value;
      });

      // Trasforma i nomi delle colonne in camelCase e pulisce i valori di testo
      const mappedBando: Bando = {
        id: bando.row_number?.toString() || '',
        titolo: typeof bando.nome === 'string' ? bando.nome.trim() : String(bando.nome || '').trim(),
        descrizione: typeof bando.descrizione === 'string' ? bando.descrizione.trim() : String(bando.descrizione || '').trim(),
        fonte: typeof bando.fonte === 'string' ? bando.fonte.trim() : String(bando.fonte || '').trim(),
        scadenza: bando.scadenza ? String(bando.scadenza) : '',
        tipo: bando.tipo ? String(bando.tipo) : '',
        url: bando.url ? String(bando.url) : '',
        importo_min: bando.importo_min !== undefined && bando.importo_min !== '' ? parseFloat(bando.importo_min) : undefined,
        importo_max: bando.importo_max !== undefined && bando.importo_max !== '' ? parseFloat(bando.importo_max) : undefined,
        budget_disponibile: bando.budget_disponibile ? String(bando.budget_disponibile) : '',
        data_estrazione: bando.data_estrazione ? String(bando.data_estrazione) : '',
        requisiti: typeof bando.requisiti === 'string' ? bando.requisiti.trim() : String(bando.requisiti || '').trim(),
        modalita_presentazione: bando.modalita_presentazione ? String(bando.modalita_presentazione) : '',
        ultimi_aggiornamenti: bando.ultimi_aggiornamenti ? String(bando.ultimi_aggiornamenti) : '',
      };

      return mappedBando;
    }).filter(bando => bando !== null); // Filtra eventuali bandi nulli
  }

  public static async fetchBandiFromSheet(sheetUrlParam?: string): Promise<Bando[]> {
    try {
      // Ottieni l'URL del foglio Google
      const sheetUrl = sheetUrlParam || this.getSheetUrl() || '';
      
      if (!sheetUrl) {
        console.error('URL del foglio Google non configurato');
        return [];
      }
      
      // Estrai l'ID del foglio dall'URL
      const sheetId = this.extractSheetId(sheetUrl);
      
      if (!sheetId) {
        console.error('ID del foglio Google non valido');
        return [];
      }

      console.log(`Recupero dati dal foglio Google con ID: ${sheetId}`);
      
      // Costruisci l'URL dell'API per accedere al foglio Google pubblico
      const apiUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
      
      const response = await fetch(apiUrl);
      const text = await response.text();
      
      // Pulizia della risposta JSONP-like per estrarre il JSON
      const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      
      try {
        const data = JSON.parse(jsonString);
        console.log('Risposta JSON ricevuta dal foglio Google:', data.status);
        
        if (!data || !data.table) {
          console.error('Formato dati non valido, manca il campo "table"');
          console.log('Struttura dati ricevuta:', JSON.stringify(data).substring(0, 500) + '...');
          return [];
        }
        
        console.log(`Dati recuperati. Righe trovate: ${data.table.rows?.length || 0}`);
        
        // Mappa i dati del foglio Google agli oggetti Bando
        const bandi: Bando[] = this.mapSheetRowsToBandi(data.table);
        console.log(`Bandi mappati: ${bandi.length}`);
        
        // Log più dettagliato per debug
        if (bandi.length === 0) {
          console.error('Nessun bando mappato. Verifica formato del foglio.');
          console.log('Prime 3 righe del foglio:');
          if (data.table.rows && data.table.rows.length > 0) {
            data.table.rows.slice(0, 3).forEach((row: any, i: number) => {
              console.log(`Riga ${i+1}:`, JSON.stringify(row).substring(0, 200));
            });
          }
        }
        
        // Filtra eventuali bandi non validi (senza titolo o fonte)
        const bandiFiltrati = bandi.filter(bando => 
          bando.titolo && bando.titolo.trim() !== ''
        );
        
        console.log(`Bandi validi dopo filtro: ${bandiFiltrati.length}`);
        
        // Debug dei primi 3 bandi per verificare il corretto mapping
        if (bandiFiltrati.length > 0) {
          console.log('Esempio primi 3 bandi:');
          bandiFiltrati.slice(0, 3).forEach((b, i) => {
            console.log(`Bando ${i+1}: Titolo: ${b.titolo}, Fonte: ${b.fonte}, Scadenza: ${b.scadenza}`);
          });
        }
        
        return bandiFiltrati;
      } catch (parseError) {
        console.error('Errore durante il parsing della risposta JSON:', parseError);
        console.log('Testo ricevuto:', text.substring(0, 500) + '...');
        throw new Error('Formato risposta dal foglio Google non valido');
      }
    } catch (error) {
      console.error('Errore dettagliato durante il recupero dei bandi dal foglio Google:', error);
      throw new Error('Impossibile recuperare i dati dal foglio Google');
    }
  }
}

export default GoogleSheetsService;
