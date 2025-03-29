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
      console.log('Tentativo di aggiornare fonte nel foglio Google:', fonte);
      
      const updateAppUrl = localStorage.getItem('googleSheetUpdateUrl');
      
      if (!updateAppUrl) {
        console.error('URL per aggiornamento Google Sheet non configurato');
        return false;
      }
      
      // Estrai l'ID del foglio se disponibile
      const sheetUrl = this.getSheetUrl();
      let sheetId = null;
      
      if (sheetUrl) {
        sheetId = this.extractSheetId(sheetUrl);
        console.log('Sheet ID estratto:', sheetId);
      }
      
      // Prepara i dati da inviare
      const fonteData = {
        url: fonte.url,
        nome: fonte.nome, 
        tipo: fonte.tipo,
        stato: fonte.stato || 'attivo'
      };
      
      console.log('Invio dati a Google Apps Script:', updateAppUrl);
      console.log('Dati da inviare:', {
        sheetId,
        action: 'updateFonte',
        fonte: fonteData
      });
      
      // Usa il metodo fetch di base senza CORS
      try {
        const data = {
          sheetId,
          action: 'updateFonte',
          fonte: fonteData
        };
        
        console.log('Tentativo di invio dati JSON con fetch normale');
        
        // Create form data for sending
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        
        const response = await fetch(updateAppUrl, {
          method: 'POST',
          body: formData,
          mode: 'no-cors' // Usa no-cors per evitare problemi CORS
        });
        
        console.log('Risposta ricevuta:', response);
        
        // Con no-cors, non possiamo leggere la risposta
        // Assumiamo che sia andato a buon fine se non ci sono errori
        return true;
      } catch (fetchError) {
        console.error('Errore nella chiamata fetch:', fetchError);
        
        console.log('Tentativo alternativo con JSONP');
        // Tentativo con JSONP come fallback
        return new Promise((resolve) => {
          const callbackName = 'googleSheetCallback_' + Date.now();
          
          // Imposta una funzione di callback globale
          (window as any)[callbackName] = (result: any) => {
            console.log('Risultato callback JSONP:', result);
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            resolve(result?.success || false);
          };
          
          // Crea un timeout per gestire le chiamate che non ricevono risposta
          const jsonpTimeout = setTimeout(() => {
            console.log('Timeout nella chiamata JSONP, assumo successo');
            if (document.body.contains(script)) {
              document.body.removeChild(script);
            }
            delete (window as any)[callbackName];
            resolve(true); // Assumiamo che sia andato a buon fine
          }, 5000);
          
          // Prepara i dati da inviare come query string
          const jsonpData = encodeURIComponent(JSON.stringify({
            sheetId,
            action: 'updateFonte',
            fonte: fonteData
          }));
          
          // Crea uno script tag per la chiamata JSONP
          const script = document.createElement('script');
          script.src = `${updateAppUrl}?callback=${callbackName}&data=${jsonpData}`;
          script.onerror = () => {
            console.error('Errore nello script JSONP');
            clearTimeout(jsonpTimeout);
            document.body.removeChild(script);
            delete (window as any)[callbackName];
            resolve(false);
          };
          
          document.body.appendChild(script);
        });
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della fonte:', error);
      return false;
    }
  }

  public async addFonteToSheet(fonte: Fonte): Promise<boolean> {
    console.log('Aggiunta fonte al foglio Google (metodo dedicato):', fonte);
    try {
      return await this.updateFonteInSheet(fonte);
    } catch (error) {
      console.error('Errore in addFonteToSheet:', error);
      return false;
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
      
      // Crea una mappa delle posizioni delle intestazioni (insensibile alle maiuscole)
      const headerMap: {[key: string]: number} = {};
      for (let j = 0; j < headers.length; j++) {
        if (headers[j] !== "") {
          headerMap[headers[j].toLowerCase()] = j;
        }
      }
      
      // Mappatura migliorata con controllo insensibile alle maiuscole
      if ("url" in headerMap && values[headerMap["url"]]) {
        fonte.url = values[headerMap["url"]];
      }
      
      if ("nome" in headerMap && values[headerMap["nome"]]) {
        fonte.nome = values[headerMap["nome"]];
      }
      
      if ("tipo" in headerMap && values[headerMap["tipo"]]) {
        fonte.tipo = this.mapTipoFonte(values[headerMap["tipo"]]);
      }
      
      if ("stato_elaborazione" in headerMap && values[headerMap["stato_elaborazione"]]) {
        fonte.stato = values[headerMap["stato_elaborazione"]].toLowerCase().includes('elaborat') ? 'attivo' : 'inattivo';
      }
      
      // Se il nome non è stato impostato, derivalo dall'URL
      if (!fonte.nome && fonte.url) {
        try {
          const domain = new URL(fonte.url).hostname.replace('www.', '');
          fonte.nome = domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch {
          fonte.nome = `Fonte ${i}`;
        }
      }

      // Deriva tipo dall'URL se non impostato
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
