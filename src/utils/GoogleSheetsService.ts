
import { Bando } from '@/types';

// This service handles the Google Sheets integration
export class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private sheetUrl: string | null = null;

  private constructor() {}

  public static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  public setSheetUrl(url: string): void {
    this.sheetUrl = url;
    localStorage.setItem('googleSheetUrl', url);
  }

  public getSheetUrl(): string | null {
    if (!this.sheetUrl) {
      this.sheetUrl = localStorage.getItem('googleSheetUrl');
    }
    return this.sheetUrl;
  }

  public async fetchBandiFromSheet(sheetUrl?: string): Promise<Bando[]> {
    try {
      const url = sheetUrl || this.getSheetUrl();
      
      if (!url) {
        throw new Error('URL del foglio Google non configurato');
      }

      // Extract the sheet ID from the URL
      const sheetId = this.extractSheetId(url);
      if (!sheetId) {
        throw new Error('ID del foglio non valido');
      }

      // Use Google Sheets API to get published CSV
      const apiUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
      
      console.log('Fetching data from Google Sheets:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Errore nel recupero dei dati: ${response.statusText}`);
      }
      
      const csvData = await response.text();
      return this.parseCsvToBandi(csvData);
    } catch (error) {
      console.error('Errore durante il recupero dei bandi dal foglio Google:', error);
      throw error;
    }
  }

  private extractSheetId(url: string): string | null {
    // Extract sheet ID from various Google Sheets URL formats
    const regex = /\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  private parseCsvToBandi(csvData: string): Bando[] {
    const lines = csvData.split('\n');
    if (lines.length <= 1) {
      return [];
    }

    // Assuming the first line contains headers
    const headers = this.parseCsvLine(lines[0]);
    
    const bandi: Bando[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCsvLine(line);
      const bando: any = {};
      
      // Map CSV columns to Bando properties based on headers
      headers.forEach((header, index) => {
        if (index < values.length) {
          const value = values[index];
          
          switch(header.toLowerCase()) {
            case 'id':
              bando.id = value || `imported-${Date.now()}-${i}`;
              break;
            case 'titolo':
              bando.titolo = value;
              break;
            case 'fonte':
              bando.fonte = value;
              break;
            case 'tipo':
              bando.tipo = this.mapTipoBando(value);
              break;
            case 'settori':
              bando.settori = value.split(',').map((s: string) => s.trim());
              break;
            case 'importomin':
            case 'importo min':
            case 'importo_min':
              bando.importoMin = value ? parseFloat(value) : undefined;
              break;
            case 'importomax':
            case 'importo max':
            case 'importo_max':
              bando.importoMax = value ? parseFloat(value) : undefined;
              break;
            case 'scadenza':
              bando.scadenza = value;
              break;
            case 'descrizione':
              bando.descrizione = value;
              break;
            case 'url':
              bando.url = value;
              break;
            default:
              // Handle additional fields
              bando[header] = value;
          }
        }
      });
      
      // Ensure required fields have values
      if (bando.titolo && bando.fonte) {
        if (!bando.id) {
          bando.id = `imported-${Date.now()}-${i}`;
        }
        if (!bando.settori || !Array.isArray(bando.settori)) {
          bando.settori = [];
        }
        if (!bando.scadenza) {
          bando.scadenza = new Date().toISOString().split('T')[0];
        }
        
        bandi.push(bando as Bando);
      }
    }
    
    return bandi;
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    result.push(currentValue.trim());
    
    return result;
  }

  private mapTipoBando(tipo: string): 'europeo' | 'statale' | 'regionale' | 'altro' {
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('europe') || tipoLower.includes('ue') || tipoLower.includes('eu')) {
      return 'europeo';
    } else if (tipoLower.includes('stato') || tipoLower.includes('nazional') || tipoLower.includes('state')) {
      return 'statale';
    } else if (tipoLower.includes('region')) {
      return 'regionale';
    }
    
    return 'altro';
  }
}

export default GoogleSheetsService.getInstance();
