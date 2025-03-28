
// Questo è uno script di esempio da utilizzare in Google Apps Script
// Per utilizzarlo:
// 1. Vai su https://script.google.com/
// 2. Crea un nuovo progetto
// 3. Copia e incolla questo codice
// 4. Modifica l'ID del foglio e il nome della scheda secondo le tue esigenze
// 5. Pubblica lo script come Web App (con accesso "Anyone, even anonymous")
// 6. Usa l'URL generato per configurare l'app
// 7. IMPORTANTE: Aggiungi le seguenti intestazioni al foglio "Lista Fonti": 
//    row_number, url, nome, tipo (e opzionalmente stato_elaborazione, data_ultimo_aggiornamento)

function doGet(e) {
  return HtmlService.createHtmlOutput("Google Apps Script per l'aggiornamento delle fonti è attivo!")
    .addMetaTag('Content-Type', 'application/json')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Per abilitare CORS nella risposta
function setCorsHeaders(response) {
  return ContentService.createTextOutput(response)
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function doPost(e) {
  try {
    // Analizza i dati inviati
    var data = JSON.parse(e.postData.contents);
    
    // Registra i dati ricevuti per debug
    Logger.log("Dati ricevuti: " + e.postData.contents);
    
    // Controlla che azione eseguire
    if (data.action === "updateFonte") {
      const result = addFonteToSheet(data.fonte, data.sheetId);
      return setCorsHeaders(JSON.stringify(result));
    }
    
    // Azione non riconosciuta
    return setCorsHeaders(JSON.stringify({ 
      success: false, 
      error: "Azione non riconosciuta" 
    }));
    
  } catch (error) {
    Logger.log("Errore: " + error.toString());
    return setCorsHeaders(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    }));
  }
}

function addFonteToSheet(fonte, sheetId) {
  try {
    // Se non è specificato uno sheetId, usa quello del foglio corrente
    var ss = sheetId 
      ? SpreadsheetApp.openById(sheetId)
      : SpreadsheetApp.getActiveSpreadsheet();
    
    // Apri la scheda "Lista Fonti"
    var sheet = ss.getSheetByName("Lista Fonti");
    if (!sheet) {
      return { 
        success: false, 
        error: "Scheda 'Lista Fonti' non trovata nel foglio specificato" 
      };
    }
    
    Logger.log("Foglio trovato: " + sheet.getName());
    
    // Ottieni le intestazioni delle colonne dalla prima riga
    var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    var headers = headerRange.getValues()[0];
    Logger.log("Intestazioni foglio: " + headers.join(", "));
    
    // Verifica che ci siano intestazioni
    if (headers.length === 0 || headers.every(function(h) { return h === ""; })) {
      Logger.log("Nessuna intestazione trovata!");
      return { 
        success: false, 
        error: "Nessuna intestazione trovata nel foglio" 
      };
    }
    
    // Trova l'ultima riga con dati
    var lastRow = sheet.getLastRow();
    var nextRowNumber = lastRow + 1;
    
    Logger.log("Ultima riga: " + lastRow + ", prossima riga: " + nextRowNumber);
    
    // Crea una mappa delle posizioni delle intestazioni (insensibile alle maiuscole)
    var headerMap = {};
    for (var i = 0; i < headers.length; i++) {
      if (headers[i] !== "") {
        headerMap[headers[i].toLowerCase()] = i;
      }
    }
    
    Logger.log("Mappa intestazioni: " + JSON.stringify(headerMap));
    
    // Verifica che ci siano almeno "url" e "row_number" tra le intestazioni
    if (headerMap["url"] === undefined) {
      Logger.log("Intestazione 'url' non trovata!");
      return { 
        success: false, 
        error: "Intestazione 'url' non trovata nel foglio" 
      };
    }
    
    // Inizializza l'array con valori vuoti per tutte le colonne
    var rowData = new Array(headers.length).fill("");
    
    // Riempi i dati in base alle intestazioni
    if ("row_number" in headerMap) {
      rowData[headerMap["row_number"]] = nextRowNumber - 1; // Usa l'indice 0-based per row_number
    }
    
    if ("url" in headerMap) {
      rowData[headerMap["url"]] = fonte.url || "";
    }
    
    if ("nome" in headerMap) {
      rowData[headerMap["nome"]] = fonte.nome || "";
    }
    
    if ("tipo" in headerMap) {
      rowData[headerMap["tipo"]] = fonte.tipo || "altro";
    }
    
    if ("stato_elaborazione" in headerMap) {
      rowData[headerMap["stato_elaborazione"]] = fonte.stato || "attivo";
    }
    
    if ("data_ultimo_aggiornamento" in headerMap) {
      rowData[headerMap["data_ultimo_aggiornamento"]] = new Date().toISOString().split('T')[0];
    }
    
    Logger.log("Sto per scrivere i dati alla riga " + nextRowNumber + ": " + rowData.join(", "));
    
    // Scrivi la nuova riga nel foglio
    sheet.getRange(nextRowNumber, 1, 1, rowData.length).setValues([rowData]);
    
    Logger.log("Fonte aggiunta con successo alla riga " + nextRowNumber);
    
    return { 
      success: true, 
      message: "Fonte aggiunta con successo",
      rowNumber: nextRowNumber
    };
    
  } catch (error) {
    Logger.log("Errore nell'aggiunta della fonte: " + error.toString());
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}
