
// Questo è uno script di esempio da utilizzare in Google Apps Script
// Per utilizzarlo:
// 1. Vai su https://script.google.com/
// 2. Crea un nuovo progetto
// 3. Copia e incolla questo codice
// 4. Pubblica lo script come Web App (con accesso "Anyone, even anonymous")
// 5. Usa l'URL generato per configurare l'app
// 6. IMPORTANTE: Aggiungi le seguenti intestazioni al foglio "Lista Fonti": 
//    row_number, url, nome, tipo (e opzionalmente stato_elaborazione)

function doGet(e) {
  console.log("Richiesta GET ricevuta");
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Google Apps Script per l'aggiornamento delle fonti è attivo! Versione 3.1"
  }))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeader('Access-Control-Allow-Origin', '*');
}

function doPost(e) {
  console.log("Richiesta POST ricevuta");
  try {
    let data;
    
    // Controlla se è una richiesta JSONP
    if (e.parameter && e.parameter.callback) {
      console.log("Richiesta JSONP ricevuta");
      var callback = e.parameter.callback;
      data = JSON.parse(e.parameter.data || '{}');
      
      // Esegui l'aggiunta della fonte
      const result = addFonteToSheet(data.fonte, data.sheetId);
      
      // Restituisci il risultato come JSONP
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ");")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // Altrimenti, è una richiesta POST standard
    try {
      console.log("Contenuto della richiesta POST:", e.postData ? e.postData.contents : "nessun dato");
      console.log("Parametri della richiesta:", JSON.stringify(e.parameter));
      
      // Prima controlla se i dati sono in FormData
      if (e.parameter && e.parameter.data) {
        data = JSON.parse(e.parameter.data);
        console.log("Dati estratti da FormData:", JSON.stringify(data));
      }
      // Poi prova a parsare i dati JSON
      else if (e.postData && e.postData.contents) {
        data = JSON.parse(e.postData.contents);
        console.log("Dati parsati da JSON:", JSON.stringify(data));
      } 
      // Se non ci sono dati, usa i parametri
      else {
        data = e.parameter || {};
        console.log("Usando i parametri diretti:", JSON.stringify(data));
      }
    } catch (parseError) {
      console.error("Errore nel parsing dei dati:", parseError);
      data = e.parameter || {};
    }
    
    // Esegui l'azione richiesta
    if ((data.action === "updateFonte" || data.action === "add") && data.fonte) {
      console.log("Esecuzione azione updateFonte/add con:", JSON.stringify(data.fonte));
      const result = addFonteToSheet(data.fonte, data.sheetId);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }
    
    // Azione non riconosciuta
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "Azione non riconosciuta o dati mancanti" 
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
    
  } catch (error) {
    console.error("Errore generale:", error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
  }
}

function addFonteToSheet(fonte, sheetId) {
  try {
    console.log("addFonteToSheet chiamato con fonte:", JSON.stringify(fonte));
    
    // Se non è specificato uno sheetId, usa quello del foglio corrente
    var ss = sheetId 
      ? SpreadsheetApp.openById(sheetId)
      : SpreadsheetApp.getActiveSpreadsheet();
    
    console.log("Foglio Google aperto:", ss.getName());
    
    // Apri la scheda "Lista Fonti"
    var sheet = ss.getSheetByName("Lista Fonti");
    if (!sheet) {
      console.error("Scheda 'Lista Fonti' non trovata!");
      
      // Tenta di creare il foglio se non esiste
      try {
        sheet = ss.insertSheet("Lista Fonti");
        // Crea le intestazioni
        sheet.getRange(1, 1, 1, 4).setValues([["row_number", "url", "nome", "tipo"]]);
        console.log("Creato nuovo foglio 'Lista Fonti' con intestazioni");
      } catch (createError) {
        console.error("Impossibile creare il foglio:", createError);
        return { 
          success: false, 
          error: "Scheda 'Lista Fonti' non trovata e impossibile crearla automaticamente" 
        };
      }
    }
    
    // Ottieni le intestazioni delle colonne dalla prima riga
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log("Intestazioni trovate:", headers.join(", "));
    
    // Verifica che ci siano intestazioni
    if (headers.length === 0) {
      // Se non ci sono intestazioni, creale
      sheet.getRange(1, 1, 1, 4).setValues([["row_number", "url", "nome", "tipo"]]);
      headers = ["row_number", "url", "nome", "tipo"];
      console.log("Intestazioni create automaticamente");
    }
    
    // Crea una mappa delle posizioni delle intestazioni
    var headerMap = {};
    for (var i = 0; i < headers.length; i++) {
      if (headers[i] !== "") {
        headerMap[headers[i].toLowerCase()] = i;
      }
    }
    
    // Verifica le intestazioni minime necessarie
    var requiredHeaders = ["url", "nome", "tipo"];
    var missingHeaders = [];
    
    for (var i = 0; i < requiredHeaders.length; i++) {
      if (headerMap[requiredHeaders[i].toLowerCase()] === undefined) {
        missingHeaders.push(requiredHeaders[i]);
      }
    }
    
    if (missingHeaders.length > 0) {
      console.error("Intestazioni mancanti:", missingHeaders.join(", "));
      return { 
        success: false, 
        error: "Intestazioni mancanti: " + missingHeaders.join(", ")
      };
    }
    
    // Trova l'ultima riga con dati
    var lastRow = Math.max(sheet.getLastRow(), 1);
    
    // MODIFICATO: Quando append_mode è true, aggiungiamo sempre una nuova riga
    // Se è false, gestisci l'aggiornamento di una riga esistente (non implementato)
    var nextRowNumber = lastRow + 1;
    
    console.log("Ultima riga:", lastRow, "Prossima riga:", nextRowNumber);
    
    // Inizializza l'array con valori vuoti per tutte le colonne
    var rowData = new Array(headers.length).fill("");
    
    // Riempi i dati in base alle intestazioni
    if ("row_number" in headerMap) {
      rowData[headerMap["row_number"]] = nextRowNumber - 1;
    }
    
    if ("url" in headerMap && fonte.url) {
      rowData[headerMap["url"]] = fonte.url;
    }
    
    if ("nome" in headerMap && fonte.nome) {
      rowData[headerMap["nome"]] = fonte.nome;
    }
    
    if ("tipo" in headerMap) {
      rowData[headerMap["tipo"]] = fonte.tipo || "altro";
    }
    
    if ("stato_elaborazione" in headerMap) {
      rowData[headerMap["stato_elaborazione"]] = fonte.stato_elaborazione || "attivo";
    }
    
    console.log("Dati riga da scrivere:", rowData);
    
    // Scrivi la nuova riga nel foglio
    sheet.getRange(nextRowNumber, 1, 1, rowData.length).setValues([rowData]);
    
    console.log("Fonte aggiunta con successo alla riga", nextRowNumber);
    
    return { 
      success: true, 
      message: "Fonte aggiunta con successo",
      rowNumber: nextRowNumber
    };
    
  } catch (error) {
    console.error("Errore nell'aggiunta della fonte:", error.toString());
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}
