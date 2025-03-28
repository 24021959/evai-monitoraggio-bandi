
// Questo è uno script di esempio da utilizzare in Google Apps Script
// Per utilizzarlo:
// 1. Vai su https://script.google.com/
// 2. Crea un nuovo progetto
// 3. Copia e incolla questo codice
// 4. Modifica l'ID del foglio e il nome della scheda secondo le tue esigenze
// 5. Pubblica lo script come Web App (con accesso "Anyone, even anonymous")
// 6. Usa l'URL generato per configurare l'app

function doGet(e) {
  return HtmlService.createHtmlOutput("Google Apps Script per l'aggiornamento delle fonti è attivo!");
}

function doPost(e) {
  try {
    // Analizza i dati inviati
    var data = JSON.parse(e.postData.contents);
    
    // Registra i dati ricevuti per debug
    Logger.log("Dati ricevuti: " + e.postData.contents);
    
    // Controlla che azione eseguire
    if (data.action === "updateFonte") {
      return ContentService.createTextOutput(
        JSON.stringify(addFonteToSheet(data.fonte, data.sheetId))
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Azione non riconosciuta
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: "Azione non riconosciuta" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Errore: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
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
    
    // Per compatibilità sia con il vecchio che con il nuovo formato
    if (headers.includes("row_number") || headers.includes("id_number")) {
      rowData.push(nextRowNumber); // row_number o id_number
    }
    
    // Aggiungi sempre l'URL (essenziale)
    rowData.push(fonte.url);
    
    // Se esiste la colonna stato_elaborazione
    if (headers.includes("stato_elaborazione")) {
      rowData.push(fonte.stato || "da elaborare");
    }
    
    // Se esiste la colonna data_ultimo_aggiornamento
    if (headers.includes("data_ultimo_aggiornamento")) {
      rowData.push(new Date().toISOString().split('T')[0]);
    }
    
    // Se esiste la colonna nome
    if (headers.includes("nome")) {
      rowData.push(fonte.nome || "");
    }
    
    // Se esiste la colonna tipo
    if (headers.includes("tipo")) {
      rowData.push(fonte.tipo || "altro");
    }
    
    // Se non ci sono intestazioni, usa un formato di base
    if (headers.length === 0 || rowData.length === 0) {
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
