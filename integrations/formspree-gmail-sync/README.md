# סנכרון Formspree → Gmail → Google Sheets

האתר נשאר סטטי. הסקריפט רץ בתוך Google Apps Script, קורא את הודעות Formspree שהגיעו ל־Gmail ומוסיף רק הודעות חדשות ל־Google Sheet.

## הפעלה חד־פעמית

1. פתח את [Google Sheet של הלידים](https://docs.google.com/spreadsheets/d/1OfXQhLIeWuduWEUbJuifDjUnYEZjnjBRV6wMR6o8ZbE/edit).
2. בתפריט `Extensions` בחר `Apps Script`.
3. מחק את הקוד הקיים והדבק את תוכן `Code.gs`.
4. שמור, בחר בפונקציה `setupFormspreeSync` ולחץ `Run`.
5. אשר את הרשאות Gmail ו־Google Sheets.

הסקריפט יבצע ייבוא ראשוני וייצור טריגר אוטומטי שרץ פעם בשעה. כל הודעה מזוהה לפי `Gmail message ID`, ולכן היא לא תיובא פעמיים.

## חיבור הנתונים לפאנל באתר

ב־Apps Script בחר `Deploy → New deployment → Web app`, בחר `Execute as: Me` ובחר גישה `Anyone with the link`. העתק את כתובת ה־`/exec` והדבק אותה במקום `const DATA_URL = '';` בקובץ `admin/dashboard.html`. לאחר מכן דחוף את הקובץ ל־GitHub.

הערה: Web App פתוח מאפשר לכל מי שמחזיק בכתובת לקרוא את הנתונים. אם הפרטיות חשובה, השאר את הנתונים בתוך Google Sheets ואל תפעיל Web App ציבורי, או השתמש בהגנת גישה חיצונית.

## הערות

- צריך להפעיל את הסקריפט מתוך חשבון Google שאליו מגיעות הודעות Formspree.
- מקור הגעה ו־UTM ימולאו רק בהודעות חדשות שבהן האתר שלח את השדות האלה.
- שינוי סטטוס או הוספת הערות אפשר לעשות ישירות בגיליון, והסנכרון לא ידרוס אותן.
