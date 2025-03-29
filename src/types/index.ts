

export interface Bando {
  id: string;
  titolo: string;
  descrizione: string;
  descrizione_completa?: string;
  descrizioneCompleta?: string;
  fonte: string;
  scadenza: string;
  scadenza_dettagliata?: string;
  scadenzaDettagliata?: string;
  tipo: string;
  url?: string;
  settori?: string[];
  created_at?: string;
  importo_min?: number;
  importoMin?: number;
  importo_max?: number;
  importoMax?: number;
  budget_disponibile?: string;
  budgetDisponibile?: string;
  data_estrazione?: string;
  dataEstrazione?: string;
  requisiti?: string;
  modalita_presentazione?: string;
  modalitaPresentazione?: string;
  ultimi_aggiornamenti?: string;
  ultimiAggiornamenti?: string;
}

export type TipoBando = 'europeo' | 'statale' | 'regionale' | 'altro';

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  settore: string;
  regione: string;
  provincia: string;
  created_at?: string;
  interessisettoriali?: string[];
  interessiSettoriali?: string[];
  telefono?: string;
  fatturato?: number;
  dipendenti?: number;
  annofondazione?: number;
  annoFondazione?: number;
  formagiuridica?: string;
  formaGiuridica?: string;
  codiceateco?: string;
  codiceATECO?: string;
  // Nuovi campi per il matching avanzato
  esperienzaFinanziamenti?: string;
  tecnologieSpecifiche?: string;
  criteriESG?: string;
  capacitaRD?: string;
  presenzaInternazionale?: string;
  faseDiCrescita?: 'startup' | 'scaleup' | 'matura' | 'consolidata';
  stabilitaFinanziaria?: string;
  competenzeDipendenti?: string;
  partnership?: string;
  certificazioni?: string;
}

export interface Match {
  id: string;
  clienteId: string;
  bandoId: string;
  compatibilita: number;
  notificato: boolean;
  created_at?: string;
  updated_at?: string;
  archiviato?: boolean;
  bando_titolo?: string; 
  cliente_nome?: string;
  data_creazione?: string;
}

export interface Statistica {
  bandiAttivi: number;
  numeroClienti: number;
  matchRecenti: number;
  distribuzioneBandi: {
    europei: number;
    statali: number;
    regionali: number;
  };
  bandoPerSettore: { settore: string, percentuale: number }[];
  matchPerCliente: { cliente: string, percentuale: number }[];
}

export interface Fonte {
  id: string;
  nome: string;
  url: string;
  tipo: string;
  stato?: string;
}

// Interface for data items used in charts
export interface DataItem {
  [key: string]: string | number;
}

export interface ReportAnalisiTemporale extends DataItem {
  periodo: string;
  matchGenerati: number;
  bandiScaduti: number;
}

export interface ReportPerformanceMatch extends DataItem {
  cliente: string;
  matchGenerati: number;
  matchAlta: number;
  matchMedia: number;
  matchBassa: number;
}

