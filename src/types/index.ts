export interface Bando {
  id: string;
  titolo: string;
  descrizione: string;
  fonte: string;
  scadenza: string | Date;
  tipo: string;
  url?: string;
  settori?: string[];
  created_at?: string;
  importo_min?: number;
  importo_max?: number;
  budget_disponibile?: string;
  data_estrazione?: string | Date;
  descrizione_completa?: string;
  scadenza_dettagliata?: string;
  requisiti?: string;
  modalita_presentazione?: string;
  ultimi_aggiornamenti?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  settore: string;
  regione: string;
  created_at?: string;
  interessisettoriali?: string[];
  telefono?: string;
  provincia?: string;
  fatturato?: number;
  dipendenti?: number;
  annofondazione?: number;
  formagiuridica?: string;
  codiceateco?: string;
}

export interface Match {
  id: string;
  clienteId: string;
  bandoId: string;
  compatibilita: number;
  notificato: boolean;
  created_at?: string;
  updated_at?: string;
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
