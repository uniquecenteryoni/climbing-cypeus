const lang = new URLSearchParams(window.location.search).get('lang');
window.location.replace(`../safety-quiz${lang === 'en' ? '?lang=en' : ''}`);
