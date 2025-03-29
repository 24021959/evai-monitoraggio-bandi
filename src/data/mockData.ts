export const mockClienti = [
  {
    id: 'cliente-1',
    nome: 'Azienda Agricola Rossi',
    settore: 'Agricoltura',
    regione: 'Lombardia',
    provincia: 'Milano',
    fatturato: 500000,
    interessiSettoriali: ['Agricoltura', 'Innovazione Agricola'],
    dipendenti: 15,
    email: 'info@rossiagricola.it'
  },
  {
    id: 'cliente-2',
    nome: 'GreenTech Solutions Srl',
    settore: 'Energia Rinnovabile',
    regione: 'Lazio',
    provincia: 'Roma',
    fatturato: 1200000,
    interessiSettoriali: ['Energia Solare', 'Eolico', 'Sostenibilità'],
    dipendenti: 40,
    email: 'info@greentech.it'
  },
  {
    id: 'cliente-3',
    nome: 'Fashion Style Spa',
    settore: 'Moda',
    regione: 'Toscana',
    provincia: 'Firenze',
    fatturato: 3000000,
    interessiSettoriali: ['Moda Sostenibile', 'Made in Italy', 'E-commerce'],
    dipendenti: 120,
    email: 'info@fashionstyle.com'
  },
  {
    id: 'cliente-4',
    nome: 'Innovative Food Srl',
    settore: 'Alimentare',
    regione: 'Emilia-Romagna',
    provincia: 'Bologna',
    fatturato: 800000,
    interessiSettoriali: ['Food Tech', 'Packaging Innovativo', 'Export'],
    dipendenti: 25,
    email: 'info@innovativefood.it'
  },
  {
    id: 'cliente-5',
    nome: 'Digital Services Srl',
    settore: 'Servizi Digitali',
    regione: 'Veneto',
    provincia: 'Venezia',
    fatturato: 950000,
    interessiSettoriali: ['Cloud Computing', 'Cybersecurity', 'Digital Marketing'],
    dipendenti: 30,
    email: 'info@digitalservices.it'
  }
];

export const mockBandi = [
  {
    "id": "bando-1",
    "titolo": "Bando per l'innovazione nel settore agricolo",
    "fonte": "Regione Lombardia",
    "descrizione": "Finanziamenti a fondo perduto per progetti di innovazione tecnologica nelle aziende agricole lombarde.",
    "tipo": "regionale",
    "settori": ["Agricoltura", "Innovazione Agricola"],
    "scadenza": "2024-03-15",
    "importoMin": 50000,
    "importoMax": 200000,
    "url": "https://www.regione.lombardia.it/wps/portal/istituzionale/HP/servizi-e-informazioni/enti-e-operatori/attivita-produttive/Bandi-e-agevolazioni"
  },
  {
    "id": "bando-2",
    "titolo": "Incentivi per l'efficienza energetica nelle PMI",
    "fonte": "MIMIT - Ministero delle Imprese e del Made in Italy",
    "descrizione": "Agevolazioni per investimenti in impianti di produzione di energia da fonti rinnovabili e interventi di efficientamento energetico.",
    "tipo": "statale",
    "settori": ["Energia Rinnovabile", "Efficienza Energetica"],
    "scadenza": "2024-04-30",
    "importoMin": 30000,
    "importoMax": 150000,
    "url": "https://www.mise.gov.it/it/incentivi"
  },
  {
    "id": "bando-3",
    "titolo": "Contributi per la digitalizzazione delle imprese turistiche",
    "fonte": "Regione Veneto",
    "descrizione": "Sostegno alle imprese turistiche per l'adozione di tecnologie digitali e la promozione online.",
    "tipo": "regionale",
    "settori": ["Turismo", "Digitalizzazione"],
    "scadenza": "2024-05-20",
    "importoMin": 10000,
    "importoMax": 50000,
    "url": "https://www.regione.veneto.it/web/guest/bandi-avvisi"
  },
  {
    "id": "bando-4",
    "titolo": "Finanziamenti per la ricerca e sviluppo nel settore biomedicale",
    "fonte": "Unione Europea",
    "descrizione": "Fondi europei per progetti di ricerca e sviluppo nel campo delle tecnologie biomedicali e farmaceutiche.",
    "tipo": "europeo",
    "settori": ["Ricerca e Sviluppo", "Biomedicale", "Farmaceutico"],
    "scadenza": "2024-06-10",
    "importoMin": 100000,
    "importoMax": 500000,
    "url": "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home"
  },
  {
    "id": "bando-5",
    "titolo": "Incentivi per l'internazionalizzazione delle imprese",
    "fonte": "SIMEST",
    "descrizione": "Supporto finanziario per le imprese che intendono espandere il proprio business sui mercati esteri.",
    "tipo": "statale",
    "settori": ["Export", "Internazionalizzazione"],
    "scadenza": "2024-07-01",
    "importoMin": 20000,
    "importoMax": 100000,
    "url": "https://www.simest.it/cosa-facciamo"
  }
];

export const mockFonti: Fonte[] = [
  {
    id: 'fonte-1',
    nome: 'MIMIT - Ministero delle Imprese e del Made in Italy',
    url: 'https://www.mise.gov.it/it/incentivi',
    tipo: 'statale'
  },
  {
    id: 'fonte-2',
    nome: 'European Commission - Funding & Tenders',
    url: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home',
    tipo: 'europeo'
  },
  {
    id: 'fonte-3',
    nome: 'Regione Lombardia',
    url: 'https://www.regione.lombardia.it/wps/portal/istituzionale/HP/servizi-e-informazioni/enti-e-operatori/attivita-produttive/Bandi-e-agevolazioni',
    tipo: 'regionale'
  },
  {
    id: 'fonte-4',
    nome: 'Regione Lazio',
    url: 'https://www.lazioeuropa.it/bandi/',
    tipo: 'regionale'
  },
  {
    id: 'fonte-5',
    nome: 'SIMEST',
    url: 'https://www.simest.it/finanziamenti-pnrr',
    tipo: 'statale'
  }
];
