# קפריסין בעין אחרת - Cyprus Through Different Eyes

אתר סטטי לטיפוס צוקים וטיולים מודרכים בקפריסין
Static website for rock climbing and guided tours in Cyprus

## תכונות / Features

- 🌍 תמיכה ב-4 שפות: עברית, אנגלית, רוסית ויוונית
- 🌍 Multi-language support: Hebrew, English, Russian, Greek
- 📱 עיצוב רספונסיבי המתאים לכל המכשירים
- 📱 Responsive design for all devices
- ⚡ אתר סטטי מהיר וקל
- ⚡ Fast and lightweight static site
- 🎨 עיצוב מודרני ונקי
- 🎨 Modern and clean design

## מבנה הקבצים / File Structure

```
Cyprus-climbing/
├── index.html          # דף הבית הראשי / Main homepage
├── style.css           # קובץ עיצוב / Styling file
├── script.js           # פונקציונליות JavaScript / JavaScript functionality
├── translations.js     # תרגומים לכל השפות / Translations for all languages
└── README.md          # תיעוד / Documentation
```

## איך להריץ מקומית / How to Run Locally

1. פתח את הקובץ `index.html` בדפדפן
2. Just open `index.html` in your browser

זהו! האתר לא דורש שרת או התקנה מיוחדת.
That's it! The site requires no server or special installation.

## איך להעלות לאתר חינמי / How to Deploy for Free

### אפשרות 1: GitHub Pages (מומלץ / Recommended)

1. צור חשבון GitHub (אם אין לך)
   Create a GitHub account (if you don't have one)
   
2. צור repository חדש
   Create a new repository

3. העלה את כל הקבצים ל-repository
   Upload all files to the repository

4. עבור להגדרות (Settings) → Pages
   Go to Settings → Pages

5. בחר את ה-branch הראשי (main/master) ולחץ Save
   Select the main branch and click Save

6. האתר שלך יהיה זמין ב:
   Your site will be available at:
   `https://[username].github.io/[repository-name]`

**מדריך מפורט:**
- https://pages.github.com/

### אפשרות 2: Netlify

1. צור חשבון ב-Netlify: https://www.netlify.com/
   Create an account at Netlify

2. גרור את התיקייה לאזור ההעלאה באתר
   Drag the folder to the upload area on the site

3. האתר שלך יהיה מוכן תוך שניות!
   Your site will be ready in seconds!

**יתרונות:**
- העלאה פשוטה בגרירה
- תעודת SSL חינמית
- עדכונים אוטומטיים

**Advantages:**
- Simple drag-and-drop upload
- Free SSL certificate
- Automatic updates

### אפשרות 3: Vercel

1. צור חשבון ב-Vercel: https://vercel.com/
   Create an account at Vercel

2. התקן Vercel CLI:
   Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

3. במסוף, נווט לתיקיית הפרויקט והרץ:
   In terminal, navigate to project folder and run:
   ```bash
   vercel
   ```

4. עקוב אחר ההוראות
   Follow the instructions

### אפשרות 4: Cloudflare Pages

1. צור חשבון ב-Cloudflare: https://pages.cloudflare.com/
   Create an account at Cloudflare

2. התחבר ל-GitHub repository שלך
   Connect to your GitHub repository

3. Cloudflare יבנה ויפרסם את האתר אוטומטית
   Cloudflare will build and deploy automatically

### אפשרות 5: Firebase Hosting

1. התקן Firebase CLI:
   Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. התחבר ל-Firebase:
   Login to Firebase:
   ```bash
   firebase login
   ```

3. אתחל את הפרויקט:
   Initialize the project:
   ```bash
   firebase init hosting
   ```

4. העלה את האתר:
   Deploy the site:
   ```bash
   firebase deploy
   ```

## התאמה אישית / Customization

### החלפת תמונות / Replacing Images

כרגע האתר משתמש בתמונות placeholder. כדי להחליף אותן:
Currently the site uses placeholder images. To replace them:

1. שמור את התמונות שלך בתיקיית הפרויקט (או השתמש ב-URL חיצוני)
   Save your images in the project folder (or use external URLs)

2. עדכן את ה-`src` בקובץ `index.html`:
   Update the `src` in `index.html`:
   ```html
   <img src="path/to/your/image.jpg" alt="Description">
   ```

### הוספת לוגו / Adding Logo

הוסף את הלוגו שלך בקובץ `index.html` בקטע `.logo`:
Add your logo in `index.html` in the `.logo` section:

```html
<div class="logo">
    <img src="path/to/logo.png" alt="Cyprus Adventures Logo" style="height: 50px;">
    <h2 data-i18n="site-title">קפריסין בעין אחרת</h2>
</div>
```

### שינוי צבעים / Changing Colors

ערוך את הצבעים בקובץ `style.css` בחלק `:root`:
Edit colors in `style.css` in the `:root` section:

```css
:root {
    --primary-color: #2c5f2d;    /* צבע ראשי / Primary color */
    --secondary-color: #97c93c;  /* צבע משני / Secondary color */
    --accent-color: #f47920;     /* צבע מבטא / Accent color */
}
```

### עדכון תוכן / Updating Content

כל הטקסטים נמצאים בקובץ `translations.js`. עדכן את הטקסט בכל השפות:
All texts are in `translations.js`. Update the text in all languages:

```javascript
const translations = {
    he: {
        "hero-title": "הכותרת החדשה שלך",
        // ...
    },
    en: {
        "hero-title": "Your New Title",
        // ...
    }
    // ...
};
```

## פרטי התקשרות / Contact Details

להוספת פרטי התקשרות נוספים, ערוך את קטע הקונטקט ב-`index.html`:
To add more contact details, edit the contact section in `index.html`:

```html
<div class="contact-info">
    <p>📧 Email: your-email@example.com</p>
    <p>📱 Phone: +357-XX-XXXXXX</p>
    <p>📍 Location: Cyprus</p>
</div>
```

## טיפים לאופטימיזציה / Optimization Tips

1. **דחיסת תמונות** - השתמש בכלים כמו TinyPNG להקטנת גודל התמונות
   **Image Compression** - Use tools like TinyPNG to reduce image sizes

2. **Lazy Loading** - הוסף `loading="lazy"` לתמונות:
   Add `loading="lazy"` to images:
   ```html
   <img src="image.jpg" alt="Description" loading="lazy">
   ```

3. **CDN** - שקול שימוש ב-CDN לקבצי CSS/JS חיצוניים
   **CDN** - Consider using CDN for external CSS/JS files

## תמיכה טכנית / Technical Support

לשאלות או בעיות:
For questions or issues:

- פתח issue ב-GitHub repository
- Open an issue on the GitHub repository

## רישיון / License

זהו פרויקט קוד פתוח לשימוש חופשי.
This is an open-source project for free use.

---

**הערה חשובה:** זכור להחליף את כל התמונות ה-placeholder בתמונות האמיתיות שלך לפני העלאה לאתר ציבורי!

**Important Note:** Remember to replace all placeholder images with your actual images before deploying to a public site!

## קישורים שימושיים / Useful Links

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)

---

נוצר עם ❤️ עבור חוויות טיפוס וטיולים בקפריסין
Created with ❤️ for climbing and hiking adventures in Cyprus
