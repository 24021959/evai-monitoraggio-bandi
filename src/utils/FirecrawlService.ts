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
      const crawlOptions = {
        limit: isMimitUrl ? 200 : 100, // Aumenta il limite per MIMIT
        maxDepth: isMimitUrl ? 3 : 2,  // Aumenta la profondità per MIMIT
        scrapeOptions: {
          formats: ['markdown', 'html'],
          selectors: isMimitUrl ? [
            // Selettori specifici per MIMIT
            '.container',
            '.incentive-card',
            '.card-title',
            '.incentivi-block',
            '.article-content'
          ] : undefined
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
      console.log('Dati del crawl (riassunto):', JSON.stringify({
        completed: crawlResponse.completed,
        total: crawlResponse.total,
        dataLength: crawlResponse.data?.length || 0,
        status: crawlResponse.status
      }));
      
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

  static async extractBandiFromCrawlData(crawlData: any): Promise<Bando[]> {
    console.log('Inizio estrazione bandi da crawlData');
    
    if (!crawlData || !crawlData.data || !Array.isArray(crawlData.data)) {
      console.warn('Dati di crawl non validi o vuoti:', JSON.stringify(crawlData).substring(0, 500));
      return [];
    }
    
    console.log(`Numero di pagine nei dati di crawl: ${crawlData.data.length}`);
    
    const bandiEstratti = [];
    const bandiUrls = new Set(); // Per evitare duplicati
    
    for (const page of crawlData.data) {
      try {
        if (page.content && typeof page.content === 'string') {
          console.log(`Analisi pagina: ${page.url}`);
          
          // Ignora pagine che non sembrano essere pagine di bandi
          if (!isBandoPage(page.content, page.url)) {
            console.log(`Pagina ignorata (non sembra un bando): ${page.url}`);
            continue;
          }
          
          const titoloBando = cleanText(page.title || extractTitleFromContent(page.content) || 'Bando senza titolo');
          const urlBando = page.url || '';
          
          // Evita duplicati
          if (bandiUrls.has(urlBando) || titoloBando.length < 10) {
            continue;
          }
          bandiUrls.add(urlBando);
          
          const descrizione = cleanText(extractDescription(page.content));
          
          // Estrai date in formato italiano e converte in formato ISO
          const scadenza = extractScadenza(page.content) || '2025-12-31';
          
          // Estrai importi
          const importiInfo = extractImporti(page.content);
          const importoMin = importiInfo.min;
          const importoMax = importiInfo.max;
          
          // Determina settori
          const settori = extractSettori(page.content, page.title);
          
          // Determina tipo bando
          let tipo = determinaTipoBando(page.content, page.url);
          
          // Determina fonte
          let fonte = determinaFonte(page.url, page.content);
          
          // Genera un ID unico basato su URL e timestamp
          const bandoId = `scraped-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
          
          console.log(`Bando estratto: "${titoloBando.substring(0, 50)}..." (${fonte})`);
          
          bandiEstratti.push({
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
          });
        }
      } catch (error) {
        console.error('Errore nell\'elaborazione della pagina:', error);
      }
    }
    
    console.log(`Totale bandi estratti: ${bandiEstratti.length}`);
    if (bandiEstratti.length === 0) {
      console.warn('Nessun bando estratto dai dati di crawl');
    } else {
      console.log('Primi 2 bandi estratti:', JSON.stringify(bandiEstratti.slice(0, 2), null, 2));
    }
    
    // Salva i bandi estratti
    this.saveScrapedBandi(bandiEstratti);
    return bandiEstratti;
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
}

function isBandoPage(content: string, url: string): boolean {
  // Verifica se è una pagina di bando basata su parole chiave
  const keywords = [
    'incentiv', 'bando', 'finanziament', 'contribut', 'agevolazion', 'sostegno',
    'voucher', 'fondi', 'bonus', 'credito d\'imposta', 'misura', 'impresa'
  ];
  
  const contentLower = content.toLowerCase();
  const hasKeywords = keywords.some(keyword => contentLower.includes(keyword));
  
  // Verifica speciale per MIMIT
  const isMimitIncentive = url.includes('mimit.gov.it') && 
                          (url.includes('incentivi') || url.includes('bandi'));
  
  return hasKeywords || isMimitIncentive;
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .trim();
}

function extractTitleFromContent(content: string): string {
  // Cerca titoli H1 o elementi con class="titolo"
  const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    return cleanText(h1Match[1].replace(/<[^>]+>/g, ''));
  }
  
  const titleClassMatch = content.match(/<[^>]*class="[^"]*titolo[^"]*"[^>]*>(.*?)<\/[^>]*>/i);
  if (titleClassMatch && titleClassMatch[1]) {
    return cleanText(titleClassMatch[1].replace(/<[^>]+>/g, ''));
  }
  
  // Se non trova titoli specifici, estrai le prime parole significative
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 3);
  return words.slice(0, 8).join(' ');
}

function extractDescription(content: string): string {
  // Rimuovi tag HTML e mantieni solo testo
  const textContent = content.replace(/<[^>]+>/g, ' ');
  
  // Cerca di estrarre una descrizione sensata
  const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 30);
  if (sentences.length > 0) {
    const description = sentences.slice(0, 3).join('. ');
    return description.substring(0, 350) + (description.length > 350 ? '...' : '');
  }
  
  return textContent.substring(0, 300) + '...';
}

function extractScadenza(content: string): string | null {
  // Estrai date in formato italiano (gg/mm/aaaa o gg-mm-aaaa)
  const italianDateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g;
  const dateMatches = [...content.matchAll(italianDateRegex)];
  
  const contentLower = content.toLowerCase();
  const scadenzaKeywords = ['scadenza', 'termine', 'entro il', 'fino al', 'data limite'];
  
  // Cerca date vicine alle parole chiave di scadenza
  for (const keyword of scadenzaKeywords) {
    const keywordIndex = contentLower.indexOf(keyword);
    if (keywordIndex >= 0) {
      // Cerca una data nelle vicinanze della parola chiave
      const nearbyContent = content.substring(keywordIndex, keywordIndex + 100);
      const nearbyDateMatches = [...nearbyContent.matchAll(italianDateRegex)];
      
      if (nearbyDateMatches.length > 0) {
        const match = nearbyDateMatches[0];
        let year = parseInt(match[3]);
        if (year < 100) {
          year += 2000; // Assumiamo che anni a 2 cifre siano nel 2000
        }
        
        // Formato ISO: YYYY-MM-DD
        const month = match[2].padStart(2, '0');
        const day = match[1].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
  }
  
  // Se non trova date specifiche di scadenza, usa la prima data futura trovata
  if (dateMatches.length > 0) {
    for (const match of dateMatches) {
      let year = parseInt(match[3]);
      if (year < 100) {
        year += 2000;
      }
      
      const month = parseInt(match[2]);
      const day = parseInt(match[1]);
      
      if (month > 0 && month <= 12 && day > 0 && day <= 31) {
        const date = new Date(year, month - 1, day);
        const now = new Date();
        
        if (date > now) {
          // Formato ISO: YYYY-MM-DD
          return `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
        }
      }
    }
  }
  
  // Se non trova nessuna data futura, restituisce null
  return null;
}

function extractImporti(content: string): { min: number, max: number } {
  const contentLower = content.toLowerCase();
  
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
    // Se non trova importi, usa valori default
    return { min: 50000, max: 500000 };
  }
  
  // Ordina gli importi trovati
  importiTrovati.sort((a, b) => a - b);
  
  // Usa l'importo più basso come min e quello più alto come max
  return {
    min: importiTrovati[0],
    max: importiTrovati[importiTrovati.length - 1]
  };
}

function extractSettori(content: string, title: string): string[] {
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
    'Artigianato': ['artigian', 'artigianal', 'manufatt', 'bottega', 'artigianel']
  };
  
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
      contentLower.includes('gov.it')) {
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

