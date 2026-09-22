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
