/**
 * Climbing Cyprus — website forms → Gmail + Google Sheets
 *
 * Run setupFormspreeSync() once from script.google.com. The script stores the
 * spreadsheet ID in Script Properties, imports existing Formspree emails, and
 * retains the legacy Formspree import and accepts direct website submissions.
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

/** Run once from the editor to grant the script permission to notify its owner. */
function authorizeLeadNotifications() {
  const email = Session.getEffectiveUser().getEmail();
  if (!email) throw new Error('Run this from the Google account that will own the web app deployment.');
  MailApp.getRemainingDailyQuota();
  SpreadsheetApp.openById(CONFIG.spreadsheetId).getSheetByName(CONFIG.sheetName);
  Logger.log('Lead notifications will be sent to ' + email);
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
  let rows = values.map((row, rowIndex) => {
    const result = {};
    headers.forEach((header, i) => {
      // The full email body can be large. Keep it out of the initial payload;
      // the dashboard requests it lazily for one selected record only.
      if (detailId || header !== 'מידע מלא') result[header] = row[i] || '';
    });
    if (!detailId) result['מידע מלא'] = '';
    result._rowNumber = rowIndex + 2;
    result._rowFingerprint = rowFingerprint_(row);
    return result;
  });
  if (detailId) rows = rows.filter(row => String(row['Gmail message ID'] || '') === detailId);
  return ContentService.createTextOutput(JSON.stringify({ updatedAt: new Date().toISOString(), rows }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Receives JSON POSTs from the static site (sent as text/plain to avoid CORS preflight). */
function doPost(e) {
  const raw = e && e.postData ? e.postData.contents : '';
  const data = raw ? JSON.parse(raw) : {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid submission');
  if (data.action === 'delete_lead' || data.action === 'delete_leads') return handleLeadDeletion_(data);
  // Never let an API action fall through to the form-submission path, which appends a row and emails the owner.
  if (String(data.action || '').trim()) return json_({ ok: false, error: 'Unsupported action' });
  if (String(data.website || '').trim()) return json_({ ok: true }); // honeypot
  const fields = data.fields || {};
  const sender = String(fields.email || '').trim().toLowerCase();
  if (sender && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender)) throw new Error('Invalid email');
  if (JSON.stringify(data).length > 1800000) throw new Error('Submission is too large');
  if (sender) {
    const rateKey = 'sender:' + Utilities.base64EncodeWebSafe(sender);
    const cache = CacheService.getScriptCache();
    const count = Number(cache.get(rateKey) || 0);
    if (count >= 8) throw new Error('Submission rate limit reached');
    cache.put(rateKey, String(count + 1), 3600);
  }
  const submissionId = String(data.submission_id || '').slice(0, 100);
  const cache = CacheService.getScriptCache();
  if (submissionId && cache.get('submission:' + submissionId)) return json_({ ok: true, duplicate: true });

  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || CONFIG.spreadsheetId;
  const ss = SpreadsheetApp.openById(id);
  const sheet = ss.getSheetByName(CONFIG.sheetName) || ss.insertSheet(CONFIG.sheetName);
  ensureHeader_(sheet);
  const values = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, String(value == null ? '' : value)]));
  const subject = values._subject || values.subject || values.quiz || values.request_type || values.form_type || 'פנייה חדשה מהאתר';
  const waiver = /waiver|health declaration|participation|אישור השתתפות|הצהרת בריאות|וייבר/i.test(subject + ' ' + (values.form_type || ''));
  const quiz = Boolean(values.quiz || values.score);
  const full = Object.entries(values).filter(([key]) => !key.startsWith('_')).map(([key, value]) => key + ':\n' + value).join('\n\n');
  const row = [
    new Date().toISOString(), values.name || values.representative_name || '', values.email || '', values.phone || '',
    waiver ? 'אישור השתתפות' : quiz ? 'בוחן' : values.request_type === 'topo_download' ? 'הורדת טופו' : 'פנייה',
    waiver ? 'אישור השתתפות והצהרת בריאות' : values.quiz || subject, values.score || '',
    values.training_interest || values.training_interest_choice || '', values.language || '', values.message || values['03 — סיכום מלא מוכן להדפסה'] || values['03 — FULL PRINT-READY SUMMARY'] || '',
    values.source || data.source || 'direct', values.utm_campaign || values.campaign || data.campaign || '', values.referrer || data.referrer || '', 'חדש', '', values.interest || '',
    values.event || '', values.event_date || '', values.event_price || '', values.form_type || '', values.representative_name || '',
    values.electronic_signature || '', values.signature_date || '', values.risk_and_terms_consent || '', values.health_data_explicit_consent || '',
    values['01 — קישור לאישור המלא להדפסה'] || values['01 — PRINTABLE WAIVER LINK'] || '', full
  ];
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    sheet.appendRow(row);
  } finally { lock.releaseLock(); }

  const recipient = Session.getEffectiveUser().getEmail();
  if (!recipient) throw new Error('Could not determine the script owner email');
  const body = 'התקבלה פנייה חדשה באתר Climbing Cyprus.\n\n' + full;
  const mail = { to: recipient, subject: subject, body: body, replyTo: values.email || undefined };
  if (data.attachment && data.attachment.base64) {
    const bytes = Utilities.base64Decode(data.attachment.base64);
    mail.attachments = [Utilities.newBlob(bytes, data.attachment.mimeType || 'text/html', data.attachment.filename || 'waiver.html')];
  }
  MailApp.sendEmail(mail);
  if (submissionId) cache.put('submission:' + submissionId, '1', 21600);
  return json_({ ok: true });
}

