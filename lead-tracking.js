/* Lightweight lead attribution shared by the static pages. A production deployment
   should mirror these records to a server-side store before exposing the dashboard. */
(function () {
  function attribution() {
    const params = new URLSearchParams(location.search);
    const ref = document.referrer || '';
    let source = params.get('utm_source') || params.get('source');
    if (!source && ref) {
      try { source = new URL(ref).hostname.replace(/^www\./, ''); } catch (_) {}
    }
    return {
      source: source || 'direct',
      campaign: params.get('utm_campaign') || '',
      medium: params.get('utm_medium') || '',
      landing_page: location.pathname,
      referrer: ref,
      captured_at: new Date().toISOString()
    };
  }
  window.getLeadAttribution = attribution;
  window.recordSiteLead = function (lead) {
    try {
      const current = JSON.parse(localStorage.getItem('ccLeads') || '[]');
      current.unshift(Object.assign({}, lead, attribution(), { date: new Date().toLocaleString('he-IL') }));
      localStorage.setItem('ccLeads', JSON.stringify(current.slice(0, 500)));
    } catch (_) {}
  };
})();
