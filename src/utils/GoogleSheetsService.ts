
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
    const headers = table.cols.map((col: any) => col.label);
    return table.rows.map((row: any) => {
      const bando: any = {};
      headers.forEach((header: string, index: number) => {
        const cell = row.c[index];
        let value = cell ? (cell.v != null ? cell.v : cell.f) : null;

        if (value === null) {
          value = '';
        }

        bando[header] = value;
      });

      // Trasforma i nomi delle colonne in camelCase e pulisce i valori di testo
      const mappedBando: Bando = {
        id: bando.row_number?.toString() || '',
        titolo: bando.nome?.toString().trim() || '',
        descrizione: bando.descrizione?.toString().trim() || '',
        fonte: bando.fonte?.toString().trim() || '',
        scadenza: bando.scadenza?.toString() || '',
        tipo: bando.tipo?.toString() || '',
        url: bando.url?.toString() || '',
        importo_min: bando.importo_min ? parseFloat(bando.importo_min) : undefined,
        importo_max: bando.importo_max ? parseFloat(bando.importo_max) : undefined,
        budget_disponibile: bando.budget_disponibile?.toString() || '',
        data_estrazione: bando.data_estrazione?.toString() || '',
        requisiti: bando.requisiti?.toString().trim() || '',
        modalita_presentazione: bando.modalita_presentazione?.toString() || '',
        ultimi_aggiornamenti: bando.ultimi_aggiornamenti?.toString() || '',
      };

      return mappedBando;
    });
  }

  // We'll use the URL from localStorage directly instead of requiring it to be passed in
  public static async fetchBandiFromSheet(sheetUrlParam?: string): Promise<Bando[]> {
    try {
      const sheetUrl = sheetUrlParam || localStorage.getItem('googleSheetUrl');
      
      if (!sheetUrl) {
        console.error('URL del foglio Google non configurato');
        return [];
      }
      
      // Extract the sheet ID from the URL
      const sheetId = this.extractSheetId(sheetUrl);
      
      if (!sheetId) {
        console.error('ID del foglio Google non valido');
        return [];
      }
      
      // Construct the API URL to access the public Google Sheet
      const apiUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=Bandi`;
      
      const response = await fetch(apiUrl);
      const text = await response.text();
      
      // Cleanups the JSONP-like response to extract the JSON
      const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const data = JSON.parse(jsonString);
      
      if (!data || !data.table || !data.table.rows) {
        console.error('Formato dati non valido');
        return [];
      }
      
      // Map Google Sheets data to Bando objects
      const bandi: Bando[] = this.mapSheetRowsToBandi(data.table);
      return bandi;
    } catch (error) {
      console.error('Errore durante il recupero dei bandi dal foglio Google:', error);
      throw new Error('Impossibile recuperare i dati dal foglio Google');
    }
  }
}

export default GoogleSheetsService;
