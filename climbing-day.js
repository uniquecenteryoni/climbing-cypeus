(() => {
  const params = new URLSearchParams(location.search);
  const english = document.documentElement.lang === 'en';
  const sites = {
    grecophatra: { title: english ? 'Gerakopetra Cliff' : 'מצוק גרקופטרה', map: 'https://goo.gl/maps/PrhwPXWp1kyT5UC49', directions: 'directionsGrecophatra' },
    dierizos: { title: english ? 'Diarizos Cliff' : 'מצוק דיאריזוס', map: 'https://maps.app.goo.gl/nUTU1AC7gG47Wh9A7', directions: 'directionsDierizos' },
    koratzi: { title: english ? 'Koratzi Cliff' : 'מצוק Koratzi', map: 'https://maps.app.goo.gl/Urn3Jt85fHWuC1bo8', directions: 'directionsKoratzi' },
    alikou: { title: english ? 'Alikou Cliff' : 'מצוק Alikou', map: 'https://maps.app.goo.gl/V3LZqytnfKb18jHeA', directions: 'directionsAlikou' }
  };
  const requestedSite = params.get('site');
  const site = Object.hasOwn(sites, requestedSite) ? sites[requestedSite] : sites.grecophatra;
  document.getElementById('siteTitle').textContent = site.title;
  document.getElementById('mapLink').href = site.map;
  Object.values(sites).forEach(item => {
    document.getElementById(item.directions).hidden = item !== site;
  });
  const time = params.get('time');
  if (/^([01]?\d|2[0-3]):[0-5]\d$/.test(time || '')) {
    document.getElementById('meetingTime').textContent = time;
  }
  const price = params.get('price');
  if (/^[0-9]+(?:[.,][0-9]{1,2})?$/.test(price || '')) {
    document.getElementById('priceText').textContent = price + '€';
    document.getElementById('priceCard').hidden = false;
  }
  const duration = Number(params.get('duration'));
  if (duration >= 0.5 && duration <= 24 && Number.isInteger(duration * 2)) {
    document.getElementById('activityDuration').textContent = english
      ? `approx. ${duration} hours` : `כ־${duration} שעות`;
    // Keep the approximate itinerary consistent with the selected total time.
    const weights = [15, 10, 10, 120, 10, 15];
    let elapsed = 0;
    let roundedElapsed = 0;
    document.querySelectorAll('.schedule b').forEach((label, index) => {
      elapsed += weights[index] / 180 * duration * 60;
      const next = Math.round(elapsed);
      label.textContent = `${next - roundedElapsed} ${english ? 'minutes' : 'דקות'}`;
      roundedElapsed = next;
    });
  }
  // Preserve the customer's settings when switching languages.
  document.querySelectorAll('a.lang, .footer a').forEach(link => {
    const url = new URL(link.href);
    url.search = params.toString();
    link.href = url.toString();
  });
})();
