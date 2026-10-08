/**
 * Climbing Cyprus — Formspree → Gmail → Google Sheets sync
 *
 * Run setupFormspreeSync() once from script.google.com. The script stores the
 * spreadsheet ID in Script Properties, imports existing Formspree emails, and
 * installs an hourly trigger for new messages.
 */
const CONFIG = {
  spreadsheetId: '1OfXQhLIeWuduWEUbJuifDjUnYEZjnjBRV6wMR6o8ZbE',
  sheetName: 'לידים',
  gmailQuery: 'from:(noreply@formspree.io) newer_than:365d -in:spam -in:trash'
};

const HEADERS = [
  'תאריך', 'שם', 'אימייל', 'טלפון', 'סוג', 'בוחן / נושא', 'ציון',
  'עניין בהדרכה', 'שפה', 'הודעה', 'מקור', 'קמפיין', 'רפררר',
  'סטטוס', 'Gmail message ID', 'עניין', 'אירוע', 'תאריך אירוע', 'עלות',
  'טופס', 'נציג/ה', 'חתימה אלקטרונית', 'תאריך חתימה', 'אישור סיכונים',
  'הסכמה רפואית', 'קישור לאישור', 'מידע מלא'
];

function setupFormspreeSync() {
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', CONFIG.spreadsheetId);
  const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  let sheet = ss.getSheetByName(CONFIG.sheetName);
  if (!sheet) sheet = ss.insertSheet(CONFIG.sheetName);
  ensureHeader_(sheet);

  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'syncFormspreeToSheet')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('syncFormspreeToSheet').timeBased().everyMinutes(5).create();
  syncFormspreeToSheet();
}

function syncFormspreeToSheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || CONFIG.spreadsheetId;
  const ss = SpreadsheetApp.openById(id);
  const sheet = ss.getSheetByName(CONFIG.sheetName) || ss.insertSheet(CONFIG.sheetName);
  ensureHeader_(sheet);
  const existing = getExistingMessageRows_(sheet);
  const rows = [];
  const updates = [];
  GmailApp.search(CONFIG.gmailQuery).forEach(thread => thread.getMessages().forEach(message => {
    const id = message.getId();
    const parsed = parseMessage_(message);
    if (existing.has(id)) {
      const rowNumber = existing.get(id);
      const current = sheet.getRange(rowNumber, 1, 1, HEADERS.length).getValues()[0];
      let changed = false;
      parsed.forEach((value, index) => {
        if (value && !current[index]) {
          current[index] = value;
          changed = true;
        }
      });
      if (parsed[4] === 'אישור השתתפות' && current[4] !== 'אישור השתתפות') {
        current[4] = parsed[4];
        changed = true;
      }
      if (changed) updates.push([rowNumber, current]);
      return;
    }
    rows.push(parsed);
  }));
  updates.forEach(([rowNumber, row]) => sheet.getRange(rowNumber, 1, 1, HEADERS.length).setValues([row]));
  if (!rows.length) return;
  rows.sort((a, b) => new Date(a[0]) - new Date(b[0]));
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
}

/**
 * JSON endpoint for the static admin panel.
 * Deploy this project as a Web app (execute as you, access: anyone with the link)
 * and paste the /exec URL into admin/dashboard.html.
 */
function doGet(e) {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || CONFIG.spreadsheetId;
  const sheet = SpreadsheetApp.openById(id).getSheetByName(CONFIG.sheetName);
  const values = sheet ? sheet.getDataRange().getDisplayValues() : [];
  const headers = values.shift() || HEADERS;
  const detailId = e && e.parameter ? String(e.parameter.details || '') : '';
  let rows = values.map(row => {
    const result = {};
    headers.forEach((header, i) => {
      // The full email body can be large. Keep it out of the initial payload;
      // the dashboard requests it lazily for one selected record only.
      if (detailId || header !== 'מידע מלא') result[header] = row[i] || '';
    });
    if (!detailId) result['מידע מלא'] = '';
    return result;
  });
  if (detailId) rows = rows.filter(row => String(row['Gmail message ID'] || '') === detailId);
  return ContentService.createTextOutput(JSON.stringify({ updatedAt: new Date().toISOString(), rows }))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0 || sheet.getRange(1, 1).getValue() !== HEADERS[0]) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1f6a4d').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    return;
  }
  const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  const missing = HEADERS.filter(header => !current.includes(header));
  if (missing.length) sheet.getRange(1, current.length + 1, 1, missing.length).setValues([missing]);
}

function getExistingMessageRows_(sheet) {
  const rows = new Map();
  if (sheet.getLastRow() < 2) return rows;
  sheet.getRange(2, 15, sheet.getLastRow() - 1, 1).getValues().forEach((row, index) => {
    if (row[0]) rows.set(String(row[0]), index + 2);
  });
  return rows;
}

function parseMessage_(message) {
  const body = message.getPlainBody();
  const subject = message.getSubject();
  const formType = field_(body, 'form_type');
  const representative = field_(body, 'representative_name');
  const waiver = /waiver|health declaration|participation|אישור השתתפות|הצהרת בריאות|וייבר/i.test(subject + ' ' + formType);
  const score = (subject.match(/\d+\/\d+/) || [''])[0];
  const quiz = /quiz|בוחן/i.test(subject + body);
  const training = /training interest:\s*yes|מעוניין/i.test(subject + body) ? 'כן' :
    /training interest:\s*no|לא מעוניין/i.test(subject + body) ? 'לא' : '';
  return [
    message.getDate().toISOString(),
    field_(body, 'name') || representative, field_(body, 'email'), field_(body, 'phone'),
    waiver ? 'אישור השתתפות' : quiz ? 'בוחן' : 'פנייה', waiver ? 'אישור השתתפות והצהרת בריאות' : field_(body, 'quiz') || subject, score, training,
    field_(body, 'language'), waiver ? '' : field_(body, 'message'), field_(body, 'source') || 'לא ידוע',
    field_(body, 'utm_campaign'), field_(body, 'referrer'), 'חדש', message.getId(), field_(body, 'interest'),
    field_(body, 'event'), field_(body, 'event_date'), field_(body, 'event_price'),
    formType, representative, field_(body, 'electronic_signature'), field_(body, 'signature_date'),
    field_(body, 'risk_and_terms_consent'), field_(body, 'health_data_explicit_consent'),
    field_(body, '01 — קישור לאישור המלא להדפסה') || field_(body, '01 — PRINTABLE WAIVER LINK'), body
  ];
}

function field_(body, label) {
  const lines = body.replace(/\r/g, '').split('\n');
  const index = lines.findIndex(line => line.trim().toLowerCase() === label.toLowerCase() + ':');
  if (index < 0) return '';
  const values = [];
  for (let i = index + 1; i < lines.length; i++) {
    if (!lines[i].trim() && !lines[i + 1]?.trim()) break;
    if (/^Submitted /.test(lines[i])) break;
    if (lines[i].trim()) values.push(lines[i].trim());
  }
  return values.join(' ');
}
