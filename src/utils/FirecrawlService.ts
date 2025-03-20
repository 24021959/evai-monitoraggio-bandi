
import FirecrawlApp from '@mendable/firecrawl-js';
import { Bando, Fonte } from '@/types';
import { mockBandi } from '@/data/mockData';

interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
}

type CrawlResponse = CrawlStatusResponse | ErrorResponse;

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static SAVED_BANDI_STORAGE_KEY = 'saved_bandi';
  private static SCRAPED_BANDI_STORAGE_KEY = 'scraped_bandi';
  private static SCRAPED_SOURCES_STORAGE_KEY = 'scraped_sources';
  private static SAVED_FONTI_STORAGE_KEY = 'saved_fonti';
  private static firecrawlApp: FirecrawlApp | null = null;

  // API key management methods
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
      console.log('Test della API key con Firecrawl API');
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

  // Crawling methods
  static async crawlWebsite(url: string): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key non trovata' };
    }

    try {
      console.log('Richiesta di crawling a Firecrawl API');
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const crawlResponse = await this.firecrawlApp.crawlUrl(url, {
        limit: 100,
        scrapeOptions: {
          formats: ['markdown', 'html'],
        }
      }) as CrawlResponse;

      if (!crawlResponse.success) {
        console.error('Crawl fallito:', (crawlResponse as ErrorResponse).error);
        return { 
          success: false, 
          error: (crawlResponse as ErrorResponse).error || 'Impossibile eseguire il crawl del sito web' 
        };
      }

      console.log('Crawl completato con successo:', crawlResponse);
      return { 
        success: true,
        data: crawlResponse 
      };
    } catch (error) {
      console.error('Errore durante il crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Impossibile connettersi a Firecrawl API' 
      };
    }
  }

  static async extractBandiFromCrawlData(crawlData: any): Promise<Bando[]> {
    // Estrae le informazioni sui bandi dal risultato del crawl
    if (!crawlData || !crawlData.data || !Array.isArray(crawlData.data)) {
      return [];
    }
    
    const bandiEstratti = [];
    
    for (const page of crawlData.data) {
      // Estrai informazioni dai contenuti della pagina 
      if (page.content && typeof page.content === 'string') {
        const titoloBando = page.title || 'Bando senza titolo';
        const urlBando = page.url || '';
        const descrizione = page.content.substring(0, 200) + '...';
        
        // Cerca date nel formato gg/mm/aaaa
        const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g;
        const dateMatches = [...page.content.matchAll(dateRegex)];
        const scadenza = dateMatches.length > 0 
          ? `${dateMatches[0][3]}-${dateMatches[0][2].padStart(2, '0')}-${dateMatches[0][1].padStart(2, '0')}` 
          : '2025-12-31';
        
        // Cerca importi
        const importiRegex = /(?:€|EUR|euro)\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi;
        const importiMatches = [...page.content.matchAll(importiRegex)];
        const importoStr = importiMatches.length > 0 ? importiMatches[0][1].replace(/\./g, '').replace(/,/g, '.') : '0';
        const importoMax = parseFloat(importoStr) || 100000;
        
        // Determina possibili settori
        const settori = [];
        if (/agricol|rural|agroaliment/i.test(page.content)) settori.push('Agricoltura');
        if (/tecnolog|digital|innova|ict|software/i.test(page.content)) settori.push('Tecnologia');
        if (/energi|rinnovabil|sostenib/i.test(page.content)) settori.push('Energia');
        if (/industri|manifattur|produzion/i.test(page.content)) settori.push('Industria');
        if (/startup|impresa giovan|nuova impresa/i.test(page.content)) settori.push('Startup');
        
        // Determina il tipo di bando
        let tipo = 'regionale';
        if (/europ|ue|eu|commission/i.test(page.content)) tipo = 'europeo';
        if (/nazional|minis|govern/i.test(page.content)) tipo = 'statale';
        
        // Determina la fonte
        let fonte = 'Altra Fonte';
        if (/lombardia|regione/i.test(page.content)) fonte = 'Regione Lombardia';
        if (/mise|sviluppo economico/i.test(page.content)) fonte = 'MISE';
        if (/europ|ue|commission/i.test(page.content)) fonte = 'UE';
        
        bandiEstratti.push({
          id: `scraped-${bandiEstratti.length + 1}`,
          titolo: titoloBando,
          fonte,
          tipo,
          settori: settori.length > 0 ? settori : ['Altro'],
          importoMin: importoMax * 0.1,
          importoMax,
          scadenza,
          descrizione,
          url: urlBando
        });
      }
    }
    
    // Salva i bandi estratti in localStorage
    this.saveScrapedBandi(bandiEstratti);
    return bandiEstratti;
  }

  // Metodi per la gestione dei bandi estratti (temporanei)
  static saveScrapedBandi(bandi: Bando[]): void {
    localStorage.setItem(this.SCRAPED_BANDI_STORAGE_KEY, JSON.stringify(bandi));
    console.log('Bandi estratti salvati temporaneamente:', bandi.length);
  }

  static getScrapedBandi(): Bando[] {
    const bandiJson = localStorage.getItem(this.SCRAPED_BANDI_STORAGE_KEY);
    if (!bandiJson) return [];
    
    try {
      return JSON.parse(bandiJson) as Bando[];
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
      bandi = bandi.filter(bando => bando.id !== id);
      localStorage.setItem(this.SCRAPED_BANDI_STORAGE_KEY, JSON.stringify(bandi));
      console.log('Bando estratto eliminato, ID:', id);
    } catch (error) {
      console.error('Errore nell\'eliminazione del bando estratto:', error);
    }
  }

  static clearScrapedBandi(): void {
    localStorage.removeItem(this.SCRAPED_BANDI_STORAGE_KEY);
    console.log('Tutti i bandi estratti sono stati eliminati');
  }

  // Metodi per la gestione dei bandi salvati (permanenti)
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
    
    // Merge new bandi with existing ones, avoiding duplicates by ID
    const mergedBandi = [...existingBandi];
    for (const bando of bandi) {
      if (!mergedBandi.some(b => b.id === bando.id)) {
        mergedBandi.push(bando);
      }
    }
    
    localStorage.setItem(this.SAVED_BANDI_STORAGE_KEY, JSON.stringify(mergedBandi));
    console.log('Bandi salvati nel localStorage:', mergedBandi.length);
    
    // Dopo aver salvato i bandi, cancelliamo quelli estratti temporaneamente
    this.clearScrapedBandi();
  }

  static getSavedBandi(): Bando[] {
    const bandiJson = localStorage.getItem(this.SAVED_BANDI_STORAGE_KEY);
    if (!bandiJson) {
      return [...mockBandi]; // Return mock data if nothing is saved yet
    }
    
    try {
      const savedBandi = JSON.parse(bandiJson);
      return [...mockBandi, ...savedBandi]; // Combine mock and saved bandi
    } catch (error) {
      console.error('Errore nel parsing dei bandi salvati:', error);
      return [...mockBandi];
    }
  }

  static getAllBandi(): Bando[] {
    // Combina i bandi salvati e quelli estratti
    const savedBandi = this.getSavedBandi();
    const scrapedBandi = this.getScrapedBandi();
    
    // Evita duplicati basandosi sull'ID
    const allBandi = [...savedBandi];
    for (const bando of scrapedBandi) {
      if (!allBandi.some(b => b.id === bando.id)) {
        allBandi.push(bando);
      }
    }
    
    return allBandi;
  }

  static deleteBando(id: string): void {
    // Prima controlla se è un bando estratto
    const scrapedBandi = this.getScrapedBandi();
    if (scrapedBandi.some(bando => bando.id === id)) {
      this.deleteScrapedBando(id);
      return;
    }
    
    // Altrimenti è un bando salvato
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
  
  // Metodi per la gestione delle fonti scrappate
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

  // Metodi per la gestione delle fonti
  static saveFonti(fonti: Fonte[]): void {
    localStorage.setItem(this.SAVED_FONTI_STORAGE_KEY, JSON.stringify(fonti));
    console.log('Fonti salvate nel localStorage:', fonti.length);
  }

  static getSavedFonti(): Fonte[] {
    const fontiJson = localStorage.getItem(this.SAVED_FONTI_STORAGE_KEY);
    if (!fontiJson) {
      return []; // Non usiamo i mockFonti, ritorniamo un array vuoto
    }
    
    try {
      return JSON.parse(fontiJson) as Fonte[];
    } catch (error) {
      console.error('Errore nel parsing delle fonti salvate:', error);
      return [];
    }
  }
}
