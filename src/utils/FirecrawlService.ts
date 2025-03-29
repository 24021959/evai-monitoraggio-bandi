import FirecrawlApp from '@mendable/firecrawl-js';
import { v4 as uuidv4 } from 'uuid';

// Function to determine fonte type based on URL
function determineFonteType(url: string): 'europeo' | 'statale' | 'regionale' | 'altro' {
  // Determine the type based on URL patterns
  if (url.includes('europa.eu') || url.includes('ec.europa.eu')) {
    return 'europeo';
  } else if (url.includes('gov.it') || url.includes('mise.gov.it') || url.includes('mimit') || url.includes('simest') || url.includes('invitalia')) {
    return 'statale';
  } else if (url.includes('regione') || url.includes('lombardia') || url.includes('lazio') || url.includes('toscana') || url.includes('veneto') || url.includes('campania') || url.includes('piemonte')) {
    return 'regionale';
  } else {
    return 'altro';
  }
}

export class FirecrawlService {
  static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  static SAVED_BANDI_STORAGE_KEY = 'saved_bandi';
  static SCRAPED_BANDI_STORAGE_KEY = 'scraped_bandi';
  static SCRAPED_SOURCES_STORAGE_KEY = 'scraped_sources';
  static SAVED_FONTI_STORAGE_KEY = 'saved_fonti';
  static firecrawlApp: any = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('API key salvata con successo');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static isApiKeyAlreadySaved(apiKey: string): boolean {
    const savedApiKey = this.getApiKey();
    return savedApiKey === apiKey;
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Test della API key');
      this.firecrawlApp = new FirecrawlApp({ apiKey });
      // Test semplice per verificare la API key
      const testResponse = await this.firecrawlApp.crawlUrl('https://example.com', {
        limit: 1
      });
      return testResponse.success;
    } catch (error) {
      console.error('Errore nel test della API key:', error);
      return false;
    }
  }

  static async crawlWebsite(url: string): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.error('API key non trovata');
      return { success: false, error: 'API key non trovata' };
    }

    try {
      console.log('Richiesta di crawling per URL:', url);
      if (!this.firecrawlApp) {
        console.log('Creazione nuova istanza FirecrawlApp');
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      // Configurazione speciale per MIMIT
      const isMimitUrl = url.includes('mimit.gov.it');
      
      // Per test e debug - simula i risultati con dati fake per MIMIT
      if (isMimitUrl && process.env.NODE_ENV === 'development' && false) { // Disabilitato per default
        console.log('MODALITÀ DI TEST: Utilizzo dati simulati per MIMIT');
        return this.simulateMimitCrawl();
      }
      
      console.log(`Avvio crawl ${isMimitUrl ? 'MIMIT' : 'standard'} per URL: ${url}`);
      
      const crawlOptions = {
        limit: isMimitUrl ? 200 : 100, // Aumenta il limite per MIMIT
        maxDepth: isMimitUrl ? 3 : 2,  // Aumenta la profondità per MIMIT
        scrapeOptions: {
          formats: ["markdown", "html"] as ("markdown" | "html" | "rawHtml" | "content" | "links" | "screenshot" | "screenshot@fullPage" | "extract" | "json")[],
        }
      };

      console.log('Opzioni di crawling:', JSON.stringify(crawlOptions));

      const crawlResponse = await this.firecrawlApp.crawlUrl(url, crawlOptions) as CrawlResponse;

      if (!crawlResponse.success) {
        console.error('Crawl fallito:', (crawlResponse as ErrorResponse).error);
        return { 
          success: false, 
          error: (crawlResponse as ErrorResponse).error || 'Impossibile eseguire il crawl del sito web' 
        };
      }

      console.log('Crawl completato con successo, numero di pagine:', crawlResponse.data?.length || 0);
      
      // Dettaglio delle pagine estratte per debug
      if (crawlResponse.data && crawlResponse.data.length > 0) {
        console.log('URL delle pagine estratte:');
        crawlResponse.data.forEach((page, index) => {
          console.log(`Pagina ${index + 1}: ${page.url}`);
          console.log(`  Titolo: ${page.title}`);
          // Mostra un'anteprima del contenuto per debug
          if (page.content) {
            const contentPreview = page.content.substring(0, 150).replace(/\s+/g, ' ');
            console.log(`  Anteprima contenuto: ${contentPreview}...`);
          }
        });
      } else {
        console.warn('Nessuna pagina estratta dal crawl!');
      }
      
      return { 
        success: true,
        data: crawlResponse 
      };
    } catch (error) {
      console.error('Errore completo durante il crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Impossibile connettersi al servizio di crawl' 
      };
    }
  }

  private static simulateMimitCrawl(): { success: boolean, data: any } {
    // Dati simulati per testing in ambiente di sviluppo
    const simulatedData = {
      success: true,
      status: "completed",
      completed: 5,
      total: 5,
      creditsUsed: 0,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      data: [
        {
          url: "https://www.mimit.gov.it/it/incentivi/pnrr-ipcei-batterie-2",
          title: "PNRR - IPCEI Batterie 2 | Ministero delle Imprese e del Made in Italy",
          content: `<div class="it-page-section">
            <h2>PNRR - IPCEI Batterie 2</h2>
            <div>
              <p>Incentivo per le imprese del settore Batterie con scadenza 28 febbraio 2025. Importo complessivo: 90.000.000 euro.</p>
              <p>L'incentivo è destinato alle aziende che operano nella filiera delle batterie, con particolare attenzione alle PMI innovative.</p>
              <p>La misura prevede contributi tra 1.000.000 e 5.000.000 di euro per progetto.</p>
            </div>
          </div>`
        },
        {
          url: "https://www.mimit.gov.it/it/incentivi/bando-agrisolare",
          title: "Bando Agrisolare | Ministero delle Imprese e del Made in Italy",
          content: `<div class="it-page-section">
            <h2>Bando Agrisolare</h2>
            <div>
              <p>Contributi per l'installazione di pannelli fotovoltaici su edifici a uso produttivo nei settori agricolo e zootecnico. Scadenza: 15 dicembre 2024.</p>
              <p>Il Bando Agrisolare prevede un investimento totale di 1.5 miliardi di euro per incentivare la produzione di energia rinnovabile.</p>
              <p>Importo minimo: 20.000 euro. Importo massimo: 300.000 euro per beneficiario.</p>
            </div>
          </div>`
        },
        {
          url: "https://www.mimit.gov.it/it/incentivi/credito-imposta-formazione-40",
          title: "Credito d'imposta formazione 4.0 | Ministero delle Imprese e del Made in Italy",
          content: `<div class="it-page-section">
            <h2>Credito d'imposta formazione 4.0</h2>
            <div>
              <p>Credito d'imposta per le attività di formazione finalizzate all'acquisizione o al consolidamento delle competenze tecnologiche. Scadenza: non prevista.</p>
              <p>L'agevolazione prevede un credito d'imposta del 50% per le piccole imprese, 40% per le medie imprese e 30% per le grandi imprese.</p>
              <p>Importo massimo: 300.000 euro annui per beneficiario.</p>
            </div>
          </div>`
        }
      ]
    };
    
    return { success: true, data: simulatedData };
  }

  static async extractBandiFromCrawlData(crawlData: any): Promise<Bando[]> {
    console.log('Inizio estrazione bandi da crawlData');
    
    if (!crawlData || !crawlData.data || !Array.isArray(crawlData.data)) {
      console.warn('Dati di crawl non validi o vuoti:', JSON.stringify(crawlData).substring(0, 500));
      return [];
    }
    
    console.log(`Numero di pagine nei dati di crawl: ${crawlData.data.length}`);
    
    const bandiEstratti: Bando[] = [];
    const bandiUrls = new Set<string>(); // Per evitare duplicati
    
    // Migliorato per debug
    let pageAnalysisStats = {
      total: crawlData.data.length,
      processati: 0,
      identificatiComeBandi: 0,
      estrattiConSuccesso: 0,
      ignoratiNonBandi: 0,
      errori: 0
    };
    
    // Strategia migliorata per MIMIT
    const isMimitData = crawlData.data.some((page: any) => 
      page.url && page.url.includes('mimit.gov.it')
    );
    
    for (const page of crawlData.data) {
      try {
        pageAnalysisStats.processati++;
        
        if (!page.content || typeof page.content !== 'string') {
          console.log(`Pagina ignorata (contenuto mancante): ${page.url}`);
          continue;
        }
        
        // Log esteso per debug
        console.log(`\nAnalisi pagina ${pageAnalysisStats.processati}/${pageAnalysisStats.total}: ${page.url}`);
        console.log(`  Titolo: ${page.title || 'Nessun titolo'}`);
        
        // Verifica speciale per MIMIT
        const isMimitPage = page.url && page.url.includes('mimit.gov.it');
        
        // Estrazione migliorata per MIMIT
        if (isMimitPage) {
          console.log('  Pagina MIMIT identificata, applicando regole speciali di estrazione');
        }
        
        // Verifica se la pagina contiene un bando
        const isPotentialBando = isBandoPage(page.content, page.url, isMimitPage);
        
        if (!isPotentialBando) {
          console.log(`  Pagina ignorata (non sembra un bando)`);
          pageAnalysisStats.ignoratiNonBandi++;
          continue;
        }
        
        console.log('  ✓ Pagina identificata come potenziale bando');
        pageAnalysisStats.identificatiComeBandi++;
        
        // Estrazione titolo migliorata
        const titoloBando = cleanText(
          page.title || 
          extractTitleFromContent(page.content, isMimitPage) || 
          'Bando senza titolo'
        );
        
        const urlBando = page.url || '';
        
        // Filtro per evitare duplicati e titoli troppo brevi
        if (bandiUrls.has(urlBando) || titoloBando.length < 5) {
          console.log(`  Pagina ignorata (duplicato o titolo troppo breve): ${titoloBando}`);
          continue;
        }
        
        bandiUrls.add(urlBando);
        console.log(`  Estrazione dati per bando: "${titoloBando}"`);
        
        // Estrazione descrizione migliorata
        const descrizione = cleanText(extractDescription(page.content, isMimitPage));
        
        // Estrazione date migliorata
        const scadenza = extractScadenza(page.content, isMimitPage) || '2025-12-31';
        console.log(`  Scadenza estratta: ${scadenza}`);
        
        // Estrazione importi migliorata
        const importiInfo = extractImporti(page.content, isMimitPage);
        const importoMin = importiInfo.min;
        const importoMax = importiInfo.max;
        console.log(`  Importi estratti: min ${importoMin}, max ${importoMax}`);
        
        // Estrazione settori migliorata
        const settori = extractSettori(page.content, page.title || '', isMimitPage);
        console.log(`  Settori estratti: ${settori.join(', ')}`);
        
        // Determina tipo bando
        let tipo = determinaTipoBando(page.content, page.url);
        
        // Determina fonte
        let fonte = determinaFonte(page.url, page.content);
        
        // Genera un ID unico basato su URL e timestamp
        const bandoId = `scraped-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        
        // Aggiungi il bando estratto alla lista
        const bandoEstratto: Bando = {
          id: bandoId,
          titolo: titoloBando,
          fonte,
          tipo,
          settori: settori.length > 0 ? settori : ['Altro'],
          importoMin,
          importoMax,
          scadenza,
          descrizione,
          url: urlBando
        };
        
        bandiEstratti.push(bandoEstratto);
        console.log(`  ✓ Bando estratto con successo`);
        pageAnalysisStats.estrattiConSuccesso++;
        
      } catch (error) {
        console.error('  ✗ Errore nell\'elaborazione della pagina:', error);
        pageAnalysisStats.errori++;
      }
    }
    
    // Statistiche finali per debug
    console.log('\n=== STATISTICHE ESTRAZIONE BANDI ===');
    console.log(`Totale pagine analizzate: ${pageAnalysisStats.processati}/${pageAnalysisStats.total}`);
    console.log(`Pagine identificate come bandi: ${pageAnalysisStats.identificatiComeBandi}`);
    console.log(`Bandi estratti con successo: ${pageAnalysisStats.estrattiConSuccesso}`);
    console.log(`Pagine ignorate (non bandi): ${pageAnalysisStats.ignoratiNonBandi}`);
    console.log(`Errori durante l'estrazione: ${pageAnalysisStats.errori}`);
    console.log('=====================================');
    
    console.log(`Totale bandi estratti: ${bandiEstratti.length}`);
    
    if (bandiEstratti.length === 0) {
      console.warn('Nessun bando estratto dai dati di crawl');
      
      // Se non sono stati trovati bandi ma è MIMIT, facciamo un tentativo speciale per i casi di formattazione particolare
      if (isMimitData) {
        console.log('Tentativo speciale di estrazione per MIMIT...');
        const bandiFallback = this.extractMimitBandiFallback(crawlData.data);
        
        if (bandiFallback.length > 0) {
          console.log(`Trovati ${bandiFallback.length} bandi con metodo fallback MIMIT`);
          bandiEstratti.push(...bandiFallback);
        }
      }
    } else {
      console.log('Primi 2 bandi estratti:', JSON.stringify(bandiEstratti.slice(0, 2)));
    }
    
    // Salva i bandi estratti
    this.saveScrapedBandi(bandiEstratti);
    return bandiEstratti;
  }
  
  private static extractMimitBandiFallback(pages: any[]): Bando[] {
    console.log('Avvio estrazione fallback MIMIT');
    const results: Bando[] = [];
    
    // Per MIMIT, consideriamo tutte le pagine come potenziali bandi e proviamo ad estrarre informazioni
    for (const page of pages) {
      try {
        if (!page.content || !page.url || !page.url.includes('mimit.gov.it')) continue;
        
        // Se è la pagina principale degli incentivi, cerchiamo i link ai bandi
        if (page.url.includes('incentivi-in-evidenza') || page.url.includes('incentivi-mise')) {
          console.log('Analisi pagina principale incentivi MIMIT');
          
          // Estrazione di tutti i link della pagina
          const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
          let match;
          
          while ((match = linkRegex.exec(page.content)) !== null) {
            const url = match[1];
            const text = match[2].replace(/<[^>]+>/g, '').trim();
            
            // Filtriamo solo i link che sembrano bandi
            if (text.length > 10 && 
                (text.includes('bando') || text.includes('incentiv') || 
                 text.includes('agevolazion') || text.includes('contribut'))) {
              
              console.log(`Link bando trovato: ${text} (${url})`);
              
              // Costruiamo un bando base dai dati disponibili
              const bandoId = `mimit-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
              
              results.push({
                id: bandoId,
                titolo: text,
                fonte: 'Ministero delle Imprese e del Made in Italy',
                tipo: 'statale',
                settori: ['Imprese'],
                importoMin: 50000,
                importoMax: 500000,
                scadenza: '2025-12-31', // Data predefinita
                descrizione: `Bando del MIMIT: ${text}. Visita la pagina per maggiori dettagli.`,
                url: url.startsWith('http') ? url : `https://www.mimit.gov.it${url}`
              });
            }
          }
        } else {
          // Per le singole pagine di bandi, estraiamo le informazioni base
          const title = page.title || extractTitleFromContent(page.content, true) || 'Bando MIMIT';
          
          // Solo se il titolo sembra rilevante
          if (title.length > 5 && 
              (title.includes('bando') || title.includes('incentiv') || 
               title.includes('agevolazion') || title.includes('contribut') ||
               title.includes('fondo') || title.includes('finanziament'))) {
            
            console.log(`Pagina singola bando MIMIT: ${title}`);
            
            const bandoId = `mimit-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            results.push({
              id: bandoId,
              titolo: title,
              fonte: 'Ministero delle Imprese e del Made in Italy',
              tipo: 'statale',
              settori: extractSettori(page.content, title, true),
              importoMin: 50000,
              importoMax: 1000000,
              scadenza: extractScadenza(page.content, true) || '2025-12-31',
              descrizione: extractDescription(page.content, true),
              url: page.url
            });
          }
        }
      } catch (error) {
        console.error('Errore in extractMimitBandiFallback:', error);
      }
    }
    
    console.log(`Estrazione fallback MIMIT completata: ${results.length} bandi trovati`);
    return results;
  }

  static saveScrapedBandi(bandi: Bando[]): void {
    try {
      localStorage.setItem(this.SCRAPED_BANDI_STORAGE_KEY, JSON.stringify(bandi));
      console.log('Bandi estratti salvati in localStorage:', bandi.length);
      
      // Verifica che i dati siano stati salvati correttamente
      const verificaBandi = localStorage.getItem(this.SCRAPED_BANDI_STORAGE_KEY);
      if (verificaBandi) {
        const bandiSalvati = JSON.parse(verificaBandi);
        console.log('Verifica salvataggio: trovati', bandiSalvati.length, 'bandi in localStorage');
      } else {
        console.error('Errore: i bandi non sono stati salvati in localStorage');
      }
    } catch (error) {
      console.error('Errore nel salvataggio dei bandi estratti:', error);
    }
  }

  static getScrapedBandi(): Bando[] {
    try {
      const bandiJson = localStorage.getItem(this.SCRAPED_BANDI_STORAGE_KEY);
      if (!bandiJson) {
        console.log('Nessun bando estratto trovato in localStorage');
        return [];
      }
      
      const bandi = JSON.parse(bandiJson) as Bando[];
      console.log('Bandi estratti recuperati da localStorage:', bandi.length);
      console.log('Primi 2 bandi recuperati:', JSON.stringify(bandi.slice(0, 2)));
      return bandi;
    } catch (error) {
      console.error('Errore nel parsing dei bandi estratti:', error);
      return [];
    }
  }

  static deleteScrapedBando(id: string): void {
    const bandiJson = localStorage.getItem(this.SCRAPED_BANDI_STORAGE_KEY);
    if (!bandiJson) return;
    
    try {
      let bandi = JSON.parse(bandiJson) as Bando[];
      const updatedBandi = bandi.filter(bando => bando.id !== id);
      localStorage.setItem(this.SCRAPED_BANDI_STORAGE_KEY, JSON.stringify(updatedBandi));
      console.log('Bando estratto eliminato, ID:', id);
    } catch (error) {
      console.error('Errore nell\'eliminazione del bando estratto:', error);
    }
  }

  static clearScrapedBandi(): void {
    localStorage.removeItem(this.SCRAPED_BANDI_STORAGE_KEY);
    console.log('Tutti i bandi estratti sono stati eliminati');
  }

  static clearAllSavedBandi(): void {
    localStorage.removeItem(this.SAVED_BANDI_STORAGE_KEY);
    console.log('Tutti i bandi salvati sono stati eliminati');
  }

  static saveBandi(bandi: Bando[]): void {
    const existingBandiJson = localStorage.getItem(this.SAVED_BANDI_STORAGE_KEY);
    let existingBandi: Bando[] = [];
    
    if (existingBandiJson) {
      try {
        existingBandi = JSON.parse(existingBandiJson);
      } catch (error) {
        console.error('Errore nel parsing dei bandi salvati:', error);
      }
    }
    
    const mergedBandi = [...existingBandi];
    for (const bando of bandi) {
      if (!mergedBandi.some(b => b.id === bando.id)) {
        mergedBandi.push(bando);
      }
    }
    
    localStorage.setItem(this.SAVED_BANDI_STORAGE_KEY, JSON.stringify(mergedBandi));
    console.log('Bandi salvati nel localStorage:', mergedBandi.length);
    
    this.clearScrapedBandi();
  }

  static getSavedBandi(): Bando[] {
    const bandiJson = localStorage.getItem(this.SAVED_BANDI_STORAGE_KEY);
    if (!bandiJson) {
      return [];
    }
    
    try {
      const savedBandi = JSON.parse(bandiJson);
      return savedBandi;
    } catch (error) {
      console.error('Errore nel parsing dei bandi salvati:', error);
      return [];
    }
  }

  static getAllBandi(): Bando[] {
    const savedBandi = this.getSavedBandi();
    const scrapedBandi = this.getScrapedBandi();
    
    const allBandi = [...savedBandi];
    for (const bando of scrapedBandi) {
      if (!allBandi.some(b => b.id === bando.id)) {
        allBandi.push(bando);
      }
    }
    
    return allBandi;
  }

  static deleteBando(id: string): void {
    const scrapedBandi = this.getScrapedBandi();
    if (scrapedBandi.some(bando => bando.id === id)) {
      this.deleteScrapedBando(id);
      return;
    }
    
    const bandiJson = localStorage.getItem(this.SAVED_BANDI_STORAGE_KEY);
    if (!bandiJson) return;
    
    try {
      let savedBandi = JSON.parse(bandiJson) as Bando[];
      savedBandi = savedBandi.filter(bando => bando.id !== id);
      localStorage.setItem(this.SAVED_BANDI_STORAGE_KEY, JSON.stringify(savedBandi));
      console.log('Bando salvato eliminato, ID:', id);
    } catch (error) {
      console.error('Errore nell\'eliminazione del bando salvato:', error);
    }
  }

  static markSourceAsScraped(sourceId: string): void {
    const scrapedSourcesJson = localStorage.getItem(this.SCRAPED_SOURCES_STORAGE_KEY);
    let scrapedSources: string[] = [];
    
    if (scrapedSourcesJson) {
      try {
        scrapedSources = JSON.parse(scrapedSourcesJson);
      } catch (error) {
        console.error('Errore nel parsing delle fonti scrappate:', error);
      }
    }
    
    if (!scrapedSources.includes(sourceId)) {
      scrapedSources.push(sourceId);
      localStorage.setItem(this.SCRAPED_SOURCES_STORAGE_KEY, JSON.stringify(scrapedSources));
    }
  }

  static isSourceScraped(sourceId: string): boolean {
    const scrapedSourcesJson = localStorage.getItem(this.SCRAPED_SOURCES_STORAGE_KEY);
    if (!scrapedSourcesJson) return false;
    
    try {
      const scrapedSources = JSON.parse(scrapedSourcesJson);
      return scrapedSources.includes(sourceId);
    } catch (error) {
      console.error('Errore nel parsing delle fonti scrappate:', error);
      return false;
    }
  }

  static resetScrapedSources(): void {
    localStorage.removeItem(this.SCRAPED_SOURCES_STORAGE_KEY);
  }

  static getNextUnscrapedSource(fonti: Fonte[]): Fonte | null {
    for (const fonte of fonti) {
      if (fonte.stato === 'attivo' && !this.isSourceScraped(fonte.id)) {
        return fonte;
      }
    }
    return null;
  }

  static saveFonti(fonti: Fonte[]): void {
    localStorage.setItem(this.SAVED_FONTI_STORAGE_KEY, JSON.stringify(fonti));
    console.log('Fonti salvate nel localStorage:', fonti.length);
  }

  static getSavedFonti(): Fonte[] {
    const fontiJson = localStorage.getItem(this.SAVED_FONTI_STORAGE_KEY);
    if (!fontiJson) {
      return [];
    }
    
    try {
      return JSON.parse(fontiJson) as Fonte[];
    } catch (error) {
      console.error('Errore nel parsing delle fonti salvate:', error);
      return [];
    }
  }

  static generateFonteFromRawData(data: any) {
    return {
      id: uuidv4(),
      nome: data.nome || 'Fonte senza nome',
      url: data.url || '',
      tipo: determineFonteType(data.url || '')
    };
  }

  static determineFonteType = determineFonteType;
}

function isBandoPage(content: string, url: string, isMimitPage: boolean = false): boolean {
  // Controllo più intelligente per MIMIT
  if (isMimitPage) {
    // Per MIMIT, controlliamo più a fondo la pagina
    console.log('  Applicando regole speciali MIMIT per identificazione bando');
    
    // URL contiene incentivi o bandi
    if (url.includes('/incentivi/') || url.includes('/bandi/')) {
      console.log('  ✓ URL contiene /incentivi/ o /bandi/');
      return true;
    }
    
    // Controllo speciale per pagine singole di bandi
    if (url.includes('it/incentivi-mise/') || url.includes('it/bandi/')) {
      console.log('  ✓ URL contiene percorso incentivi-mise');
      return true;
    }
  }
  
  // Verifica se è una pagina di bando basata su parole chiave
  const keywords = [
    'incentiv', 'bando', 'finanziament', 'contribut', 'agevolazion', 'sostegno',
    'voucher', 'fondi', 'bonus', 'credito d\'imposta', 'misura', 'impresa',
    'sovvenzion', 'pnrr', 'investiment'
  ];
  
  // Parole chiave specifiche per bandi italiani
  const keywordsIt = [
    'scadenza', 'beneficiari', 'soggetti ammissibili', 'spese ammissibili',
    'dotazione finanziaria', 'progetti ammissibili', 'presentazione domande'
  ];
  
  // Unisci tutte le parole chiave
  const allKeywords = [...keywords, ...keywordsIt];
  
  const contentLower = content.toLowerCase();
  
  // Conta quante parole chiave sono presenti
  let keywordCount = 0;
  for (const keyword of allKeywords) {
    if (contentLower.includes(keyword)) {
      keywordCount++;
    }
  }
  
  // Se ci sono almeno 3 parole chiave diverse, è probabilmente un bando
  if (keywordCount >= 3) {
    console.log(`  ✓ Trovate ${keywordCount} parole chiave di bando`);
    return true;
  }
  
  // Controlli più specifici per formati standard
  if (contentLower.includes('scadenza') && 
      (contentLower.includes('euro') || contentLower.includes('€')) &&
      (contentLower.includes('impres') || contentLower.includes('aziend'))) {
    console.log('  ✓ Trovata combinazione di scadenza, importo e beneficiari');
    return true;
  }
  
  console.log('  ✗ Nessun criterio di bando soddisfatto');
  return false;
}

function cleanText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/<[^>]+>/g, ' ')  // Rimuovi tag HTML
    .replace(/\s+/g, ' ')     // Sostituisci spazi multipli con uno spazio
    .replace(/[\r\n\t]+/g, ' ') // Rimuovi ritorni a capo e tab
    .trim();
}

function extractTitleFromContent(content: string, isMimitPage: boolean = false): string {
  // Strategie diverse di estrazione del titolo
  
  // Estrattori generici
  const extractors = [
    // H1
    () => {
      const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
      return h1Match ? cleanText(h1Match[1]) : null;
    },
    // H2 (spesso usato come titolo effettivo)
    () => {
      const h2Match = content.match(/<h2[^>]*>(.*?)<\/h2>/i);
      return h2Match ? cleanText(h2Match[1]) : null;
    },
    // Classe titolo
    () => {
      const titleClassMatch = content.match(/<[^>]*class="[^"]*(?:titolo|title)[^"]*"[^>]*>(.*?)<\/[^>]*>/i);
      return titleClassMatch ? cleanText(titleClassMatch[1]) : null;
    }
  ];
  
  // Estrattori specifici per MIMIT
  if (isMimitPage) {
    extractors.unshift(
      // Elementi page-title di MIMIT
      () => {
        const mimitTitleMatch = content.match(/<div[^>]*class="[^"]*page-title[^"]*"[^>]*>(.*?)<\/div>/i);
        return mimitTitleMatch ? cleanText(mimitTitleMatch[1]) : null;
      },
      // Elementi title-incentive di MIMIT
      () => {
        const mimitIncentiveMatch = content.match(/<div[^>]*class="[^"]*title-incentive[^"]*"[^>]*>(.*?)<\/div>/i);
        return mimitIncentiveMatch ? cleanText(mimitIncentiveMatch[1]) : null;
      }
    );
  }
  
  // Prova ogni estrattore finché non ne trovi uno che funziona
  for (const extractor of extractors) {
    const result = extractor();
    if (result && result.length > 3) {
      return result;
    }
  }
  
  // Se non è stato trovato un titolo specifico, estrai le prime parole significative
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 3);
  return words.slice(0, 8).join(' ');
}

function extractDescription(content: string, isMimitPage: boolean = false): string {
  // Rimuovi tag HTML e mantieni solo testo
  const textContent = content.replace(/<[^>]+>/g, ' ');
  
  // Per MIMIT, cerca sezioni specifiche
  if (isMimitPage) {
    // Cerca nelle classi comuni di MIMIT
    const mimitSectionMatches = [
      /<div[^>]*class="[^"]*content-incentive[^"]*"[^>]*>(.*?)<\/div>/is,
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>(.*?)<\/div>/is,
      /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>(.*?)<\/div>/is
    ];
    
    for (const regex of mimitSectionMatches) {
      const match = content.match(regex);
      if (match && match[1]) {
        const cleanDesc = cleanText(match[1]);
        if (cleanDesc.length > 30) {
          return cleanDesc.substring(0, 500);
        }
      }
    }
  }
  
  // Cerca di estrarre una descrizione sensata
  const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 30);
  if (sentences.length > 0) {
    const description = sentences.slice(0, 4).join('. ');
    return description.substring(0, 500) + (description.length > 500 ? '...' : '');
  }
  
  return textContent.substring(0, 300) + '...';
}

function extractScadenza(content: string, isMimitPage: boolean = false): string | null {
  const contentLower = content.toLowerCase();
  
  // Per MIMIT, cerca frasi specifiche
  if (isMimitPage) {
    // Pattern comuni per MIMIT
    const mimitPatterns = [
      /scadenza[^\d]*(3[01]|[12][0-9]|0?[1-9])[\/\-\.]?(1[012]|0?[1-9])[\/\-\.]?(20\d{2})/i,
      /termine[^\d]*(3[01]|[12][0-9]|0?[1-9])[\/\-\.]?(1[012]|0?[1-9])[\/\-\.]?(20\d{2})/i,
      /presentare[^.]*entro[^\d]*(3[01]|[12][0-9]|0?[1-9])[\/\-\.]?(1[012]|0?[1-9])[\/\-\.]?(20\d{2})/i
    ];
    
    for (const pattern of mimitPatterns) {
      const match = contentLower.match(pattern);
      if (match) {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = match[3];
        return `${year}-${month}-${day}`;
      }
    }
  }
  
  // Estrai date in formato italiano (gg/mm/aaaa o gg-mm-aaaa)
  const italianDateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g;
  const dateMatches = [...contentLower.matchAll(italianDateRegex)];
  
  // Parole chiave che indicano una scadenza
  const scadenzaKeywords = ['scadenza', 'termine', 'entro il', 'fino al', 'data limite', 'chiusura'];
  
  // Cerca date vicino alle parole chiave di scadenza
  for (const keyword of scadenzaKeywords) {
    const keywordIndex = contentLower.indexOf(keyword);
    if (keywordIndex >= 0) {
      // Cerca una data entro 150 caratteri dalla parola chiave
      const nearbyContent = contentLower.substring(keywordIndex, keywordIndex + 150);
      const nearbyDateMatches = [...nearbyContent.matchAll(italianDateRegex)];
      
      if (nearbyDateMatches.length > 0) {
        const match = nearbyDateMatches[0];
        let year = parseInt(match[3]);
        if (year < 100) {
          year += 2000; // Assumiamo che anni a 2 cifre siano nel 2000
        }
        
        // Verifica se la data è valida
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        
        if (day > 0 && day <= 31 && month > 0 && month <= 12) {
          // Formato ISO: YYYY-MM-DD
          return `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        }
      }
    }
  }
  
  // Se non trova date specifiche di scadenza, usa la prima data futura trovata
  if (dateMatches.length > 0) {
    const today = new Date();
    
    for (const match of dateMatches) {
      let year = parseInt(match[3]);
      if (year < 100) {
        year += 2000;
      }
      
      const month = parseInt(match[2]);
      const day = parseInt(match[1]);
      
      if (month > 0 && month <= 12 && day > 0 && day <= 31) {
        const date = new Date(year, month - 1, day);
        
        if (date > today) {
          // Formato ISO: YYYY-MM-DD
          return `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        }
      }
    }
  }
  
  // Cerca per date in formato testuale in italiano
  const monthsIt = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 
                   'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  
  for (const keyword of scadenzaKeywords) {
    const keywordIndex = contentLower.indexOf(keyword);
    if (keywordIndex >= 0) {
      const textAfterKeyword = contentLower.substring(keywordIndex, keywordIndex + 200);
      
      for (let i = 0; i < monthsIt.length; i++) {
        const monthName = monthsIt[i];
        const monthIndex = textAfterKeyword.indexOf(monthName);
        
        if (monthIndex > 0) {
          const textAroundMonth = textAfterKeyword.substring(Math.max(0, monthIndex - 5), monthIndex + monthName.length + 10);
          const dayYearMatch = textAroundMonth.match(/(\d{1,2})\s+(?:di\s+)?[a-z]+\s+(\d{4})/i);
          
          if (dayYearMatch) {
            const day = parseInt(dayYearMatch[1]);
            const year = parseInt(dayYearMatch[2]);
            
            if (day > 0 && day <= 31 && year >= 2023) {
              const month = i + 1;
              return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
          }
        }
      }
    }
  }
  
  // Se non trova nessuna data, restituisce null
  return null;
}

function extractImporti(content: string, isMimitPage: boolean = false): { min: number, max: number } {
  const contentLower = content.toLowerCase();
  
  // Valori default
  let defaultMin = 50000;
  let defaultMax = 500000;
  
  // Mimit spesso ha bandi più sostanziosi
  if (isMimitPage) {
    defaultMin = 100000;
    defaultMax = 1000000;
  }
  
  // Cerca importi in vari formati (€ 1.000.000, 1.000.000 €, 1.000.000 euro, ecc.)
  const importiRegexList = [
    /(?:€|EUR|euro)\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi,
    /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:€|EUR|euro)/gi,
    /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:mln|milion[ei])/gi,
    /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:mld|miliard[oi])/gi
  ];
  
  let importiTrovati: number[] = [];
  
  for (const regex of importiRegexList) {
    const matches = [...contentLower.matchAll(regex)];
    for (const match of matches) {
      let importoStr = match[1].replace(/\./g, '').replace(/,/g, '.');
      let importo = parseFloat(importoStr);
      
      // Gestisci milioni/miliardi
      if (match[0].includes('mln') || match[0].includes('milion')) {
        importo *= 1000000;
      } else if (match[0].includes('mld') || match[0].includes('miliard')) {
        importo *= 1000000000;
      }
      
      if (!isNaN(importo) && importo > 0) {
        importiTrovati.push(importo);
      }
    }
  }
  
  // Cerca anche cifre semplici ma solo vicino a parole chiave finanziarie
  const keywordNearNumberRegex = /(?:contributo|finanziamento|importo|valore|budget|spesa|investimento)[^\d]*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi;
  const keywordMatches = [...contentLower.matchAll(keywordNearNumberRegex)];
  
  for (const match of keywordMatches) {
    let importoStr = match[1].replace(/\./g, '').replace(/,/g, '.');
    let importo = parseFloat(importoStr);
    
    if (!isNaN(importo) && importo > 1000) { // Ignora importi piccoli per evitare falsi positivi
      importiTrovati.push(importo);
    }
  }
  
  if (importiTrovati.length === 0) {
    return { min: defaultMin, max: defaultMax };
  }
  
  // Ordina gli importi trovati
  importiTrovati.sort((a, b) => a - b);
  
  // Usa l'importo più basso come min e quello più alto come max
  // Se c'è un solo importo, usiamo quello come max e un valore sensato come min
  return {
    min: importiTrovati.length > 1 ? importiTrovati[0] : Math.min(importiTrovati[0] / 5, defaultMin),
    max: importiTrovati[importiTrovati.length - 1]
  };
}

function extractSettori(content: string, title: string, isMimitPage: boolean = false): string[] {
  const contentLower = (content + ' ' + title).toLowerCase();
  
  const settoriMap: { [key: string]: string[] } = {
    'Agricoltura': ['agricol', 'rural', 'agroaliment', 'agro', 'contadin', 'coltiva'],
    'Tecnologia': ['tecnolog', 'digital', 'innova', 'ict', 'software', 'app', 'informatica', 'elettronica'],
    'Energia': ['energi', 'rinnovabil', 'sostenib', 'green', 'ambiente', 'fotovoltaic', 'solare'],
    'Industria': ['industri', 'manifattur', 'produzion', 'fabbrica', 'impiant'],
    'Startup': ['startup', 'impresa giovan', 'nuova impresa', 'giovani imprenditori'],
    'Turismo': ['turism', 'albergh', 'ospitalità', 'ricettiv', 'viaggi'],
    'Commercio': ['commerc', 'negozi', 'vendita', 'retail', 'distribuzione'],
    'Ricerca': ['ricerca', 'sviluppo', 'r&d', 'r&s', 'innovazione', 'brevett'],
    'Formazione': ['formazione', 'scuola', 'istruzione', 'didattica', 'apprendimento'],
    'Sanità': ['sanità', 'salute', 'medic', 'ospedal', 'cura', 'benessere'],
    'Artigianato': ['artigian', 'artigianal', 'manufatt', 'bottega', 'artigianel'],
    'PMI': ['pmi', 'piccole e medie', 'piccola impresa', 'media impresa', 'microimpresa']
  };
  
  // Settori aggiuntivi per MIMIT
  if (isMimitPage) {
    settoriMap['Made in Italy'] = ['made in italy', 'eccellenz', 'italian', 'qualità italiana'];
    settoriMap['Internazionalizzazione'] = ['internazional', 'export', 'ester', 'mercat'];
    settoriMap['Ricerca e Innovazione'] = ['ricerca', 'innovazion', 'r&s', 'sviluppo', 'sperimentazion'];
  }
  
  const settoriTrovati: string[] = [];
  
  for (const [settore, keywords] of Object.entries(settoriMap)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      settoriTrovati.push(settore);
    }
  }
  
  return settoriTrovati.length > 0 ? settoriTrovati : ['Altro'];
}

function determinaTipoBando(content: string, url: string): 'europeo' | 'statale' | 'regionale' | 'altro' {
  const contentLower = content.toLowerCase();
  const urlLower = url.toLowerCase();
  
  if (contentLower.includes('europa') || contentLower.includes('ue') || 
      contentLower.includes('eu') || contentLower.includes('commission') ||
      contentLower.includes('horizont') || contentLower.includes('erasmus') ||
      urlLower.includes('europa.eu')) {
    return 'europeo';
  }
  
  if (contentLower.includes('region') || urlLower.includes('regione')) {
    return 'regionale';
  }
  
  // Se include MIMIT o altri ministeri, probabilmente è statale
  if (urlLower.includes('mimit.gov.it') || 
      urlLower.includes('mise.gov.it') ||
      contentLower.includes('minist') ||
      contentLower.includes('gov.it') ||
      contentLower.includes('pnrr')) {
    return 'statale';
  }
  
  return 'altro';
}

function determinaFonte(url: string, content: string): string {
  if (url.includes('mimit.gov.it') || url.includes('mise.gov.it')) {
    return 'Ministero delle Imprese e del Made in Italy';
  }
  
  if (url.includes('europa.eu')) {
    return 'Unione Europea';
  }
  
  if (url.includes('regione')) {
    // Cerca di identificare la regione specifica
    const regioniItaliane = [
      'Lombardia', 'Lazio', 'Campania', 'Sicilia', 'Veneto', 'Emilia-Romagna', 
      'Piemonte', 'Puglia', 'Toscana', 'Calabria', 'Sardegna', 'Liguria', 
      'Marche', 'Abruzzo', 'Friuli-Venezia Giulia', 'Trentino-Alto Adige', 
      'Umbria', 'Basilicata', 'Molise', 'Valle d\'Aosta'
    ];
    
    for (const regione of regioniItaliane) {
      if (url.toLowerCase().includes(regione.toLowerCase()) || 
          content.toLowerCase().includes(regione.toLowerCase())) {
        return `Regione ${regione}`;
      }
    }
    
    return 'Regione Italiana';
  }
  
  // Estrai il dominio come fonte
  const domainMatch = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/);
  if (domainMatch && domainMatch[1]) {
    return domainMatch[1];
  }
  
  return 'Altra Fonte';
}

export { determineFonteType };
