import { Bando, Fonte } from '@/types';

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
      
      // Parse CSV to get bandi
      const parsedBandi = this.parseCsvToBandi(csvData);
      
      // Get existing bandi from session storage to check for duplicates
      const existingBandiStr = sessionStorage.getItem('bandiImportati');
      let existingBandi: Bando[] = [];
      
      if (existingBandiStr) {
        try {
          existingBandi = JSON.parse(existingBandiStr);
        } catch (error) {
          console.error('Errore nel parsing dei bandi esistenti:', error);
        }
      }
      
      // Filter out duplicates based on ID or matching title and fonte
      const existingIds = new Set(existingBandi.map(b => b.id));
      const existingTitleSourcePairs = new Set(
        existingBandi.map(b => `${b.titolo.toLowerCase()}|${b.fonte.toLowerCase()}`)
      );
      
      const uniqueNewBandi = parsedBandi.filter(bando => {
        // Check if the ID already exists
        if (existingIds.has(bando.id)) return false;
        
        // Check if the title and source combination already exists
        const titleSourcePair = `${bando.titolo.toLowerCase()}|${bando.fonte.toLowerCase()}`;
        return !existingTitleSourcePairs.has(titleSourcePair);
      });
      
      // Set the current date for all newly imported bandi if not already set
      const today = new Date().toISOString().split('T')[0];
      uniqueNewBandi.forEach(bando => {
        if (!bando.dataEstrazione) {
          bando.dataEstrazione = today;
        }
      });
      
      // Combine new bandi with existing ones, prioritizing the newest ones
      const allBandi = [...uniqueNewBandi, ...existingBandi];
      
      // Sort by extraction date (newest first)
      allBandi.sort((a, b) => {
        const dateA = a.dataEstrazione ? new Date(a.dataEstrazione).getTime() : 0;
        const dateB = b.dataEstrazione ? new Date(b.dataEstrazione).getTime() : 0;
        return dateB - dateA;
      });
      
      // Save the combined list back to session storage
      sessionStorage.setItem('bandiImportati', JSON.stringify(allBandi));
      
      return allBandi;
    } catch (error) {
      console.error('Errore durante il recupero dei bandi dal foglio Google:', error);
      throw error;
    }
  }

  public async fetchFontiFromSheet(sheetUrl?: string): Promise<Fonte[]> {
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

      // Specifichiamo un foglio specifico per le fonti
      const apiUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Lista%20Fonti`;
      
      console.log('Recupero fonti da Google Sheets:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Errore nel recupero delle fonti: ${response.statusText}`);
      }
      
      const csvData = await response.text();
      
      // Parse CSV to get fonti
      return this.parseCsvToFonti(csvData);
    } catch (error) {
      console.error('Errore durante il recupero delle fonti dal foglio Google:', error);
      throw error;
    }
  }

  public async updateFonteInSheet(fonte: Fonte): Promise<boolean> {
    try {
      const url = this.getSheetUrl();
      
      if (!url) {
        console.error('URL del foglio Google non configurato');
        return false;
      }

      // Extract the sheet ID from the URL
      const sheetId = this.extractSheetId(url);
      if (!sheetId) {
        console.error('ID del foglio non valido');
        return false;
      }

      console.log('Tentativo di aggiungere fonte al foglio Google:', fonte);
      
      // Metodo diretto: utilizziamo Google Apps Script Web App
      const updateAppUrl = localStorage.getItem('googleSheetUpdateUrl');
      
      if (!updateAppUrl) {
        console.log('URL per aggiornamento Google Sheet non configurato');
        
        // Tentativo fallback: proviamo ad aggiungere direttamente tramite fetch con CORS proxy
        try {
          // Utilizziamo un approccio alternativo: inserimento diretto in CSV
          const newRow = [
            fonte.id,
            fonte.url,
            fonte.stato || 'attivo',
            new Date().toISOString(),
            fonte.nome,
            fonte.tipo
          ];
          
          const formattedRow = newRow.map(val => 
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
          ).join(',');
          
          // Utilizziamo un servizio CORS proxy per evitare problemi di CORS
          const corsProxyUrl = 'https://corsproxy.io/?';
          const appendUrl = `${corsProxyUrl}${encodeURIComponent(
            `https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse?entry.ID1=${encodeURIComponent(fonte.url)}&entry.ID2=${encodeURIComponent(fonte.nome)}&entry.ID3=${encodeURIComponent(fonte.tipo)}&submit=Submit`
          )}`;
          
          console.log('Tentativo di inviare i dati tramite proxy CORS:', appendUrl);
          
          // Nota: questo metodo richiede un Google Form collegato al foglio
          // Questo è solo un esempio e necessita di configurazione
          const response = await fetch(appendUrl, {
            method: 'GET',
            mode: 'cors',
          });
          
          console.log('Risposta dal tentativo di aggiunta:', response.status);
          return response.ok;
        } catch (fallbackError) {
          console.error('Fallback per aggiunta fonte fallito:', fallbackError);
          return false;
        }
      }
      
      // Approccio principale: utilizzo dell'App Script
      console.log('Invio dati a Google Apps Script:', updateAppUrl);
      const response = await fetch(updateAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetId,
          action: 'updateFonte',
          fonte: {
            id: fonte.id,
            url: fonte.url,
            nome: fonte.nome, 
            tipo: fonte.tipo,
            stato: fonte.stato || 'attivo',
            stato_elaborazione: fonte.stato || 'attivo',
            data_ultimo_aggiornamento: new Date().toISOString().split('T')[0]
          }
        }),
      });
      
      if (!response.ok) {
        console.error(`Errore nell'aggiornamento: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error('Dettagli errore:', text);
        return false;
      }
      
      try {
        const result = await response.json();
        console.log('Risultato aggiornamento:', result);
        return result.success;
      } catch (e) {
        console.error('Errore nel parsing della risposta JSON:', e);
        return false;
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della fonte:', error);
      return false;
    }
  }

  public async addFonteToSheet(fonte: Fonte): Promise<boolean> {
    console.log('Aggiunta fonte al foglio Google:', fonte);
    return this.updateFonteInSheet(fonte);
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

  private parseCsvToFonti(csvData: string): Fonte[] {
    const lines = csvData.split('\n');
    if (lines.length <= 1) {
      return [];
    }

    // Prima riga contiene le intestazioni
    const headers = this.parseCsvLine(lines[0]);
    
    const fonti: Fonte[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCsvLine(line);
      // Skip empty rows
      if (values.every(v => !v)) continue;
      
      const fonte: any = {
        stato: 'attivo' // Default stato
      };
      
      // Mapping based on the screenshot: id_number, url, stato_elaborazione, data_ultimo_aggiornamento
      headers.forEach((header, index) => {
        if (index < values.length) {
          const value = values[index];
          
          switch(header.toLowerCase()) {
            case 'id_number':
              // Do not use any custom ID format, we'll generate proper UUIDs later
              // fonte.id will be handled by SupabaseFontiService
              break;
            case 'url':
              fonte.url = value;
              break;
            case 'stato_elaborazione':
              fonte.stato = value.toLowerCase().includes('elaborat') ? 'attivo' : 'inattivo';
              // Use the same value for nome if not provided elsewhere
              if (!fonte.nome) {
                // Extract domain from URL for the name
                try {
                  const domain = new URL(value).hostname.replace('www.', '');
                  fonte.nome = domain.charAt(0).toUpperCase() + domain.slice(1);
                } catch {
                  fonte.nome = `Fonte ${i}`;
                }
              }
              break;
            case 'data_ultimo_aggiornamento':
              fonte.ultimoAggiornamento = value;
              break;
            // Map additional columns based on the screenshot
            case 'nome':
              fonte.nome = value;
              break;
            case 'tipo':
              fonte.tipo = this.mapTipoFonte(value);
              break;
            case 'frequenza_aggiornamento':
              fonte.frequenzaAggiornamento = value;
              break;
            case 'note':
              fonte.note = value;
              break;
            default:
              // Store any additional columns
              fonte[header] = value;
          }
        }
      });
      
      // Use URL for name if name is still not set
      if (!fonte.nome && fonte.url) {
        try {
          const domain = new URL(fonte.url).hostname.replace('www.', '');
          fonte.nome = domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch {
          fonte.nome = `Fonte ${i}`;
        }
      }

      // Derive tipo from URL if not set
      if (!fonte.tipo && fonte.url) {
        if (fonte.url.includes('europa.eu') || fonte.url.includes('ec.europa')) {
          fonte.tipo = 'europeo';
        } else if (fonte.url.includes('.gov.it') || fonte.url.includes('mise.gov') || fonte.url.includes('mimit')) {
          fonte.tipo = 'statale';
        } else if (fonte.url.includes('regione')) {
          fonte.tipo = 'regionale';
        } else {
          fonte.tipo = 'altro';
        }
      }
      
      // Assicurati che i campi obbligatori abbiano valori
      if (fonte.url) {
        // Do not set ID here, we'll handle it in SupabaseFontiService
        if (!fonte.tipo) {
          fonte.tipo = 'altro';
        }
        
        fonti.push(fonte as Fonte);
      }
    }
    
    return fonti;
  }

  private mapTipoFonte(tipo: string): 'europeo' | 'statale' | 'regionale' | 'altro' {
    if (!tipo) return 'altro';
    
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
