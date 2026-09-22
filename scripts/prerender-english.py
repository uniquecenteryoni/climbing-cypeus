#!/usr/bin/env python3
"""Apply the existing translation catalog to generated English HTML copies."""

import json
import os
import subprocess
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
ENGLISH = ROOT / "en"

node_script = """
const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync(process.argv[1], 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(`${source}\nthis.__translations = translations;`, context);
process.stdout.write(JSON.stringify(context.__translations));
"""

result = subprocess.run(
    ["node", "-e", node_script, str(ROOT / "translations.js")],
    check=True,
    capture_output=True,
    text=True,
)
translations = json.loads(result.stdout)
english = translations.get("en", {})

PAGE_TRANSLATIONS = {
    "סנפלינג בקפריסין": "Rappelling in Cyprus",
    "© 2024 קפריסין בעין אחרת. כל הזכויות שמורות.": "© 2024 Cyprus Through Different Eyes. All rights reserved.",
    "טיפוס צוקים בקפריסין": "Rock climbing in Cyprus",
    "אתרי טיפוס": "Climbing locations",
    "טיפוס משפחתי": "Family climbing",
    "בחירת גודל קבוצה": "Choose group size",
    "סנפלינג": "Rappelling",
    "סנפלינג במיקומים ייחודיים": "Rappelling in unique locations",
    "עד 12 משתתפים": "Up to 12 participants",
    "טעימות מקומיות - בתוספת תשלום": "Local tastings - available at an additional cost",
    "- מסלולי קלידוניה, מילומרי, ושביל הקשתות": "- Caledonia, Millomeris and Arches trails",
    "- פיניקריה, אומודוס, ולפקרה": "- Phinikaria, Omodos and Lefkara",
    "- יער ארמוס, פלטניה, ומדארי": "- Artemis, Platres and Madari forests",
    "- הר אולימפוס ומסלולי טרודוס": "- Mount Olympus and Troodos trails",
    "- שביל אפרודיטה ומסלול אקאמס": "- Aphrodite Trail and Akamas routes",
    "- קניון אווקאס ועוד": "- Avakas Gorge and more",
    "יש לנו מסלולים קלים במיוחד המתאימים לילדים מגיל 4 ומעלה. הטיולים כוללים הפסקות, משחקים והסברים מעניינים שמתאימים לגיל הילדים.": "We offer especially easy trails suitable for children aged 4 and up. Tours include breaks, games and engaging explanations adapted to children.",
    "מסלולים מאתגרים יותר עם עליות, מרחקים ארוכים יותר, ונופים מרהיבים.": "More challenging trails with climbs, longer distances and spectacular views.",
    "טיולים חברתיים ומהנים למסיבות רווקות, ימי גיבוש, או סתם יום כיף עם החברים.": "Fun social tours for bachelor and bachelorette parties, team days or simply a great day with friends.",
    "Indoor · בולדרינג · כל הרמות": "Indoor · Bouldering · All levels",
    "Indoor · קהילה · אימון": "Indoor · Community · Training",
    "Indoor · חדש · בולדרינג": "Indoor · New · Bouldering",
    "Indoor · לימסול · אימון": "Indoor · Limassol · Training",
    "Outdoor · מסלולים ארוכים · 7+": "Outdoor · Long routes · 7+",
    "Outdoor · מגוון דירוגים · קהילה": "Outdoor · A range of grades · Community",
    "Outdoor · יום מלא": "Outdoor · Full day",
    "Outdoor · מתחילים · צל": "Outdoor · Beginners · Shade",
    "Outdoor · כל הרמות · צל": "Outdoor · All levels · Shade",
    "Outdoor · כל הרמות · נוף לים": "Outdoor · All levels · Sea view",
    "בולדרינג באזור Ineia & Drousia": "Bouldering around Ineia & Drousia",
    "הדרכות וימי חוויה בקפריסין": "Guided climbing days and experiences in Cyprus",
    "אפשר להצטרף להדרכות טיפוס לקבוצות, לימי חוויה וכיף בטבע, ולבנות יחד יום שמתאים לרמה ולאופי של הקבוצה. אני מתאים את המסלול לקצב שלכם, משלב הסברים מקצועיים, תרגול בטוח וזמן ליהנות מהנוף — גם אם זו הפעם הראשונה שלכם על מצוק.": "Join group climbing instruction, fun days in nature and tailor-made experiences. I adapt the route to your pace, combine professional guidance with safe practice and leave time to enjoy the scenery — even if it is your first time on a cliff.",
    "אחרי יום על המצוקים אפשר להמשיך לארוחה טובה, לינה נוחה או פעילות רגועה ליד הים. ריכזתי כאן כמה אפשרויות נבחרות שיעזרו לכם לסגור את היום בקלות ולהישאר קרובים לאזורי הטיפוס.": "After a day on the cliffs, continue with a great meal, comfortable accommodation or a relaxed activity by the sea. Here are selected options to help you plan the rest of your day while staying close to the climbing areas.",
    "לינה קרובה למצוקים": "Accommodation near the crags",
    "מלון כפרי באזור פאפוס, עם נוף פתוח ואווירה שקטה.": "A countryside hotel near Paphos, with open views and a peaceful atmosphere.",
    "מלון משפחתי מול ההרים והכפר דרושיה, קרוב לאזורי הטיפוס.": "A family hotel facing the mountains and Droushia village, close to the climbing areas.",
    "בית אבן מסורתי באווירה אותנטית, במרכז הכפר דרושיה.": "A traditional stone house with an authentic atmosphere in the heart of Droushia village.",
    "עוד דברים שיעזרו לכם": "More useful options",
    "הורדת טופו בולדרינג": "Download the Cyprus bouldering topo",
    "השאירו את האימייל שלכם ונשלח לכם את הטופו בחינם!": "Leave your email and we will send you the topo for free!",
    "שלח לי את הטופו": "Send me the topo",
    "מטפס בטיפוס הובלה במדבר": "Climber lead climbing in the desert",
    "יונתן – מדריך טיפוס מוסמך": "Yonatan - certified climbing guide",
    "יונתן - מדריך טיפוס מוסמך": "Yonatan - certified climbing guide",
    "יתרונות הפעילות": "Activity benefits",
    "קורס טיפוס הובלה": "Lead climbing course",
    "השכרת ציוד טיפוס": "Climbing gear rental",
    "השכרת ציוד מקצועי לטיפוס - חבלים, רתמות, קסדות, מכשירי אבטחה, ראנרים וקראשפדים. מושלם למטפסים שרוצים לצאת לעצמאות או לתרגל בולדרינג.": "Professional climbing gear rental - ropes, harnesses, helmets, belay devices, quickdraws and crash pads. Perfect for climbers who want to climb independently or practice bouldering.",
    ", קראשפד מתקפל בגודל כ־100×130 ס״מ, מתאים לבולדרינג ולכיסוי אזור נחיתה בשטח.": ", a foldable crash pad measuring approximately 100×130 cm, suitable for bouldering and covering landing zones outdoors.",
    "תמונות קראשפדים להשכרה": "Crash pad rental photos",
    "קראשפד Ocun להשכרה לבולדרינג בקפריסין": "Ocun crash pad for bouldering rental in Cyprus",
    "קראשפד בשטח בקפריסין": "Crash pad in the field in Cyprus",
    "תמונה קודמת": "Previous image",
    "תמונה הבאה": "Next image",
    "בחירת תמונת קראשפד": "Choose crash pad image",
    "סרטוני בולדרינג מערוץ Climbing Cyprus בדירוג 7A ומעלה": "Bouldering videos from the Climbing Cyprus channel, grade 7A and above",
    "סרטון קודם": "Previous video",
    "סרטון הבא": "Next video",
    "בחירת סרטון בולדרינג": "Choose bouldering video",
    "סרטון 1": "Video 1",
    "סרטון 2": "Video 2",
    "סרטון 3": "Video 3",
    "סרטון 4": "Video 4",
    "סרטון 5": "Video 5",
    "סרטון 6": "Video 6",
    "סרטון 7": "Video 7",
    "בחירת שפה": "Language selection",
    "חזרה למדריך": "Back to guide",
    "פריסת אזורי הטיפוס באי": "Map of climbing areas on the island",
    "פריסת דירוג המסלולים בקפריסין": "Map of climbing grades in Cyprus",
    "יונתן מטפס עם חולצת Petzl": "Yonatan climbing in a Petzl shirt",
    "החלק הצפוני של קפריסין": "Northern Cyprus",
    "בולדרינג בקפריסין": "Bouldering in Cyprus",
    "כריכת גייד הבולדרינג של קפריסין": "Cover of the Cyprus bouldering guide",
    "יונתן מטפס בקפריסין": "Yonatan climbing in Cyprus",
    "בתי קפה בקפריסין": "Cafes in Cyprus",
    "Farmyard Restaurant בקפריסין": "Farmyard Restaurant in Cyprus",
    "הלגונה הכחולה בקפריסין": "The Blue Lagoon in Cyprus",
    "מפל קרמוטיס בקפריסין": "Kremiotis Waterfall in Cyprus",
    "דניאל אלבז": "Daniel Elbaz",
    "טל הראל": "Tal Harel",
    "מירב שלם": "Merav Shalem",
    "סיוון חן": "Sivan Chen",
    "אייל שרעבי": "Eyal Sharabi",
    "ירדן כהן": "Yarden Cohen",
    "הראל וייסמן": "Harel Weissman",
    "קפריסין בחורף המושלג": "Cyprus in snowy winter",
    "עמק הארזים": "Cedar Valley",
    "חזרה למדריך": "Back to guide",
    "בית": "Home",
    "טיפוס צוקים וסנפלינג": "Rock Climbing & Rappelling",
    "צור קשר": "Contact us",
    "טיולים מודרכים": "Guided tours",
    "טיולים מודרכים בקפריסין": "Guided tours in Cyprus",
    "מסלולים מגוונים": "Diverse trails",
    "מתאים לכל המשפחה": "Suitable for the whole family",
    "הדרכה מקצועית": "Professional guidance",
    "על הפעילות": "About the activity",
    "סוגי מסלולים": "Trail types",
    "מה כלול בטיול?": "What is included?",
    "למי זה מתאים?": "Who is it for?",
    "קפריסין מציעה מגוון עצום של מסלולי הליכה - ממפרצי ים התיכון המרהיבים, דרך מפלים שוצפים ונחלים זורמים, ועד לשיאי הרי טרודוס המושלגים. כל מסלול מציע חוויה ייחודית ונופים עוצרי נשימה.": "Cyprus offers an enormous variety of hiking trails, from spectacular Mediterranean coves and flowing waterfalls to the snow-capped peaks of the Troodos mountains. Every trail offers a unique experience and breathtaking views.",
    "אני מדריך מוסמך עם ניסיון של שנים בהדרכת טיולים בקפריסין. כל טיול מותאם אישית לצרכים, ליכולות ולהעדפות שלכם - בין אם אתם משפחה עם ילדים קטנים המחפשת טיול קל ונוח, או מטיילים מנוסים המחפשים אתגר.": "I am a certified guide with years of experience leading tours in Cyprus. Every tour is tailored to your needs, abilities and preferences, whether you are a family looking for an easy outing or experienced hikers looking for a challenge.",
    "מפלים ונחלים": "Waterfalls and streams",
    "כפרים הרריים": "Mountain villages",
    "יערות ונופים": "Forests and scenery",
    "שיאי הרים": "Mountain peaks",
    "מסלולי חוף": "Coastal trails",
    "קניונים": "Canyons",
    "מדריך מוסמך ומנוסה": "Certified and experienced guide",
    "תכנון מסלול מותאם אישית": "Personalized route planning",
    "ביטוח מלא": "Full insurance",
    "מים ונשנושים": "Water and snacks",
    "הסברים על הטבע וההיסטוריה": "Insights into nature and history",
    "תיעוד צילומי": "Photo documentation",
    "משפחות עם ילדים:": "Families with children:",
    "מבוגרים פעילים:": "Active adults:",
    "קבוצות וחברים:": "Groups and friends:",
    "הזמנת טיול": "Book a tour",
    "לאדם (בהתאם למסלול)": "per person (depending on the route)",
    "צרו קשר": "Contact us",
    "טיולים פופולריים": "Popular tours",
    "מפל קלידוניה": "Caledonia Waterfall",
    "כפר פיניקריה": "Phinikaria Village",
    "שביל הקשתות": "Arches Trail",
    "קניון אווקאס": "Avakas Gorge",
    "מה להביא?": "What to bring",
    "נעלי הליכה נוחות": "Comfortable hiking shoes",
    "בקבוק מים": "A water bottle",
    "כובע ומשקפי שמש": "A hat and sunglasses",
    "קרם הגנה": "Sunscreen",
    "מצלמה": "A camera",
    "חטיפים קלים": "Light snacks",
    "מוכנים לטיול?": "Ready for a tour?",
    "צרו איתנו קשר ונבנה ביחד את הטיול המושלם עבורכם": "Contact us and we will build the perfect tour for you together",
    "קפריסין בעין אחרת": "Cyprus Through Different Eyes",
    "כל הזכויות שמורות": "All rights reserved",
}


