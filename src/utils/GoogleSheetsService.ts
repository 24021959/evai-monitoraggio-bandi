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
    if (!value) return ''; // Se il valore è vuoto, restituisci stringa vuota
    
    // Se è già una stringa di data nel formato YYYY-MM-DD
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    
    // Se è una data in formato "Date(anno,mese,giorno)"
    if (typeof value === 'string' && value.startsWith('Date(') && value.endsWith(')')) {
      try {
        const dateContent = value.substring(5, value.length - 1);
        const [year, month, day] = dateContent.split(',').map(v => parseInt(v.trim(), 10));
        const jsDate = new Date(year, month - 1, day);
        return jsDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      } catch (err) {
        console.error('Errore nel parsing della data:', value, err);
        return '';
      }
    }
    
    // Prova a convertire un timestamp o una stringa di data
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (err) {
      console.error('Errore nella formattazione della data:', value, err);
    }
    
    // Se non siamo riusciti a formattare la data, restituisci stringa vuota
    return '';
  }

  private static mapSheetRowsToBandi(table: any): Bando[] {
    if (!table || !table.cols || !table.rows) {
      console.error('I dati del foglio non hanno il formato atteso');
      return [];
    }
    
    console.log(`GoogleSheetsService: Mappatura dati - Colonne: ${table.cols.length}, Righe: ${table.rows.length}`);
    
    const headers = table.cols.map((col: any) => col.label.toLowerCase());
    console.log('Intestazioni colonne trovate:', headers);
    
    // Mappatura flessibile delle intestazioni
    const fieldMapping: {[key: string]: string} = {
      'titolo_incentivo': 'titolo',
      'titolo': 'titolo',
      'nome': 'titolo',
      'fonte': 'fonte',
      'descrizione': 'descrizione',
      'url_dettaglio': 'url',
      'url': 'url',
      'link': 'url',
      'tipo': 'tipo',
      'data_scraping': 'dataEstrazione',
      'data_estrazione': 'dataEstrazione',
      'data': 'dataEstrazione',
      'scadenza': 'scadenza',
      'scadenza_dettagliata': 'scadenzaDettagliata',
      'scadenza_bando': 'scadenza',
      'budget_disponibile': 'budgetDisponibile',
      'budget': 'budgetDisponibile',
      'importo': 'budgetDisponibile',
      'finanziamento': 'budgetDisponibile',
      'modalita_presentazione': 'modalitaPresentazione',
      'requisiti': 'requisiti',
      'descrizione_dettagliata': 'descrizioneCompleta',
      'ultimi_aggiornamenti': 'ultimiAggiornamenti'
    };
    
    return table.rows
      .map((row: any, rowIndex: number) => {
        // Verifica che le celle della riga esistano
        if (!row.c || !Array.isArray(row.c)) {
          console.error('Riga con formato non valido, saltata:', row);
          return null;
        }
        
        // Oggetto bando con valori predefiniti
        const bando: any = {
          id: `sheet-${Date.now()}-${rowIndex}`,
          titolo: '',
          fonte: 'Google Sheet',
          tipo: 'altro',
          descrizione: '',
          url: '',
          scadenza: ''
        };
        
        // Popola il bando con i dati dalla riga
        headers.forEach((header: string, index: number) => {
          // Verifica che l'indice sia valido
          if (index >= row.c.length) {
            return;
          }
          
          const cell = row.c[index];
          let value = '';
          
          // Estrai il valore dalla cella
          if (cell && cell.v !== undefined) {
            value = cell.v;
          } else if (cell && cell.f !== undefined) {
            value = cell.f;
          }
          
          // Usa il mapping per assegnare il valore al campo corretto
          const fieldName = fieldMapping[header];
          if (fieldName) {
            // Gestione speciale per le date
            if (fieldName === 'scadenza' || fieldName === 'dataEstrazione') {
              bando[fieldName] = this.formatDateValue(value);
            } else {
              bando[fieldName] = String(value).trim();
            }
          }
        });

        // Validazione: il bando deve avere almeno un titolo
        if (!bando.titolo || bando.titolo.trim() === '') {
          console.log(`Riga ${rowIndex + 1} ignorata: titolo mancante`);
          return null;
        }

        // Converti al formato Bando
        const bandoFinale: Bando = {
          id: bando.id,
          titolo: bando.titolo,
          descrizione: bando.descrizione || '',
          descrizioneCompleta: bando.descrizioneCompleta || '',
          fonte: bando.fonte || 'Google Sheet',
          scadenza: bando.scadenza || '',
          tipo: bando.tipo || 'altro',
          url: bando.url || '',
          importoMin: typeof bando.importoMin !== 'undefined' ? Number(bando.importoMin) : undefined,
          importoMax: typeof bando.importoMax !== 'undefined' ? Number(bando.importoMax) : undefined,
          budgetDisponibile: bando.budgetDisponibile || '',
          dataEstrazione: bando.dataEstrazione || new Date().toISOString().split('T')[0],
          requisiti: bando.requisiti || '',
          modalitaPresentazione: bando.modalitaPresentazione || '',
          ultimiAggiornamenti: bando.ultimiAggiornamenti || '',
          settori: Array.isArray(bando.settori) ? bando.settori : []
        };

        return bandoFinale;
      })
      .filter(bando => bando !== null);
  }

  public static async fetchBandiFromSheet(sheetUrlParam?: string): Promise<Bando[]> {
    try {
      const sheetUrl = sheetUrlParam || this.getSheetUrl() || '';
      
      if (!sheetUrl) {
        console.error('URL del foglio Google non configurato');
        return [];
      }
      
      const sheetId = this.extractSheetId(sheetUrl);
      
      if (!sheetId) {
        console.error('ID del foglio Google non valido');
        return [];
      }

      console.log(`Recupero dati dal foglio Google con ID: ${sheetId}`);
      
      const apiUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
      
      const response = await fetch(apiUrl);
      const text = await response.text();
      
      console.log('Risposta Google Sheets ricevuta, lunghezza:', text.length);
      
      // Estrazione del JSON dalla risposta JSONP-like
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}') + 1;
      
      if (startIndex < 0 || endIndex <= 0 || startIndex >= endIndex) {
        throw new Error('Formato risposta non valido dal foglio Google');
      }
      
      const jsonString = text.substring(startIndex, endIndex);
      
      try {
        const data = JSON.parse(jsonString);
        
        if (!data || !data.table) {
          console.error('Formato dati non valido, manca il campo "table"');
          return [];
        }
        
        console.log(`Dati recuperati. Righe trovate: ${data.table.rows?.length || 0}`);
        
        // Mappa i dati del foglio Google agli oggetti Bando
        const bandi: Bando[] = this.mapSheetRowsToBandi(data.table);
        console.log(`Bandi mappati: ${bandi.length}`);
        
        // Log dei primi bandi
        if (bandi.length > 0) {
          console.log('Primi 2 bandi estratti:');
          bandi.slice(0, 2).forEach((b, i) => {
            console.log(`Bando ${i+1}: Titolo: ${b.titolo}, Fonte: ${b.fonte}, Scadenza: ${b.scadenza}`);
          });
        } else {
          console.error('Nessun bando mappato.');
        }
        
        return bandi;
      } catch (parseError) {
        console.error('Errore durante il parsing della risposta JSON:', parseError);
        throw new Error('Formato risposta dal foglio Google non valido');
      }
    } catch (error) {
      console.error('Errore durante il recupero dei bandi dal foglio Google:', error);
      throw new Error('Impossibile recuperare i dati dal foglio Google');
    }
  }
}

export default GoogleSheetsService;
