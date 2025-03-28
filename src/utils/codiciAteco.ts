
// Mappatura dei codici ATECO per settore
export const codiciAtecoPerSettore: Record<string, { codice: string; descrizione: string }[]> = {
  "Agricoltura": [
    { codice: "01.11.10", descrizione: "Coltivazione di cereali" },
    { codice: "01.13.10", descrizione: "Coltivazione di ortaggi" },
    { codice: "01.21.00", descrizione: "Coltivazione di uva" },
    { codice: "01.41.00", descrizione: "Allevamento di bovini da latte" },
    { codice: "01.50.00", descrizione: "Coltivazioni agricole associate all'allevamento" }
  ],
  "Industria": [
    { codice: "10.71.10", descrizione: "Produzione di prodotti di panetteria freschi" },
    { codice: "13.20.00", descrizione: "Tessitura" },
    { codice: "15.12.09", descrizione: "Fabbricazione di altri articoli da viaggio" },
    { codice: "23.70.10", descrizione: "Segagione e lavorazione delle pietre" },
    { codice: "25.11.00", descrizione: "Fabbricazione di strutture metalliche" }
  ],
  "Tecnologia": [
    { codice: "26.20.00", descrizione: "Fabbricazione di computer e unità periferiche" },
    { codice: "62.01.00", descrizione: "Produzione di software non connesso all'edizione" },
    { codice: "62.02.00", descrizione: "Consulenza nel settore delle tecnologie dell'informatica" },
    { codice: "62.09.09", descrizione: "Altre attività dei servizi connessi alle tecnologie dell'informatica" },
    { codice: "63.11.19", descrizione: "Altre elaborazioni elettroniche di dati" }
  ],
  "Energia": [
    { codice: "35.11.00", descrizione: "Produzione di energia elettrica" },
    { codice: "35.21.00", descrizione: "Produzione di gas" },
    { codice: "35.30.00", descrizione: "Fornitura di vapore e aria condizionata" },
    { codice: "38.21.09", descrizione: "Trattamento e smaltimento di altri rifiuti non pericolosi" },
    { codice: "43.21.01", descrizione: "Installazione di impianti elettrici in edifici" }
  ],
  "Startup": [
    { codice: "58.29.00", descrizione: "Edizione di altri software a pacchetto" },
    { codice: "62.01.00", descrizione: "Produzione di software non connesso all'edizione" },
    { codice: "63.12.00", descrizione: "Portali web" },
    { codice: "70.22.01", descrizione: "Attività di consulenza per la gestione della logistica aziendale" },
    { codice: "72.19.09", descrizione: "Ricerca e sviluppo sperimentale nel campo delle altre scienze naturali" }
  ],
  "Biomedicale": [
    { codice: "21.10.00", descrizione: "Fabbricazione di prodotti farmaceutici di base" },
    { codice: "21.20.09", descrizione: "Fabbricazione di medicinali ed altri preparati farmaceutici" },
    { codice: "26.60.02", descrizione: "Fabbricazione di apparecchi elettromedicali" },
    { codice: "32.50.11", descrizione: "Fabbricazione di materiale medico-chirurgico e veterinario" },
    { codice: "72.11.00", descrizione: "Ricerca e sviluppo sperimentale nel campo delle biotecnologie" }
  ],
  "Turismo": [
    { codice: "55.10.00", descrizione: "Alberghi" },
    { codice: "55.20.10", descrizione: "Villaggi turistici" },
    { codice: "79.11.00", descrizione: "Attività delle agenzie di viaggio" },
    { codice: "79.12.00", descrizione: "Attività dei tour operator" },
    { codice: "91.02.00", descrizione: "Attività di musei" }
  ],
  "Commercio": [
    { codice: "46.19.01", descrizione: "Agenti e rappresentanti di vari prodotti" },
    { codice: "47.11.10", descrizione: "Ipermercati" },
    { codice: "47.61.00", descrizione: "Commercio al dettaglio di libri" },
    { codice: "47.71.10", descrizione: "Commercio al dettaglio di confezioni per adulti" },
    { codice: "47.91.10", descrizione: "Commercio al dettaglio di qualsiasi tipo di prodotto effettuato via internet" }
  ]
};

export default codiciAtecoPerSettore;
