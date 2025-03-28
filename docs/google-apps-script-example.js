
// Questo è uno script di esempio da utilizzare in Google Apps Script
// Per utilizzarlo:
// 1. Vai su https://script.google.com/
// 2. Crea un nuovo progetto
// 3. Copia e incolla questo codice
// 4. Modifica l'ID del foglio e il nome della scheda secondo le tue esigenze
// 5. Pubblica lo script come Web App (con accesso "Anyone, even anonymous")
// 6. Usa l'URL generato per configurare l'app
// 7. IMPORTANTE: Aggiungi le seguenti intestazioni al foglio "Lista Fonti": 
//    row_number, url, stato_elaborazione, data_ultimo_aggiornamento, nome, tipo

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
    
    // Ottieni le intestazioni delle colonne dalla prima riga
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("Intestazioni foglio: " + headers.join(", "));
    
    // Trova l'ultima riga con dati
    var lastRow = sheet.getLastRow();
    var nextRowNumber = lastRow + 1;
    
    // Prepara i dati da inserire
    // Verifica le colonne disponibili e mappa i dati di conseguenza
    var rowData = [];
    
    // Crea una mappa delle posizioni delle intestazioni
    var headerMap = {};
    for (var i = 0; i < headers.length; i++) {
      headerMap[headers[i].toLowerCase()] = i;
    }
    
    // Inizializza l'array con valori vuoti per tutte le colonne
    for (var i = 0; i < headers.length; i++) {
      rowData.push("");
    }
    
    // Riempi i dati in base alle intestazioni
    if ("row_number" in headerMap) {
      rowData[headerMap["row_number"]] = nextRowNumber;
    }
    
    if ("url" in headerMap) {
      rowData[headerMap["url"]] = fonte.url;
    }
    
    if ("stato_elaborazione" in headerMap) {
      rowData[headerMap["stato_elaborazione"]] = fonte.stato || "da elaborare";
    }
    
    if ("data_ultimo_aggiornamento" in headerMap) {
      rowData[headerMap["data_ultimo_aggiornamento"]] = new Date().toISOString().split('T')[0];
    }
    
    if ("nome" in headerMap) {
      rowData[headerMap["nome"]] = fonte.nome || "";
    }
    
    if ("tipo" in headerMap) {
      rowData[headerMap["tipo"]] = fonte.tipo || "altro";
    }
    
    // Se non ci sono intestazioni, usa un formato di base con almeno url e row_number
    if (headers.length === 0 || headerMap["url"] === undefined) {
      // Se il foglio è completamente vuoto, aggiungi le intestazioni
      if (lastRow === 0) {
        var defaultHeaders = ["row_number", "url", "stato_elaborazione", "data_ultimo_aggiornamento", "nome", "tipo"];
        sheet.getRange(1, 1, 1, defaultHeaders.length).setValues([defaultHeaders]);
        lastRow = 1;
        nextRowNumber = 2;
      }
      
      // Usa un formato base (assumendo che le colonne siano in questo ordine)
      rowData = [
        nextRowNumber,
        fonte.url,
        fonte.stato || "da elaborare",
        new Date().toISOString().split('T')[0],
        fonte.nome || "",
        fonte.tipo || "altro"
      ];
    }
    
    // Scrivi la nuova riga nel foglio
    Logger.log("Sto per scrivere i dati: " + rowData.join(", ") + " alla riga " + nextRowNumber);
    sheet.getRange(nextRowNumber, 1, 1, rowData.length).setValues([rowData]);
    
    Logger.log("Fonte aggiunta con successo alla riga " + nextRowNumber + ". Dati: " + rowData.join(", "));
    
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
