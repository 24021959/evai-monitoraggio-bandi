import { Bando, Cliente, Fonte, Match, Statistica, TipoBando } from '../types';

export const mockBandi: Bando[] = [
  {
    id: '1',
    titolo: 'Contributi Innovazione',
    fonte: 'MISE',
    tipo: 'statale',
    settori: ['Industria'],
    importoMin: 50000,
    importoMax: 500000,
    scadenza: '2025-06-30',
    descrizione: 'Contributi per progetti di innovazione tecnologica nelle PMI'
  },
  {
    id: '2',
    titolo: 'Horizon Europe',
    fonte: 'UE',
    tipo: 'europeo',
    settori: ['Ambiente'],
    importoMin: 100000,
    importoMax: 2000000,
    scadenza: '2025-08-15',
    descrizione: 'Programma quadro europeo per la ricerca e l\'innovazione'
  },
  {
    id: '3',
    titolo: 'Bando Startup',
    fonte: 'Lombardia',
    tipo: 'regionale',
    settori: ['Startup'],
    importoMin: 20000,
    importoMax: 100000,
    scadenza: '2025-05-15',
    descrizione: 'Finanziamenti per startup innovative in Lombardia'
  },
  {
    id: '4',
    titolo: 'Credito R&S',
    fonte: 'Ag. Entrate',
    tipo: 'statale',
    settori: ['R&S'],
    importoMax: 4000000,
    scadenza: '2025-12-31',
    descrizione: 'Credito d\'imposta per attività di ricerca e sviluppo'
  },
  {
    id: '5',
    titolo: 'Agricoltura Sostenibile',
    fonte: 'MIPAAF',
    tipo: 'statale',
    settori: ['Agricoltura'],
    importoMin: 10000,
    importoMax: 200000,
    scadenza: '2025-07-30',
    descrizione: 'Contributi per progetti di agricoltura sostenibile'
  }
];

export const mockClienti: Cliente[] = [
  {
    id: '1',
    nome: 'TechSolutions',
    settore: 'Tecnologia',
    fatturato: 5000000,
    dipendenti: 45,
    regione: 'Lombardia',
    provincia: 'Milano',
    interessiSettoriali: ['Innovazione', 'Digitalizzazione', 'Smart City'],
    email: 'info@tech.it',
    interessi: ['Innovazione', 'Digitalizzazione', 'Smart City'],
    userId: 'fake-user-id-1'
  },
  {
    id: '2',
    nome: 'Green Energy',
    settore: 'Energia',
    fatturato: 12500000,
    dipendenti: 120,
    regione: 'Piemonte',
    provincia: 'Torino',
    interessiSettoriali: ['Energie Rinnovabili', 'Efficienza Energetica', 'Sostenibilità'],
    email: 'info@green.it',
    interessi: ['Energie Rinnovabili', 'Efficienza Energetica', 'Sostenibilità'],
    userId: 'fake-user-id-2'
  },
  {
    id: '3',
    nome: 'Agritech',
    settore: 'Agricoltura',
    fatturato: 3200000,
    dipendenti: 28,
    regione: 'Emilia-Romagna',
    provincia: 'Bologna',
    interessiSettoriali: ['Agricoltura Biologica', 'Tecnologie Agricole', 'Sostenibilità'],
    email: 'info@agri.it',
    interessi: ['Agricoltura Biologica', 'Tecnologie Agricole', 'Sostenibilità'],
    userId: 'fake-user-id-3'
  },
  {
    id: '4',
    nome: 'Manifattura',
    settore: 'Industria',
    fatturato: 8700000,
    dipendenti: 75,
    regione: 'Veneto',
    provincia: 'Padova',
    interessiSettoriali: ['Industria 4.0', 'Automazione', 'Manifattura Avanzata'],
    email: 'info@mani.it',
    interessi: ['Industria 4.0', 'Automazione', 'Manifattura Avanzata'],
    userId: 'fake-user-id-4'
  },
  {
    id: '5',
    nome: 'InnovaStartup',
    settore: 'Startup',
    fatturato: 750000,
    dipendenti: 12,
    regione: 'Lazio',
    provincia: 'Roma',
    interessiSettoriali: ['Innovazione', 'Digitale', 'Startup'],
    email: 'info@innova.it',
    interessi: ['Innovazione', 'Digitale', 'Startup'],
    userId: 'fake-user-id-5'
  },
  {
    id: '6',
    nome: 'BioMed',
    settore: 'Biomedicale',
    fatturato: 4200000,
    dipendenti: 32,
    regione: 'Toscana',
    provincia: 'Firenze',
    interessiSettoriali: ['Ricerca Medica', 'Biotecnologie', 'Salute'],
    email: 'info@biomed.it',
    interessi: ['Ricerca Medica', 'Biotecnologie', 'Salute'],
    userId: 'fake-user-id-6'
  }
];

