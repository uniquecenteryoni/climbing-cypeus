const lang = new URLSearchParams(window.location.search).get('lang');
window.location.replace(`../safety-quiz.html${lang === 'en' ? '?lang=en' : ''}`);
