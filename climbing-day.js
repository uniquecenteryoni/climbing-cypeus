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
  const validTime = /^([01]?\d|2[0-3]):[0-5]\d$/.test(time || '');
  if (validTime) {
    document.getElementById('meetingTime').textContent = time;
  }
  const price = params.get('price');
  if (/^[0-9]+(?:[.,][0-9]{1,2})?$/.test(price || '')) {
    document.getElementById('priceText').textContent = price + '€';
    document.getElementById('priceCard').hidden = false;
  }
  const duration = Number(params.get('duration'));
  const validDuration = duration >= 0.5 && duration <= 24 && Number.isInteger(duration * 2);
  if (validDuration) {
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
  // Use UTC for calendar arithmetic so browser timezone and DST cannot shift the date.
  const date = params.get('date');
  const activityDate = /^\d{4}-\d{2}-\d{2}$/.test(date || '')
    ? new Date(`${date}T00:00:00Z`) : null;
  const validDate = activityDate && Number.isFinite(activityDate.getTime())
    && activityDate.toISOString().slice(0, 10) === date;
  const formatDate = value => new Intl.DateTimeFormat(english ? 'en-GB' : 'he-IL', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
  }).format(value);
  const details = [];
  if (validDate) details.push(formatDate(activityDate));
  if (validTime) {
    const [hours, minutes] = time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const formatTime = total => `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    let timeRange = formatTime(startMinutes);
    if (validDuration) {
      const endMinutes = startMinutes + duration * 60;
      timeRange += `–${formatTime(endMinutes)}`;
      if (endMinutes >= 24 * 60) {
        timeRange += english ? ' (next day)' : ' (למחרת)';
      }
    }
    details.push(timeRange);
  }
  if (details.length) {
    const heading = document.getElementById('activityHeadingDetails');
    heading.textContent = details.join(' · ');
    heading.hidden = false;
    document.title = `${document.title.split(' | ')[0]} · ${details.join(' · ')} | Climbing Cyprus`;
    document.querySelector('meta[property="og:title"]').content = document.title;
  }
  // Preserve the customer's settings when switching languages.
  document.querySelectorAll('a.lang, .footer a').forEach(link => {
    const url = new URL(link.href);
    url.search = params.toString();
    link.href = url.toString();
  });
})();
