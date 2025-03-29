
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

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  settore: string;
  regione: string;
  created_at?: string;
  interessisettoriali?: string[];
  interessiSettoriali?: string[];
  telefono?: string;
  provincia?: string;
  fatturato?: number;
  dipendenti?: number;
  annofondazione?: number;
  annoFondazione?: number;
  formagiuridica?: string;
  formaGiuridica?: string;
  codiceateco?: string;
  codiceATECO?: string;
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
