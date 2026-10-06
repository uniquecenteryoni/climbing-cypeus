/* Shared quiz lead submission contract. Every quiz must submit through this helper. */
(function () {
    const endpoint = 'https://formspree.io/f/mjkdalap';
    window.submitQuizLead = async function ({ contact, quiz, score, trainingInterest, language }) {
        const payload = new FormData();
        payload.append('name', contact.name || '');
        payload.append('email', contact.email || '');
        payload.append('phone', contact.phone || '');
        payload.append('quiz', quiz);
        payload.append('score', score);
        payload.append('training_interest_choice', trainingInterest);
        payload.append('training_interest', trainingInterest === 'yes' ? 'Interested in instruction' : 'Not interested in instruction');
        payload.append('language', language || document.documentElement.lang || '');
        payload.append('message', `${quiz}: ${score}. Training interest: ${trainingInterest}.`);
        payload.append('_subject', `${quiz} — ${score} — training interest: ${trainingInterest}`);
        const response = await fetch(endpoint, { method: 'POST', body: payload, headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Quiz lead submission failed');
        return response;
    };
})();
