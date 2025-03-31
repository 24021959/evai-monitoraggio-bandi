
export interface Bando {
  id: string;
  titolo: string;
  descrizione?: string;
  descrizioneCompleta?: string;
  fonte: string;
  url?: string;
  tipo: string;
  settori?: string[];
  importoMin?: number;
  importoMax?: number;
  budgetDisponibile?: string;
  scadenza: string;
  scadenzaDettagliata?: string;
  dataEstrazione?: string;
  dataImportazione?: string;
  requisiti?: string;
  modalitaPresentazione?: string;
  ultimiAggiornamenti?: string;
  created_at?: string;
  abilitata?: boolean;
  regex?: string;
  
  // Legacy field names for backward compatibility
  importo_min?: number;
  importo_max?: number;
  budget_disponibile?: string;
  scadenza_dettagliata?: string;
  data_estrazione?: string;
}

export interface Fonte {
  id: string;
  nome: string;
  url: string;
  abilitata?: boolean;
  regex?: string;
  tipo?: string;
  stato?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefono?: string;
  settore: string;
  interessi: string[];
  note?: string;
  userId: string;
  regione?: string;
  provincia?: string;
  fatturato?: number;
  dipendenti?: number;
  interessiSettoriali?: string[];
  annoFondazione?: number;
  formaGiuridica?: string;
  codiceATECO?: string;
  esperienzaFinanziamenti?: string;
  tecnologieSpecifiche?: string[];
  criteriESG?: string[];
  capacitaRD?: string;
  presenzaInternazionale?: string;
  faseDiCrescita?: string;
  stabilitaFinanziaria?: string;
  competenzeDipendenti?: string[];
  partnership?: string[];
  certificazioni?: string[];
  interessisettoriali?: string[]; // Lowercase version for backward compatibility
  codiceateco?: string; // Lowercase version for backward compatibility
}

export interface Match {
  id: string;
  clienteId: string;
  bandoId: string;
  compatibilita: number;
  notificato?: boolean;
  archiviato?: boolean;
  created_at?: string;
  bando_titolo?: string; // Add these fields to match what's used in the code
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
  bandoPerSettore: Array<{
    settore: string;
    percentuale: number;
  }>;
  matchPerCliente: Array<{
    cliente: string;
    percentuale: number;
  }>;
}

export interface TipoBando {
  value: string;
  label: string;
}

export interface UserProfileUpdate {
  display_name?: string;
  role?: 'admin' | 'client';
}