export const mockFonti: Fonte[] = [
  {
    id: '1',
    nome: 'Europa EU',
    url: 'ec.europa.eu/info/funding-tenders',
    tipo: 'europeo',
    stato: 'attivo'
  },
  {
    id: '2',
    nome: 'MISE',
    url: 'mise.gov.it/bandi',
    tipo: 'statale',
    stato: 'attivo'
  },
  {
    id: '3',
    nome: 'Invitalia',
    url: 'invitalia.it/bandi',
    tipo: 'statale',
    stato: 'attivo'
  },
  {
    id: '4',
    nome: 'Regione Lombardia',
    url: 'regione.lombardia.it/bandi',
    tipo: 'regionale',
    stato: 'attivo'
  },
  {
    id: '5',
    nome: 'Camera di Commercio MI',
    url: 'milomb.camcom.it/bandi',
    tipo: 'regionale',
    stato: 'attivo'
  }
];

export const mockMatches: Match[] = [
  {
    id: '1',
    clienteId: '1',
    bandoId: '1',
    compatibilita: 85,
    notificato: true
  },
  {
    id: '2',
    clienteId: '2',
    bandoId: '2',
    compatibilita: 92,
    notificato: true
  },
  {
    id: '3',
    clienteId: '3',
    bandoId: '5',
    compatibilita: 78,
    notificato: false
  },
  {
    id: '4',
    clienteId: '4',
    bandoId: '4',
    compatibilita: 65,
    notificato: false
  },
  {
    id: '5',
    clienteId: '5',
    bandoId: '3',
    compatibilita: 88,
    notificato: true
  }
];

export const mockStatistiche: Statistica = {
  bandiAttivi: 24,
  numeroClienti: 42,
  matchRecenti: 18,
  distribuzioneBandi: {
    europei: 8,
    statali: 10,
    regionali: 6
  },
  bandoPerSettore: [
    { settore: 'Industria', percentuale: 28 },
    { settore: 'Tecnologia', percentuale: 22 },
    { settore: 'Agricoltura', percentuale: 18 },
    { settore: 'Energia', percentuale: 14 },
    { settore: 'Altro', percentuale: 10 }
  ],
  matchPerCliente: [
    { cliente: 'TechSolutions', percentuale: 28 },
    { cliente: 'Green Energy', percentuale: 22 },
    { cliente: 'Agritech', percentuale: 18 },
    { cliente: 'Manifattura', percentuale: 15 }
  ]
};

export const getBando = (id: string): Bando | undefined => {
  return mockBandi.find(bando => bando.id === id);
};

export const getCliente = (id: string): Cliente | undefined => {
  return mockClienti.find(cliente => cliente.id === id);
};

export const getMatchDetails = (id: string) => {
  const match = mockMatches.find(match => match.id === id);
  if (!match) return undefined;

  const cliente = getCliente(match.clienteId);
  const bando = getBando(match.bandoId);

  return {
    match,
    cliente,
    bando
  };
};
