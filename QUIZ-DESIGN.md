# Quiz presentation convention

Localized clipping covers: `pics/clipping-quiz-square-he.jpg` and `pics/clipping-quiz-square-en.jpg`.

Use the lead-belaying quiz as the visual reference for future quizzes.

- Supply separate Hebrew and English square (1:1) covers. Compose the artwork for a square; do not pad a portrait cover or crop embedded titles. Use the established navy, amber and white photo/poster treatment.
- Reuse the exact same cover in the homepage/guide card and on the quiz's opening screen.
- Opening order: site logo and navigation, square cover, quiz title and description, then start or registration controls. Hide the cover during questions.
- Include `/quiz-presentation.css` for the shared opening layout and `/quiz-integration.css` for listing cards. Existing lead-belaying UI styling is in `lead-belaying-quiz/brand.css`.
- Keep Hebrew RTL and English LTR; retain language-specific covers and copy.
- Add future quizzes to the same listing area on both homepages and both climber-guide pages.

Clipping cover generation: built-in ImageGen, two localized edits. Prompt: recompose each existing clipping cover into a full-bleed 1:1 square using the lead-belaying cover as the style reference, preserve quickdraw/hand/rope subject and geometry, use navy, amber and distressed white typography, with only “CLIPPING SKILLS QUIZ / Test your knowledge” or “בוחן שליטה בהקלפות / בדקו את הידע שלכם”.
