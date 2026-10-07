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
  'סטטוס', 'Gmail message ID'
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
  ScriptApp.newTrigger('syncFormspreeToSheet').timeBased().everyHours(1).create();
  syncFormspreeToSheet();
}

function syncFormspreeToSheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || CONFIG.spreadsheetId;
  const ss = SpreadsheetApp.openById(id);
  const sheet = ss.getSheetByName(CONFIG.sheetName) || ss.insertSheet(CONFIG.sheetName);
  ensureHeader_(sheet);
  const existing = getExistingMessageIds_(sheet);
  const rows = [];
  GmailApp.search(CONFIG.gmailQuery).forEach(thread => thread.getMessages().forEach(message => {
    const id = message.getId();
    if (existing.has(id)) return;
    rows.push(parseMessage_(message));
  }));
  if (!rows.length) return;
  rows.sort((a, b) => new Date(a[0]) - new Date(b[0]));
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0 || sheet.getRange(1, 1).getValue() !== HEADERS[0]) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1f6a4d').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
}

function getExistingMessageIds_(sheet) {
  if (sheet.getLastRow() < 2) return new Set();
  return new Set(sheet.getRange(2, 15, sheet.getLastRow() - 1, 1).getValues().flat().filter(String));
}

function parseMessage_(message) {
  const body = message.getPlainBody();
  const subject = message.getSubject();
  const score = (subject.match(/\d+\/\d+/) || [''])[0];
  const quiz = /quiz|בוחן/i.test(subject + body);
  const training = /training interest:\s*yes|מעוניין/i.test(subject + body) ? 'כן' :
    /training interest:\s*no|לא מעוניין/i.test(subject + body) ? 'לא' : '';
  return [
    message.getDate().toISOString(),
    field_(body, 'name'), field_(body, 'email'), field_(body, 'phone'),
    quiz ? 'בוחן' : 'פנייה', field_(body, 'quiz') || subject, score, training,
    field_(body, 'language'), field_(body, 'message'), field_(body, 'source') || 'לא ידוע',
    field_(body, 'utm_campaign'), field_(body, 'referrer'), 'חדש', message.getId()
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