def apply_translations(path: Path) -> None:
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")

    for element in soup.select("[data-i18n], [data-i18n-html]"):
        key = element.get("data-i18n") or element.get("data-i18n-html")
        value = english.get(key)
        if value is None:
            continue
        fragment = BeautifulSoup(str(value), "html.parser")
        element.clear()
        element.extend(fragment.contents)

    for element in soup.select("[data-i18n-placeholder]"):
        value = english.get(element.get("data-i18n-placeholder"))
        if value is not None:
            element["placeholder"] = value

    for element in soup.select("[data-i18n-title]"):
        value = english.get(element.get("data-i18n-title"))
        if value is not None:
            element["title"] = value

    # Some legacy pages contain prose without data-i18n attributes. Translate
    # those exact text nodes during the static build so Google receives English
    # in the initial HTML rather than only after JavaScript runs.
    for text_node in soup.find_all(string=True):
        if text_node.parent.name in {"script", "style"}:
            continue
        original = " ".join(text_node.strip().split())
        translated = PAGE_TRANSLATIONS.get(original)
        if translated:
            text_node.replace_with(text_node.replace(original, translated))

    for element in soup.find_all(True):
        for attribute in ("alt", "aria-label", "title"):
            value = element.get(attribute)
            if value in PAGE_TRANSLATIONS:
                element[attribute] = PAGE_TRANSLATIONS[value]

    rendered = "\n".join(line.rstrip() for line in str(soup).splitlines()) + "\n"
    path.write_text(rendered, encoding="utf-8")


for html_file in sorted(ENGLISH.glob("*.html")):
    apply_translations(html_file)

print(f"Prerendered English translations in {len(list(ENGLISH.glob('*.html')))} pages")
