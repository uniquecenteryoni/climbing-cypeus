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
    const consentCard = document.querySelector(".consent-card");
    const MAX_PARTICIPANTS = 20;

    function localDate() {
        return new Intl.DateTimeFormat("he-IL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(new Date());
    }

    function updateParticipants() {
        const cards = [...participantsRoot.querySelectorAll(".participant-card")];

        cards.forEach((card, index) => {
            const displayNumber = index + 1;
            card.querySelector(".participant-number").textContent = displayNumber;
            card.querySelector("h4").textContent = `משתתף/ת ${displayNumber}`;
            card.querySelectorAll("[data-name]").forEach((field) => {
                field.name = `participant_${displayNumber}_${field.dataset.name}`;
            });
            card.querySelector(".remove-participant").hidden = cards.length === 1;
        });

        participantCount.textContent = cards.length === 1
            ? "משתתף 1"
            : `${cards.length} משתתפים`;
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
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" }
            });

            if (!response.ok) throw new Error("Submission failed");

            form.hidden = true;
            successState.classList.add("visible");
            successState.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch (error) {
            alert("לא הצלחנו לשלוח את הטופס כרגע. אנא בדקו את החיבור ונסו שוב, או פנו אלינו במייל.");
            submitButton.disabled = false;
            submitButton.classList.remove("is-loading");
        }
    });

    signatureDate.value = localDate();
    addParticipant();
})();
