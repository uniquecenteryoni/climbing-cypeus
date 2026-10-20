/* Sends static-site form submissions to the Google Apps Script web app. */
(function () {
  const endpoint = 'https://script.google.com/macros/s/AKfycbyQpSz4mG8445buzVR7fvfZTdfzw-wEpgoN7Ojv1IJIcHLZhH5XZJ8QO-VPCLk1-awF7g/exec';
  const nativeFetch = window.fetch.bind(window);

  async function serialize(formData) {
    const fields = {};
    let attachment = null;
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (!value.size) continue;
        if (key === 'printable_waiver') {
          const bytes = new Uint8Array(await value.arrayBuffer());
          let binary = '';
          for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
          attachment = { filename: value.name || 'waiver.html', mimeType: value.type || 'text/html', base64: btoa(binary) };
        } else {
          fields[key] = value.name;
        }
      } else {
        fields[key] = String(value);
      }
    }
    return {
      submission_id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      fields,
      attachment,
      website: '',
      source: window.getLeadAttribution ? window.getLeadAttribution().source : 'direct',
      campaign: window.getLeadAttribution ? window.getLeadAttribution().campaign : '',
      referrer: document.referrer || ''
    };
  }

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input && input.url;
    const method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    const body = init && init.body;
    if (method === 'POST' && url && url.includes('/macros/s/') && body instanceof FormData) {
      const payload = await serialize(body);
      await nativeFetch(endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(payload) });
      return { ok: true, status: 200, json: async () => ({ ok: true }), text: async () => '{"ok":true}' };
    }
    return nativeFetch(input, init);
  };
})();