/** Deletes the selected lead after the admin confirms in the dashboard. */
function handleLeadDeletion_(data) {
  const requestedRows = data.action === 'delete_leads' ? data.leads : [{ rowNumber: data.rowNumber, fingerprint: data.fingerprint }];
  if (!Array.isArray(requestedRows) || !requestedRows.length || requestedRows.length > 100) return json_({ ok: false, error: 'בחרו בין ליד אחד ל־100 לידים למחיקה' });
  const rowsToDelete = requestedRows.map(item => ({ rowNumber: Number(item && item.rowNumber), fingerprint: String(item && item.fingerprint || '') }));
  if (rowsToDelete.some(item => !Number.isInteger(item.rowNumber) || item.rowNumber < 2 || !item.fingerprint) || new Set(rowsToDelete.map(item => item.rowNumber)).size !== rowsToDelete.length) {
    return json_({ ok: false, error: 'רשימת הלידים למחיקה אינה תקינה' });
  }
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || CONFIG.spreadsheetId;
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = SpreadsheetApp.openById(id).getSheetByName(CONFIG.sheetName);
    if (!sheet || rowsToDelete.some(item => item.rowNumber > sheet.getLastRow())) return json_({ ok: false, error: 'אחד הלידים כבר לא זמין' });
    for (const item of rowsToDelete) {
      const row = sheet.getRange(item.rowNumber, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      if (rowFingerprint_(row) !== item.fingerprint) return json_({ ok: false, error: 'פרטי אחד הלידים השתנו. רעננו את הרשימה ונסו שוב.' });
      const type = String(row[4] || '').trim();
      const form = String(row[19] || row[5] || '');
      if (type === 'אישור השתתפות' || /אישור השתתפות|הצהרת בריאות|participation waiver|health declaration|waiver/i.test(form)) {
        return json_({ ok: false, error: 'אישורי השתתפות לא ניתן למחוק מרשימת הלידים' });
      }
    }
    rowsToDelete.sort((a, b) => b.rowNumber - a.rowNumber).forEach(item => sheet.deleteRow(item.rowNumber));
    return json_({ ok: true, deleted: rowsToDelete.length });
  } finally { lock.releaseLock(); }
}

function rowFingerprint_(row) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify(row), Utilities.Charset.UTF_8);
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '');
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
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
