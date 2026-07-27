(function () {
    "use strict";

    const form = document.getElementById("waiverForm");
    const participantsRoot = document.getElementById("participants");
    const participantTemplate = document.getElementById("participantTemplate");
    const addParticipantButton = document.getElementById("addParticipant");
    const participantCount = document.getElementById("participantCount");
    const progressBar = document.getElementById("progressBar");
    const submittedAt = document.getElementById("submittedAt");
    const signatureDate = document.getElementById("signatureDate");
    const submitButton = document.getElementById("submitButton");
    const successState = document.getElementById("successState");
    const printSubmittedWaiver = document.getElementById("printSubmittedWaiver");
    const consentCard = document.querySelector(".consent-card");
    const MAX_PARTICIPANTS = 20;
    const isEnglish = document.documentElement.lang === "en";
    let lastPrintableHtml = "";
    let lastPrintLink = "";

    function localDate() {
        return new Intl.DateTimeFormat(isEnglish ? "en-GB" : "he-IL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(new Date());
    }

    function escapeHtml(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function fieldValue(name) {
        return form.elements[name] ? form.elements[name].value.trim() : "";
    }

    function participantData() {
        return [...participantsRoot.querySelectorAll(".participant-card")].map((card) => ({
            name: card.querySelector('[data-name="full_name"]').value.trim(),
            age: card.querySelector('[data-name="age"]').value.trim(),
            health: card.querySelector('[data-name="health_information"]').value.trim()
        }));
    }

    function buildPlainTextSummary() {
        const participants = participantData();
        const heading = isEnglish ? "PRINT-READY WAIVER SUMMARY" : "סיכום אישור מוכן להדפסה";
        const lines = [
            heading,
            "================================",
            `${isEnglish ? "Representative" : "נציג/ה"}: ${fieldValue("representative_name")}`,
            `${isEnglish ? "Email" : "אימייל"}: ${fieldValue("email")}`,
            `${isEnglish ? "Phone" : "טלפון"}: ${fieldValue("phone")}`,
            `${isEnglish ? "Country" : "ארץ"}: ${fieldValue("country")}`,
            `${isEnglish ? "Electronic signature" : "חתימה אלקטרונית"}: ${fieldValue("electronic_signature")}`,
            `${isEnglish ? "Date" : "תאריך"}: ${signatureDate.value}`,
            "",
            isEnglish
                ? "The adult representative confirmed that this signature applies to every participant entered in the form."
                : "הנציג/ה הבגיר/ה אישר/ה כי החתימה חלה על כל המשתתפים שהוזנו בטופס.",
            isEnglish
                ? "The approval covers all activity stages, including travel, approach to the crag and return."
                : "האישור חל על כל שלבי הפעילות, לרבות נסיעה, דרך הגישה למצוק והחזרה ממנו.",
            "",
            isEnglish ? "PARTICIPANTS" : "משתתפים"
        ];

        participants.forEach((participant, index) => {
            lines.push(
                "",
                `${index + 1}. ${participant.name}`,
                `${isEnglish ? "Age" : "גיל"}: ${participant.age}`,
                `${isEnglish ? "Health, allergies and medication" : "מצב רפואי, אלרגיות ותרופות"}: ${participant.health}`
            );
        });

        lines.push(
            "",
            isEnglish ? "Risk and terms consent: APPROVED" : "אישור סיכונים ותנאים: אושר",
            isEnglish ? "Explicit health-data consent: APPROVED" : "הסכמה מפורשת לעיבוד מידע רפואי: אושרה",
            "",
            isEnglish ? "FULL WAIVER TERMS" : "הנוסח המלא של הוויתור",
            "================================",
            document.querySelector(".legal-text").innerText.trim(),
            "",
            isEnglish
                ? "A printable copy is also available in the attached file and at climbing-cyprus.com/waiver/en/."
                : "עותק מוכן להדפסה זמין גם בקובץ המצורף ובכתובת climbing-cyprus.com/waiver/."
        );

        return lines.join("\n");
    }

    function buildPrintableHtml() {
        const participants = participantData();
        const direction = isEnglish ? "ltr" : "rtl";
        const title = isEnglish ? "Participation Waiver & Health Declaration" : "אישור השתתפות והצהרת בריאות";
        const participantRows = participants.map((participant, index) => `
<section class="participant">
<h3>${isEnglish ? "Participant" : "משתתף/ת"} ${index + 1}: ${escapeHtml(participant.name)}</h3>
<p><strong>${isEnglish ? "Age" : "גיל"}:</strong> ${escapeHtml(participant.age)}</p>
<p><strong>${isEnglish ? "Health, allergies, medication and limitations" : "מצב רפואי, אלרגיות, תרופות ומגבלות"}:</strong><br>${escapeHtml(participant.health).replaceAll("\n", "<br>")}</p>
</section>`).join("");

        return `<!DOCTYPE html>
<html lang="${isEnglish ? "en" : "he"}" dir="${direction}">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
body{font-family:Arial,sans-serif;color:#17211e;line-height:1.55;max-width:850px;margin:0 auto;padding:32px}
h1,h2,h3{color:#173f35}header{border-bottom:4px solid #b8d94a;margin-bottom:24px}
.meta,.participant,.signature,.legal{border:1px solid #ccd5d1;border-radius:8px;padding:18px;margin:14px 0}
.legal{font-size:13px}.legal h3{font-size:15px;margin-top:20px}.confirmed{font-weight:bold;color:#173f35}
.print-button{position:fixed;top:16px;${isEnglish ? "right" : "left"}:16px;background:#ed7332;color:white;border:0;border-radius:7px;padding:11px 18px;cursor:pointer}
@page{size:A4;margin:15mm}
@media print{.print-button{display:none}body{padding:0;max-width:none}.participant,.signature{break-inside:avoid}.legal{border:0;padding:0}.legal h3{break-after:avoid}}
</style></head>
<body>
<button class="print-button" onclick="window.print()">${isEnglish ? "Print / Save as PDF" : "הדפסה / שמירה כ־PDF"}</button>
<header><p>${isEnglish ? "Cyprus Through Different Eyes" : "קפריסין בעין אחרת"}</p><h1>${title}</h1></header>
<section class="meta">
<h2>${isEnglish ? "Adult representative" : "נציג/ה בגיר/ה"}</h2>
<p><strong>${isEnglish ? "Name" : "שם"}:</strong> ${escapeHtml(fieldValue("representative_name"))}</p>
<p><strong>${isEnglish ? "Email" : "אימייל"}:</strong> ${escapeHtml(fieldValue("email"))}</p>
<p><strong>${isEnglish ? "Phone" : "טלפון"}:</strong> ${escapeHtml(fieldValue("phone"))}</p>
<p><strong>${isEnglish ? "Country" : "ארץ"}:</strong> ${escapeHtml(fieldValue("country"))}</p>
</section>
<h2>${isEnglish ? "Participants covered by this approval" : "המשתתפים הכלולים באישור"}</h2>
${participantRows}
<section class="legal">${document.querySelector(".legal-text").innerHTML}</section>
<section class="signature">
<p class="confirmed">${isEnglish
    ? "APPROVED — The adult representative’s electronic signature applies to every participant entered in the form and covers every stage of the activity, including travel, approach to the crag and return."
    : "אושר — חתימת הנציג/ה הבגיר/ה חלה על כל המשתתפים שהוזנו בטופס ועל כל שלבי הפעילות, לרבות נסיעה, דרך הגישה למצוק והחזרה ממנו."}</p>
<p><strong>${isEnglish ? "Electronic signature" : "חתימה אלקטרונית"}:</strong> ${escapeHtml(fieldValue("electronic_signature"))}</p>
<p><strong>${isEnglish ? "Date" : "תאריך"}:</strong> ${escapeHtml(signatureDate.value)}</p>
</section>
</body></html>`;
    }

    function bytesToBase64(bytes) {
        let binary = "";
        const chunkSize = 0x8000;
        for (let index = 0; index < bytes.length; index += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
        }
        return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
    }

    async function buildPrintLink(html) {
        const encoded = new TextEncoder().encode(html);
        let prefix = "b64.";
        let bytes = encoded;

        if ("CompressionStream" in window) {
            const stream = new Blob([encoded]).stream().pipeThrough(new CompressionStream("gzip"));
            bytes = new Uint8Array(await new Response(stream).arrayBuffer());
            prefix = "gz.";
        }

        return `${window.location.origin}/waiver/print/#${prefix}${bytesToBase64(bytes)}`;
    }

    function updateParticipants() {
        const cards = [...participantsRoot.querySelectorAll(".participant-card")];

        cards.forEach((card, index) => {
            const displayNumber = index + 1;
            card.querySelector(".participant-number").textContent = displayNumber;
            card.querySelector("h4").textContent = `${isEnglish ? "Participant" : "משתתף/ת"} ${displayNumber}`;
            card.querySelectorAll("[data-name]").forEach((field) => {
                field.name = `participant_${displayNumber}_${field.dataset.name}`;
            });
            card.querySelector(".remove-participant").hidden = cards.length === 1;
        });

        participantCount.textContent = cards.length === 1
            ? (isEnglish ? "1 participant" : "משתתף 1")
            : (isEnglish ? `${cards.length} participants` : `${cards.length} משתתפים`);
        addParticipantButton.hidden = cards.length >= MAX_PARTICIPANTS;
    }

    function addParticipant() {
        if (participantsRoot.children.length >= MAX_PARTICIPANTS) return;

        const fragment = participantTemplate.content.cloneNode(true);
        const card = fragment.querySelector(".participant-card");
        card.querySelector(".remove-participant").addEventListener("click", () => {
            card.remove();
            updateParticipants();
        });
        participantsRoot.appendChild(fragment);
        updateParticipants();
    }

    function setFieldValidity(field) {
        const wrapper = field.closest(".field");
        if (!wrapper) return field.checkValidity();
        const valid = field.checkValidity();
        wrapper.classList.toggle("invalid", !valid);
        field.setAttribute("aria-invalid", String(!valid));
        return valid;
    }

    function validateStep(step) {
        const fields = [...step.querySelectorAll("input[required], textarea[required]")];
        let firstInvalid = null;

        fields.forEach((field) => {
            const valid = setFieldValidity(field);
            if (!valid && !firstInvalid) firstInvalid = field;
        });

        if (step.dataset.step === "2") {
            const checked = [...step.querySelectorAll('input[type="checkbox"][required]')]
                .every((field) => field.checked);
            consentCard.classList.toggle("invalid", !checked || Boolean(firstInvalid));
        }

        if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
            return false;
        }

        return true;
    }

    function showStep(stepNumber) {
        document.querySelectorAll(".form-step").forEach((step) => {
            step.classList.toggle("active", step.dataset.step === String(stepNumber));
        });
        document.querySelectorAll("[data-step-label]").forEach((label) => {
            label.classList.toggle("active", Number(label.dataset.stepLabel) <= stepNumber);
        });
        progressBar.style.width = stepNumber === 1 ? "50%" : "100%";
        window.scrollTo({
            top: form.getBoundingClientRect().top + window.scrollY - 20,
            behavior: "smooth"
        });
    }

    addParticipantButton.addEventListener("click", addParticipant);

    document.getElementById("toAgreement").addEventListener("click", () => {
        const firstStep = document.querySelector('[data-step="1"]');
        if (validateStep(firstStep)) showStep(2);
    });

    document.getElementById("backToDetails").addEventListener("click", () => showStep(1));

    form.addEventListener("input", (event) => {
        if (event.target.matches("input, textarea")) setFieldValidity(event.target);
        if (event.target.matches('input[type="checkbox"]')) {
            const allChecked = [...form.querySelectorAll('input[type="checkbox"][required]')]
                .every((field) => field.checked);
            consentCard.classList.toggle("invalid", !allChecked);
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const secondStep = document.querySelector('[data-step="2"]');
        if (!validateStep(secondStep)) return;

        submittedAt.value = new Date().toISOString();
        submitButton.disabled = true;
        submitButton.classList.add("is-loading");

        try {
            lastPrintableHtml = buildPrintableHtml();
            lastPrintLink = await buildPrintLink(lastPrintableHtml);
            let formData = new FormData(form);
            formData.append(
                isEnglish ? "PRINT-READY SUMMARY" : "סיכום מוכן להדפסה",
                buildPlainTextSummary()
            );
            formData.append(
                isEnglish ? "PRINTING INSTRUCTIONS" : "הוראות הדפסה",
                isEnglish
                    ? "Open the PRINTABLE WAIVER LINK below. It contains the exact complete form, all participants, all signed terms and the electronic signature, ready to print or save as PDF."
                    : "יש לפתוח את הקישור לאישור המלא להדפסה שמופיע בהמשך. הוא כולל את הטופס המלא כפי שנחתם, את כל המשתתפים, כל הסעיפים והחתימה, ומוכן להדפסה או שמירה כ־PDF."
            );
            formData.append(
                isEnglish ? "PRINTABLE WAIVER LINK" : "קישור לאישור המלא להדפסה",
                lastPrintLink
            );
            formData.append(
                "printable_waiver",
                new Blob([lastPrintableHtml], { type: "text/html;charset=utf-8" }),
                `waiver-${new Date().toISOString().slice(0, 10)}.html`
            );

            let response = await fetch(form.action, {
                method: "POST",
                body: formData,
                headers: { Accept: "application/json" }
            });

            if (!response.ok && [400, 402, 403, 413, 415, 422].includes(response.status)) {
                formData = new FormData(form);
                formData.append(
                    isEnglish ? "PRINT-READY SUMMARY" : "סיכום מוכן להדפסה",
                    buildPlainTextSummary()
                );
                formData.append(
                    isEnglish ? "PRINTING INSTRUCTIONS" : "הוראות הדפסה",
                    isEnglish
                        ? "Open the PRINTABLE WAIVER LINK below to print the exact complete signed form or save it as PDF."
                        : "יש לפתוח את הקישור לאישור המלא להדפסה שמופיע בהמשך כדי להדפיס את הטופס המלא שנחתם או לשמור אותו כ־PDF."
                );
                formData.append(
                    isEnglish ? "PRINTABLE WAIVER LINK" : "קישור לאישור המלא להדפסה",
                    lastPrintLink
                );
                response = await fetch(form.action, {
                    method: "POST",
                    body: formData,
                    headers: { Accept: "application/json" }
                });
            }

            if (!response.ok) throw new Error("Submission failed");

            form.hidden = true;
            successState.classList.add("visible");
            printSubmittedWaiver.href = lastPrintLink;
            successState.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch (error) {
            alert(isEnglish
                ? "We could not submit the form. Please check your connection and try again, or contact us by email."
                : "לא הצלחנו לשלוח את הטופס כרגע. אנא בדקו את החיבור ונסו שוב, או פנו אלינו במייל.");
            submitButton.disabled = false;
            submitButton.classList.remove("is-loading");
        }
    });

    printSubmittedWaiver.addEventListener("click", (event) => {
        if (!lastPrintLink) event.preventDefault();
    });

    signatureDate.value = localDate();
    addParticipant();
})();
