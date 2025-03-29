export interface Bando {
  id: string;
  fonte: string;
  url: string;
  titolo: string;
  descrizione?: string;
  tipo: string;
  settori?: string[];
  regioni?: string[];
  scadenza: string;
  budget?: number;
  dataInserimento: string;
  modificato: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefono?: string;
  settore: string;
  interessiSettoriali: string[];
  regione: string;
  dataInserimento: string;
  note?: string;
  userId?: string;
  created_at?: string;
  updated_at?: string;
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
