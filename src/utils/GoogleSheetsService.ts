
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
      
      console.log('Recupero dati da Google Sheets:', apiUrl);
      
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

    // Assumiamo che la prima riga contenga le intestazioni
    const headers = this.parseCsvLine(lines[0]);
    
    const bandi: Bando[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCsvLine(line);
      const bando: any = {};
      
      // Mappatura delle colonne del CSV alle proprietà di Bando in base al nuovo formato
      headers.forEach((header, index) => {
        if (index < values.length) {
          const value = values[index];
          
          switch(header.toLowerCase()) {
            case 'id':
              bando.id = value || `imported-${Date.now()}-${i}`;
              break;
            case 'data_scraping': // Nuova colonna
              bando.dataEstrazione = value;
              break;
            case 'titolo_incentivo': // Nuova colonna per il titolo
              bando.titolo = value;
              break;
            case 'fonte':
              bando.fonte = value;
              break;
            case 'descrizione':
              bando.descrizione = value;
              break;
            case 'descrizione_dettagliata': // Nuova colonna
              bando.descrizioneCompleta = value;
              if (!bando.descrizione) {
                bando.descrizione = value?.substring(0, 150) + "...";
              }
              break;
            case 'url_dettaglio': // URL del bando
              bando.url = value;
              break;
            case 'tipo':
              bando.tipo = this.mapTipoBando(value);
              break;
            case 'requisiti': // Nuova colonna
              bando.requisiti = value;
              // Estrai settori dai requisiti se sono elencati
              if (value && !bando.settori) {
                const potentialSectors = value.split(',').map(s => s.trim());
                if (potentialSectors.length > 0) {
                  bando.settori = potentialSectors;
                }
              }
              break;
            case 'modalita_presentazione': // Nuova colonna
              bando.modalitaPresentazione = value;
              break;
            case 'scadenza_dettagliata': // Nuova colonna per la scadenza
              if (value) {
                // Prova a estrarre una data dalla stringa
                const dateMatch = value.match(/(\d{1,2})[\s\/\-\.]+(\d{1,2})[\s\/\-\.]+(\d{4})/);
                if (dateMatch) {
                  // Formatta come YYYY-MM-DD
                  const day = dateMatch[1].padStart(2, '0');
                  const month = dateMatch[2].padStart(2, '0');
                  const year = dateMatch[3];
                  bando.scadenza = `${year}-${month}-${day}`;
                } else {
                  bando.scadenza = new Date().toISOString().split('T')[0]; // Data di oggi come fallback
                }
                bando.scadenzaDettagliata = value;
              } else {
                bando.scadenza = new Date().toISOString().split('T')[0];
              }
              break;
            case 'budget_disponibile': // Nuova colonna per l'importo
              if (value) {
                // Cerca cifre nel testo del budget
                const importMatch = value.match(/(\d+(?:[\.,]\d+)?)\s*(?:milion[ei]|mln)/i);
                if (importMatch) {
                  const importoValue = parseFloat(importMatch[1].replace(',', '.'));
                  if (!isNaN(importoValue)) {
                    bando.importoMax = importoValue * 1000000; // Converti in euro da milioni
                  }
                }
                bando.budgetDisponibile = value;
              }
              break;
            case 'settori':
              bando.settori = value.split(',').map((s: string) => s.trim());
              break;
            case 'ultimi_aggiornamenti': // Nuova colonna
              bando.ultimiAggiornamenti = value;
              break;
            default:
              // Gestisce campi addizionali
              bando[header] = value;
          }
        }
      });
      
      // Assicurati che i campi obbligatori abbiano valori
      if (bando.titolo && bando.fonte) {
        if (!bando.id) {
          bando.id = `imported-${Date.now()}-${i}`;
        }
        if (!bando.settori || !Array.isArray(bando.settori)) {
          bando.settori = ["Generico"];
        }
        if (!bando.tipo) {
          bando.tipo = 'altro';
        }
        if (!bando.importoMin && !bando.importoMax) {
          bando.importoMax = 0; // Valore di default
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
    
    // Aggiungi l'ultimo valore
    result.push(currentValue.trim());
    
    return result;
  }

  private mapTipoBando(tipo: string): 'europeo' | 'statale' | 'regionale' | 'altro' {
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('europe') || tipoLower.includes('ue') || tipoLower.includes('eu')) {
      return 'europeo';
    } else if (tipoLower.includes('stato') || tipoLower.includes('nazional') || tipoLower.includes('mise') || tipoLower.includes('mimit')) {
      return 'statale';
    } else if (tipoLower.includes('region')) {
      return 'regionale';
    }
    
    return 'altro';
  }
}

export default GoogleSheetsService.getInstance();
