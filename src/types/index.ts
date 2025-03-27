export type TipoBando = 'europeo' | 'statale' | 'regionale' | 'altro';

export interface Bando {
  id: string;
  titolo: string;
  fonte: string;
  descrizione?: string;
  descrizioneCompleta?: string;
  tipo: 'europeo' | 'statale' | 'regionale' | 'altro';
  settori: string[];
  scadenza: string;
  importoMin?: number;
  importoMax?: number;
  url?: string;
  
  dataEstrazione?: string;
  requisiti?: string;
  scadenzaDettagliata?: string;
  budgetDisponibile?: string;
  modalitaPresentazione?: string;
  ultimiAggiornamenti?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  settore: string;
  regione: string;
  provincia: string;
  fatturato: number;
  interessiSettoriali: string[];
  dipendenti: number;
  email: string;
  telefono?: string;
  annoFondazione?: number;
  formaGiuridica?: string;
  codiceATECO?: string;
}

export interface Fonte {
  id: string;
  nome: string;
  url: string;
  tipo: TipoBando;
  stato: 'attivo' | 'inattivo';
}

export interface Match {
  id: string;
  clienteId: string;
  bandoId: string;
  compatibilita: number;
  notificato: boolean;
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
  bandoPerSettore: {
    settore: string;
    percentuale: number;
  }[];
  matchPerCliente: {
    cliente: string;
    percentuale: number;
  }[];
}
