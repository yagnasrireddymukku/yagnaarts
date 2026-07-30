/**
 * YagnaArts form-to-Google-Sheets bridge.
 *
 * SETUP:
 * 1. Create a new Google Sheet (any name, e.g. "YagnaArts Form Submissions").
 * 2. Extensions -> Apps Script. Delete the default code and paste this file's
 *    contents in.
 * 3. Click Deploy -> New deployment -> select type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL (ends in /exec) into js/config.js as
 *    googleSheets.webAppUrl.
 * 5. Submit any form on the site once — this script auto-creates a sheet
 *    tab per form type (Contact, CustomOrder, WeddingInquiry,
 *    CorporateInquiry, Newsletter) with a header row on first use.
 *
 * The site calls this with fetch(url, {method:'POST', mode:'no-cors', ...}),
 * which means the browser can't read the response (a no-cors quirk) — the
 * request still arrives and is still processed, the site just can't confirm
 * success beyond "the request didn't throw." That's an accepted tradeoff for
 * a zero-backend static site; Sheets is treated as a log, not the primary
 * notification path (EmailJS + WhatsApp cover that).
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var formType = data.formType || 'Unknown';
    delete data.formType;

    var sheet = getOrCreateSheet_(formType, data);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var row = headers.map(function (header) {
      if (header === 'Timestamp') return new Date();
      return data[header] !== undefined ? data[header] : '';
    });
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(
      ContentService.MimeType.JSON
    );
  }
}

function getOrCreateSheet_(formType, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(formType);
  if (sheet) return sheet;

  sheet = ss.insertSheet(formType);
  var headers = ['Timestamp'].concat(Object.keys(data));
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  return sheet;
}
