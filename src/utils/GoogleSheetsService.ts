
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

  private static formatDateValue(value: any): string {
    if (!value) return '';
    
    // Check if it's a date string that looks like "Date(year,month,day)"
    if (typeof value === 'string' && value.startsWith('Date(') && value.endsWith(')')) {
      try {
        // Extract the date components
        const dateContent = value.substring(5, value.length - 1);
        const [year, month, day] = dateContent.split(',').map(v => parseInt(v.trim(), 10));
        
        // JavaScript months are 0-indexed, so we need to subtract 1 from the month
        const jsDate = new Date(year, month - 1, day);
        
        // Format as YYYY-MM-DD for SQL compatibility
        return jsDate.toISOString().split('T')[0];
      } catch (err) {
        console.error('Error parsing date:', value, err);
        return '';
      }
    }
    
    // If it's already a proper date string, try to format it
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (err) {
      console.error('Error formatting date:', value, err);
    }
    
    // Return as is if we can't parse it
    return value;
  }

  private static mapSheetRowsToBandi(table: any): Bando[] {
    if (!table || !table.cols || !table.rows) {
      console.error('I dati del foglio non hanno il formato atteso');
      return [];
    }
    
    console.log(`Dati del foglio - Colonne: ${table.cols.length}, Righe: ${table.rows.length}`);
    console.log('Intestazioni colonne:', table.cols.map((col: any) => col.label));
    
    const headers = table.cols.map((col: any) => col.label);
    
    // Mappatura più flessibile delle intestazioni del foglio ai campi del bando
    const fieldMapping: {[key: string]: string} = {
      'titolo_incentivo': 'titolo',
      'titolo': 'titolo',
      'nome': 'titolo',
      'fonte': 'fonte',
      'descrizione': 'descrizione',
      'url_dettaglio': 'url',
      'url': 'url',
      'tipo': 'tipo',
      'data_scraping': 'dataEstrazione',
      'data_estrazione': 'dataEstrazione',
      'scadenza': 'scadenza',
      'scadenza_dettagliata': 'scadenzaDettagliata',
      'budget_disponibile': 'budgetDisponibile',
      'modalita_presentazione': 'modalitaPresentazione',
      'requisiti': 'requisiti',
      'descrizione_dettagliata': 'descrizioneCompleta',
      'ultimi_aggiornamenti': 'ultimiAggiornamenti'
    };
    
    return table.rows.map((row: any, rowIndex: number) => {
      // Verifica che row.c (celle della riga) esista e sia un array
      if (!row.c || !Array.isArray(row.c)) {
        console.error('Formato riga non valido:', row);
        return null;
      }
      
      // Inizializzazione di un oggetto bando vuoto con valori predefiniti
      const bando: any = {
        // Assegniamo valori predefiniti per i campi obbligatori
        id: `sheet-row-${rowIndex + 1}-${Date.now()}`,
        titolo: '',
        fonte: 'Google Sheet',
        tipo: 'altro'
      };
      
      // Popolazione del bando con i dati dalla riga
      headers.forEach((header: string, index: number) => {
        // Verifica che l'indice sia valido per l'array di celle
        if (index >= row.c.length) {
          return;
        }
        
        const cell = row.c[index];
        let value = null;
        
        // Gestione robusta dei valori delle celle
        if (cell) {
          if (cell.v !== undefined) {
            value = cell.v;
          } else if (cell.f !== undefined) {
            value = cell.f;
          }
        }
        
        if (value === null) {
          value = '';
        }
        
        // Usa il mapping per determinare a quale campo del bando assegnare questo valore
        const mappedField = fieldMapping[header.toLowerCase()];
        if (mappedField) {
          // Gestione speciale per le date
          if (mappedField === 'scadenza' || mappedField === 'dataEstrazione') {
            bando[mappedField] = this.formatDateValue(value);
          } else {
            bando[mappedField] = String(value).trim();
          }
        } else {
          // Per campi non mappati, usa direttamente il nome dell'intestazione
          bando[header] = String(value).trim();
        }
      });

      // Log dettagliato per il debug
      console.log(`Riga ${rowIndex + 1}:`, JSON.stringify(bando).substring(0, 200) + '...');
      
      // Validazione bando: deve avere almeno un titolo non vuoto
      if (!bando.titolo || bando.titolo.trim() === '') {
        console.log(`Riga ${rowIndex + 1} saltata: titolo mancante`);
        return null;
      }

      // Conversione a formato Bando
      const mappedBando: Bando = {
        id: bando.id,
        titolo: bando.titolo,
        descrizione: bando.descrizione || '',
        descrizioneCompleta: bando.descrizioneCompleta || '',
        fonte: bando.fonte || 'Google Sheet',
        scadenza: bando.scadenza || '',
        tipo: bando.tipo || 'altro',
        url: bando.url || '',
        importoMin: typeof bando.importo_min !== 'undefined' ? Number(bando.importo_min) : undefined,
        importoMax: typeof bando.importo_max !== 'undefined' ? Number(bando.importo_max) : undefined,
        budgetDisponibile: bando.budgetDisponibile || '',
        dataEstrazione: bando.dataEstrazione || '',
        requisiti: bando.requisiti || '',
        modalitaPresentazione: bando.modalitaPresentazione || '',
        ultimiAggiornamenti: bando.ultimiAggiornamenti || '',
        settori: Array.isArray(bando.settori) ? bando.settori : []
      };

      return mappedBando;
    }).filter(bando => bando !== null);
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
      
      // Log per il debug
      console.log('Risposta Google Sheets ricevuta, lunghezza:', text.length);
      
      // Pulizia della risposta JSONP-like per estrarre il JSON
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}') + 1;
      
      if (startIndex < 0 || endIndex <= 0 || startIndex >= endIndex) {
        throw new Error('Formato risposta non valido dal foglio Google');
      }
      
      const jsonString = text.substring(startIndex, endIndex);
      console.log('JSON estratto, lunghezza:', jsonString.length);
      
      try {
        const data = JSON.parse(jsonString);
        console.log('Risposta JSON parsing completato');
        
        if (!data || !data.table) {
          console.error('Formato dati non valido, manca il campo "table"');
          return [];
        }
        
        console.log(`Dati recuperati. Righe trovate: ${data.table.rows?.length || 0}`);
        
        // Mappa i dati del foglio Google agli oggetti Bando
        const bandi: Bando[] = this.mapSheetRowsToBandi(data.table);
        console.log(`Bandi mappati: ${bandi.length}`);
        
        if (bandi.length === 0) {
          console.error('Nessun bando mappato.');
        } else {
          console.log('Primi 3 bandi estratti:');
          bandi.slice(0, 3).forEach((b, i) => {
            console.log(`Bando ${i+1}: Titolo: ${b.titolo}, Fonte: ${b.fonte}, Scadenza: ${b.scadenza}`);
          });
        }
        
        return bandi;
      } catch (parseError) {
        console.error('Errore durante il parsing della risposta JSON:', parseError);
        console.log('Testo ricevuto (primi 200 caratteri):', text.substring(0, 200) + '...');
        throw new Error('Formato risposta dal foglio Google non valido');
      }
    } catch (error) {
      console.error('Errore dettagliato durante il recupero dei bandi dal foglio Google:', error);
      throw new Error('Impossibile recuperare i dati dal foglio Google');
    }
  }
}

export default GoogleSheetsService;
