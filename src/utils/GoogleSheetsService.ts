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

      // Check for specific GID in the URL (sheet tab)
      const gidMatch = url.match(/[#&]gid=(\d+)/);
      let apiUrl;
      
      if (gidMatch && gidMatch[1]) {
        const gid = gidMatch[1];
        apiUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
        console.log('Recupero dati da Google Sheets con GID specifico:', apiUrl);
      } else {
        // Default to the first sheet if no GID is specified
        apiUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
        console.log('Recupero dati da Google Sheets (primo foglio):', apiUrl);
      }
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Errore nel recupero dei dati: ${response.statusText}`);
      }
      
      const csvData = await response.text();
      if (csvData.trim().length === 0) {
        throw new Error('Il foglio Google Sheets è vuoto o non accessibile');
      }
      
      // Parse CSV to get bandi
      const parsedBandi = this.parseCsvToBandi(csvData);
      console.log(`Analizzati ${parsedBandi.length} bandi dal CSV`);
      return parsedBandi;
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
    // More robust extraction of the sheet ID from various Google Sheets URL formats
    const regex = /\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      console.log('Extracted sheet ID:', match[1]);
      return match[1];
    }
    
    // Try alternative format
    const altRegex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const altMatch = url.match(altRegex);
    
    if (altMatch && altMatch[1]) {
      console.log('Extracted sheet ID (alt format):', altMatch[1]);
      return altMatch[1];
    }
    
    console.error('Failed to extract sheet ID from URL:', url);
    return null;
  }

  private parseCsvToBandi(csvData: string): Bando[] {
    console.log('Parsing CSV data...');
    console.log('CSV data preview:', csvData.substring(0, 500) + '...');
    
    // Split by newline, handling both \r\n and \n
    const lines = csvData.split(/\r?\n/);
    
    console.log(`CSV has ${lines.length} lines`);
    
    if (lines.length <= 1) {
      console.warn('CSV data has no content or only headers');
      return [];
    }

    // First line contains headers
    const headers = this.parseCsvLine(lines[0]);
    console.log('CSV headers:', headers);
    
    const bandi: Bando[] = [];
    let skippedRows = 0;
    
    // Process each line (skip first line which is headers)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        skippedRows++;
        continue;
      }
      
      const values = this.parseCsvLine(line);
      
      // Debug first few rows parsing for diagnosis
      if (i < 5 || i === lines.length - 1) {
        console.log(`Row ${i}/${lines.length - 1} parsed values:`, values);
      }
      
      // Skip rows where all values are empty
      if (values.every(v => !v || v.trim() === '')) {
        skippedRows++;
        continue;
      }
      
      const bando: any = {};
      
      // Map columns to bando properties
      headers.forEach((header, index) => {
        if (index < values.length) {
          const value = values[index];
          
          // Skip empty values
          if (!value || value.trim() === '') {
            return;
          }
          
          const headerLower = header.toLowerCase().trim();
          switch(headerLower) {
            case 'id':
              bando.id = value || `imported-${Date.now()}-${i}`;
              break;
            case 'data_scraping':
            case 'data_estrazione':
              bando.data_estrazione = value;
              bando.dataEstrazione = value;
              break;
            case 'titolo_incentivo':
            case 'titolo':
              bando.titolo = value;
              break;
            case 'fonte':
              bando.fonte = value;
              break;
            case 'descrizione':
              bando.descrizione = value;
              break;
            case 'descrizione_dettagliata':
            case 'descrizione_completa':
              bando.descrizione_completa = value;
              bando.descrizioneCompleta = value;
              if (!bando.descrizione) {
                bando.descrizione = value?.substring(0, 150) + "...";
              }
              break;
            case 'url_dettaglio':
            case 'url':
              bando.url = value;
              break;
            case 'tipo':
              bando.tipo = this.mapTipoBando(value);
              break;
            case 'requisiti':
              bando.requisiti = value;
              break;
            case 'modalita_presentazione':
              bando.modalita_presentazione = value;
              bando.modalitaPresentazione = value;
              break;
            case 'scadenza_dettagliata':
            case 'scadenza':
              if (value) {
                // Try to extract date from string
                const dateMatch = value.match(/(\d{1,2})[\s\/\-\.]+(\d{1,2})[\s\/\-\.]+(\d{4})/);
                if (dateMatch) {
                  // Format as YYYY-MM-DD
                  const day = dateMatch[1].padStart(2, '0');
                  const month = dateMatch[2].padStart(2, '0');
                  const year = dateMatch[3];
                  bando.scadenza = `${year}-${month}-${day}`;
                } else if (value.match(/\d{4}-\d{2}-\d{2}/)) {
                  // Already in YYYY-MM-DD format
                  bando.scadenza = value;
                } else {
                  bando.scadenza = new Date().toISOString().split('T')[0]; // Today as fallback
                }
                bando.scadenza_dettagliata = value;
                bando.scadenzaDettagliata = value;
              } else {
                bando.scadenza = new Date().toISOString().split('T')[0];
              }
              break;
            case 'budget_disponibile':
              bando.budget_disponibile = value;
              bando.budgetDisponibile = value;
              
              // Try to extract amount from budget text
              const importMatch = value && value.match(/(\d+(?:[\.,]\d+)?)\s*(?:milion[ei]|mln)/i);
              if (importMatch) {
                const importoValue = parseFloat(importMatch[1].replace(',', '.'));
                if (!isNaN(importoValue)) {
                  bando.importo_max = importoValue * 1000000;
                  bando.importoMax = importoValue * 1000000;
                }
              }
              break;
            case 'importo_min':
              if (value && !isNaN(parseFloat(value))) {
                bando.importo_min = parseFloat(value);
                bando.importoMin = parseFloat(value);
              }
              break;
            case 'importo_max':
              if (value && !isNaN(parseFloat(value))) {
                bando.importo_max = parseFloat(value);
                bando.importoMax = parseFloat(value);
              }
              break;
            case 'settori':
              if (value) {
                bando.settori = value.split(',').map((s: string) => s.trim());
              }
              break;
            case 'ultimi_aggiornamenti':
              bando.ultimi_aggiornamenti = value;
              bando.ultimiAggiornamenti = value;
              break;
            default:
              // Handle additional fields
              const camelCaseHeader = header.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
              bando[camelCaseHeader] = value;
              bando[header] = value;
          }
        }
      });
      
      // Ensure required fields have values
      if (bando.titolo && bando.fonte) {
        if (!bando.id) {
          bando.id = `imported-${Date.now()}-${i}`;
        }
        if (!bando.settori || !Array.isArray(bando.settori) || bando.settori.length === 0) {
          bando.settori = ["Generico"];
        }
        if (!bando.tipo) {
          bando.tipo = 'altro';
        }
        
        // Add missing but required fields
        if (!bando.data_estrazione) {
          const today = new Date().toISOString().split('T')[0];
          bando.data_estrazione = today;
          bando.dataEstrazione = today;
        }
        
        // Standardize scadenza format if not set
        if (!bando.scadenza) {
          const oneMonthLater = new Date();
          oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
          bando.scadenza = oneMonthLater.toISOString().split('T')[0];
        }
        
        bandi.push(bando as Bando);
      } else {
        if (i < 10) {  // Only log the first few skipped rows to avoid flooding the console
          console.warn(`Row ${i} skipped due to missing required fields (titolo or fonte):`, values);
        }
        skippedRows++;
      }
    }
    
    console.log(`Successfully parsed ${bandi.length} valid bandi from CSV (skipped ${skippedRows} rows)`);
    return bandi;
  }

  private parseCsvLine(line: string): string[] {
    // Improved CSV parsing logic to handle quoted fields correctly
    const result: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        // Handle quoted fields
        if (i + 1 < line.length && line[i + 1] === '"' && inQuotes) {
          // Escaped quote inside quoted field
          currentValue += '"';
          i += 2; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator outside quotes
        result.push(currentValue.trim());
        currentValue = '';
        i++;
      } else {
        // Regular character
        currentValue += char;
        i++;
      }
    }
    
    // Add the last field
    result.push(currentValue.trim());
    
    return result;
  }

  private mapTipoBando(tipo: string): 'europeo' | 'statale' | 'regionale' | 'altro' {
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
