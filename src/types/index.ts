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
}

export interface Fonte {
  id: string;
  nome: string;
  url: string;
  abilitata: boolean;
  regex: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefono: string;
  settore: string;
  interessi: string[];
  note: string;
  userId: string;
}
