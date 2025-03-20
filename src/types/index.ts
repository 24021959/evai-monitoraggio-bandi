
export type TipoBando = 'europeo' | 'statale' | 'regionale' | 'altro';

export interface Bando {
  id: string;
  titolo: string;
  fonte: string;
  tipo: TipoBando;
  settori: string[];
  importoMin?: number;
  importoMax?: number;
  scadenza: string;
  descrizione?: string;
  url?: string;
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
