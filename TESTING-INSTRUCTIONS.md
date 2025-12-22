# הוראות בדיקה - Language Switcher
## Testing Instructions

---

## ⚠️ חשוב לפני הבדיקה!

אם פתחת את האתר לפני השינויים, ה-localStorage שלך כבר שמור בעברית.
זה יכול לגרום לבעיות. יש שתי דרכים לפתור:

### אפשרות 1: נקה את ה-localStorage (מומלץ)
1. פתח את האתר
2. לחץ F12 (Developer Tools)
3. עבור ל-Console
4. הדבק את הקוד הזה ולחץ Enter:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

### אפשרות 2: השתמש ב-Incognito/Private Mode
פתח את האתר בחלון פרטי (Incognito) - כך לא יהיה localStorage שמור.

---

## 🧪 בדיקה 1: כפתור השפות נראה?

1. פתח את `index.html` בדפדפן
2. האם אתה רואה כפתור עם 🌐 בפינה השמאלית העליונה?
   - ✅ **כן** - מעולה! עבור לבדיקה הבאה
   - ❌ **לא** - נסה לגלול מעלה או רענן את הדף (Ctrl+F5)

---

## 🧪 בדיקה 2: תפריט השפות נפתח?

1. לחץ על כפתור הגלובוס 🌐
2. האם התפריט נפתח עם שתי אפשרויות: "עברית" ו-"English"?
   - ✅ **כן** - מעולה!
   - ❌ **לא** - בדוק ב-Console (F12) אם יש שגיאות

---

## 🧪 בדיקה 3: החלפת שפה עובדת?

1. לחץ על English בתפריט
2. האם האתר התרגם לאנגלית?
   - ✅ **כן** - מעולה!
   - ❌ **לא** - בדוק שקובץ `translations.js` נטען

---

## 🧪 בדיקה 4: קישור ישיר באנגלית

1. סגור את כל הטאבים של האתר
2. נקה localStorage (ראה למעלה)
3. פתח את האתר עם הקישור הזה:
   ```
   file:///Users/yehonatancohen/Desktop/Cyprus-climbing/index.html?lang=en
   ```
   או אם האתר מועלה:
   ```
   https://your-site.com/?lang=en
   ```

4. האם האתר נפתח באנגלית?
   - ✅ **כן** - מושלם!
   - ❌ **לא** - המשך לבדיקת debug למטה

---

## 🔧 Debug - אם זה לא עובד

### בדיקה בקונסול:
פתח Console (F12) והדבק:

```javascript
console.log('Current URL:', window.location.href);
console.log('URL params:', new URLSearchParams(window.location.search).get('lang'));
console.log('localStorage:', localStorage.getItem('preferred-language'));
console.log('Current lang:', currentLang);
```

זה יראה לך מה קורה בפועל.

### נקה הכל והתחל מחדש:
```javascript
localStorage.clear();
window.location.href = window.location.pathname + '?lang=en';
```

---

## 🎯 בדיקת דף Test

פתחתי לך קובץ `test-lang.html` שמראה בדיוק מה קורה:

1. פתח `test-lang.html` בדפדפן
2. זה יראה לך:
   - מה הפרמטר ב-URL
   - מה שמור ב-localStorage
   - ה-URL המלא

3. נסה ללחוץ על הקישורים השונים ותראה מה משתנה

---

## ✅ מה צריך לעבוד:

1. **כפתור גלובוס 🌐** נראה בפינה השמאלית עליונה
2. **לחיצה על הכפתור** פותחת תפריט עם עברית/English
3. **בחירת English** משנה את כל התוכן לאנגלית
4. **קישור עם ?lang=en** פותח את האתר באנגלית
5. **הכפתור מעודכן** - מראה "EN" כשהאתר באנגלית
6. **השפה נשמרת** - אם סוגרים ופותחים שוב, השפה נשארת

---

## 📞 אם עדיין יש בעיה

הדבק בתשובה:
1. מה אתה רואה בקונסול (F12 → Console)
2. צילום מסך של הכפתור (או אם לא נראה - איפה הוא אמור להיות)
3. האם השתמשת בניקוי localStorage לפני הבדיקה?

---

**תאריך:** 22 בדצמבר 2025
