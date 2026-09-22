// SEO-friendly language routing for the static site.
// Hebrew keeps the existing URLs; English uses /en/...
(function () {
    const supported = ['he', 'en'];
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const inEnglishDirectory = path === '/en' || path.startsWith('/en/');

    // A direct /en/... URL is authoritative and must win over localStorage.
    if (inEnglishDirectory) {
        localStorage.setItem('preferred-language', 'en');
    }

    function pagePathForLanguage(lang) {
        const current = window.location.pathname;
        const withoutEnglishPrefix = current.replace(/^\/en(?:\/|$)/, '/');
        const normalized = withoutEnglishPrefix === '/index.html' ? '/' : withoutEnglishPrefix;
        if (lang === 'en') {
            return `/en${normalized === '/' ? '/' : normalized}`;
        }
        return normalized || '/';
    }

    function addOrReplaceLink(rel, hreflang, href) {
        const selector = `link[rel="${rel}"][hreflang="${hreflang}"]`;
        let link = document.head.querySelector(selector);
        if (!link) {
            link = document.createElement('link');
            link.rel = rel;
            link.hreflang = hreflang;
            document.head.appendChild(link);
        }
        link.href = href;
    }

    function updateSeoLinks() {
        const origin = window.location.origin;
        const heUrl = `${origin}${pagePathForLanguage('he')}`;
        const enUrl = `${origin}${pagePathForLanguage('en')}`;
        addOrReplaceLink('alternate', 'he', heUrl);
        addOrReplaceLink('alternate', 'en', enUrl);
        addOrReplaceLink('alternate', 'x-default', heUrl);

        let canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = `${window.location.origin}${window.location.pathname}`;
    }

    function redirectLegacyLanguageUrl() {
        const params = new URLSearchParams(window.location.search);
        const requested = params.get('lang');
        if (!supported.includes(requested)) return;

        const targetPath = pagePathForLanguage(requested);
        params.delete('lang');
        const query = params.toString();
        const target = `${targetPath}${query ? `?${query}` : ''}${window.location.hash}`;
        if (target !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
            window.location.replace(target);
        }
    }

    window.siteLanguageRouting = {
        pagePathForLanguage,
        updateSeoLinks,
        currentLanguage: () => inEnglishDirectory ? 'en' : 'he'
    };

    redirectLegacyLanguageUrl();
    document.addEventListener('DOMContentLoaded', updateSeoLinks, { once: true });
})();
