
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

  // Corretto per gestire meglio i dati dal foglio Google
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
      const apiUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=Bandi`;
      
      const response = await fetch(apiUrl);
      const text = await response.text();
      
      // Pulizia della risposta JSONP-like per estrarre il JSON
      const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const data = JSON.parse(jsonString);
      
      if (!data || !data.table || !data.table.rows) {
        console.error('Formato dati non valido');
        return [];
      }
      
      console.log(`Dati recuperati. Righe trovate: ${data.table.rows.length}`);
      
      // Mappa i dati del foglio Google agli oggetti Bando
      const bandi: Bando[] = this.mapSheetRowsToBandi(data.table);
      console.log(`Bandi mappati: ${bandi.length}`);
      
      // Filtra eventuali bandi non validi (senza titolo o fonte)
      const bandiFiltrati = bandi.filter(bando => 
        bando.titolo && bando.titolo.trim() !== '' && 
        bando.fonte && bando.fonte.trim() !== ''
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
    } catch (error) {
      console.error('Errore durante il recupero dei bandi dal foglio Google:', error);
      throw new Error('Impossibile recuperare i dati dal foglio Google');
    }
  }
}

export default GoogleSheetsService;
