export interface Bando {
  id: string;
  titolo: string;
  descrizione: string;
  ente: string;
  scadenza: string;
  url: string;
  tipo: string;
  settori: string[];
  regioni: string[];
  destinatari: string[];
  fonte: string;
  stato: string;
  importo: number;
  note?: string;
  allegati?: string[];
  data_inserimento?: string;
  data_aggiornamento?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefono: string;
  settore: string;
  regione: string;
  note: string;
  interessi: string[];
  bandi_interesse?: string[];
  data_inserimento?: string;
  data_aggiornamento?: string;
}

export interface Match {
  id: string;
  bando_id: string;
  cliente_id: string;
  punteggio: number;
  note: string;
  data_inserimento?: string;
}

export interface Fonte {
  id: string;
  nome: string;
  url: string;
  tipo?: string;
}

// Add these interfaces for the Report.tsx file
export interface DataItem {
  [key: string]: string | number;
}

export interface ReportAnalisiTemporale extends DataItem {
  name: string;
  count: number;
}

export interface ReportPerformanceMatch extends DataItem {
  name: string;
  value: number;
}
