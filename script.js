// Language switcher and interaction functionality
// Hebrew keeps the existing URLs; English uses /en/...
function pagePathForLanguage(lang) {
    const current = window.location.pathname;
    const withoutEnglishPrefix = current.replace(/^\/en(?:\/|$)/, '/');
    const normalizedPath = withoutEnglishPrefix.replace(/\.html$/, '');
    const normalized = normalizedPath === '/index' || normalizedPath === '' ? '/' : normalizedPath;
    return lang === 'en' ? `/en${normalized === '/' ? '/' : normalized}` : normalized;
}

function redirectLegacyLanguageUrl() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('lang');
    if (!['he', 'en'].includes(requested)) return;
    params.delete('lang');
    const query = params.toString();
    const target = `${pagePathForLanguage(requested)}${query ? `?${query}` : ''}${window.location.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (target !== current) window.location.replace(target);
}

function updateLanguageSeoLinks() {
    const origin = window.location.origin;
    const heUrl = `${origin}${pagePathForLanguage('he')}`;
    const enUrl = `${origin}${pagePathForLanguage('en')}`;
    [['he', heUrl], ['en', enUrl], ['x-default', heUrl]].forEach(([lang, href]) => {
        let link = document.head.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
        if (!link) {
            link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = lang;
            document.head.appendChild(link);
        }
        link.href = href;
    });
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    const canonicalPath = window.location.pathname.replace(/\.html$/, '') || '/';
    canonical.href = `${origin}${canonicalPath}`;
}

function addFloatingWhatsApp() {
    if (document.querySelector('.floating-whatsapp')) return;
    if (/\/(admin|waiver)\//.test(window.location.pathname)) return;

    const isEnglish = currentLang === 'en' || document.documentElement.lang === 'en';
    const message = isEnglish
        ? 'Hi, I’m interested in climbing activities in Cyprus'
        : 'היי, אני מעוניין/ת בפרטים על פעילויות טיפוס בקפריסין';
    const label = isEnglish ? 'Message us on WhatsApp' : 'שלחו לנו הודעה בוואטסאפ';
    const link = document.createElement('a');
    link.className = 'floating-whatsapp';
    link.href = `https://wa.me/972504443328?text=${encodeURIComponent(message)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', label);
    link.innerHTML = '<i class="fab fa-whatsapp" aria-hidden="true"></i><span></span>';
    link.querySelector('span').textContent = label;
    document.body.appendChild(link);
}

function addBackToTopButton() {
    if (document.querySelector('.back-to-top')) return;
    const isEnglish = document.documentElement.lang === 'en' || window.location.pathname.startsWith('/en/');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'back-to-top';
    button.setAttribute('aria-label', isEnglish ? 'Back to top' : 'חזרה לראש העמוד');
    button.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i><span></span>';
    button.querySelector('span').textContent = isEnglish ? 'Back to top' : 'חזרה לראש העמוד';
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(button);
    const update = () => button.classList.toggle('is-visible', window.scrollY > 500);
    window.addEventListener('scroll', update, { passive: true });
    update();
}

function upgradeCompactFooter() {
    const footer = document.querySelector('footer.footer');
    if (!footer) return;

    const isEnglish = document.documentElement.lang === 'en' || window.location.pathname.startsWith('/en/');
    const home = isEnglish ? '/en/' : '/';
    const labels = isEnglish
        ? { tagline: 'Rock climbing, rappelling and equipment rental in Cyprus', links: 'Explore', tours: 'Rock climbing & rappelling', course: 'Lead climbing course', gear: 'Equipment rental', contact: 'Contact', admin: 'Admin panel', social: 'Follow Climbing Cyprus', rights: 'All rights reserved' }
        : { tagline: 'טיפוס צוקים, סנפלינג והשכרת ציוד בקפריסין', links: 'לגלות', tours: 'טיפוס צוקים וסנפלינג', course: 'קורס טיפוס הובלה', gear: 'השכרת ציוד', contact: 'יצירת קשר', admin: 'פאנל ניהול', social: 'עקבו אחרי Climbing Cyprus', rights: 'כל הזכויות שמורות' };

    const container = document.createElement('div');
    container.className = 'container';
    const content = document.createElement('div');
    content.className = 'footer-content';

    const brand = document.createElement('div');
    brand.className = 'footer-section footer-brand';
    brand.innerHTML = `<a class="footer-brand-name" href="${home}">Climbing Cyprus</a><p>${labels.tagline}</p>`;

    const navigation = document.createElement('div');
    navigation.className = 'footer-section';
    const heading = document.createElement('h4');
    heading.textContent = labels.links;
    const list = document.createElement('ul');
    [[labels.tours, `${home}#activities`], [labels.course, `${home}course.html`], [labels.gear, `${home}equipment.html`], [labels.contact, `${home}#contact`], [labels.admin, '/admin/dashboard']].forEach(([label, href]) => {
        const item = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.href = href;
        anchor.textContent = label;
        item.appendChild(anchor);
        list.appendChild(item);
    });
    navigation.append(heading, list);

    const social = document.createElement('div');
    social.className = 'footer-section';
    const socialHeading = document.createElement('h4');
    socialHeading.textContent = labels.social;
    const instagram = document.createElement('a');
    instagram.className = 'footer-instagram-cta';
    instagram.href = 'https://www.instagram.com/climbing.cyprus';
    instagram.target = '_blank';
    instagram.rel = 'noopener noreferrer';
    instagram.innerHTML = '<i class="fab fa-instagram" aria-hidden="true"></i>';
    const socialLabel = document.createElement('span');
    socialLabel.textContent = 'Instagram';
    instagram.appendChild(socialLabel);
    social.append(socialHeading, instagram);

    content.append(brand, navigation, social);
    const bottom = document.createElement('div');
    bottom.className = 'footer-bottom';
    const copyright = document.createElement('p');
    copyright.innerHTML = `© <span class="current-year">${new Date().getFullYear()}</span> Climbing Cyprus · ${labels.rights}`;
    bottom.appendChild(copyright);
    container.append(content, bottom);
    footer.replaceChildren(container);
}

function redirectFirstVisitByBrowserLanguage() {
    const path = window.location.pathname;
    const isEnglishPath = path === '/en' || path.startsWith('/en/');
    const hasLanguageQuery = new URLSearchParams(window.location.search).has('lang');
    const hasSavedPreference = localStorage.getItem('preferred-language');
    const isCrawler = /bot|crawler|spider|slurp|archiver/i.test(navigator.userAgent);
    if (isEnglishPath || hasLanguageQuery || isCrawler) return;

    if (hasSavedPreference === 'en') {
        window.location.replace(pagePathForLanguage('en'));
        return;
    }
    if (hasSavedPreference) return;

    const browserLocale = (navigator.language || '').toLowerCase();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const isLikelyIsrael = browserLocale === 'he-il' || browserLocale.endsWith('-il') || timezone === 'Asia/Jerusalem';
    const preferred = isLikelyIsrael ? 'he' : 'en';
    localStorage.setItem('preferred-language', preferred);
    if (preferred === 'en') window.location.replace(pagePathForLanguage('en'));
}

redirectFirstVisitByBrowserLanguage();

// Get language from the URL path first, then localStorage, then browser preference
function getInitialLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    
    if (window.location.pathname === '/en' || window.location.pathname.startsWith('/en/')) {
        localStorage.setItem('preferred-language', 'en');
        return 'en';
    }

    if (urlLang && ['he', 'en'].includes(urlLang)) {
        localStorage.setItem('preferred-language', urlLang);
        return urlLang;
    }
    
    const saved = localStorage.getItem('preferred-language');
    if (saved && ['he', 'en'].includes(saved)) return saved;
    const browserLocale = (navigator.language || '').toLowerCase();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return (browserLocale === 'he-il' || browserLocale.endsWith('-il') || timezone === 'Asia/Jerusalem') ? 'he' : 'en';
}

let currentLang = getInitialLanguage();

// Apply language immediately to prevent flash of wrong language
(function() {
    const html = document.documentElement;
    html.setAttribute('lang', currentLang);
    
    // Set text direction (RTL for Hebrew, LTR for others)
    if (currentLang === 'he') {
        html.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
    } else {
        html.setAttribute('dir', 'ltr');
        document.body.classList.add('ltr');
    }
})();

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    redirectLegacyLanguageUrl();
    updateLanguageSeoLinks();
    addFloatingWhatsApp();
    addBackToTopButton();
    upgradeCompactFooter();
    document.querySelectorAll('.current-year').forEach(year => { year.textContent = new Date().getFullYear(); });

    const guideVideo = document.querySelector('.guide-hero iframe');
    const guidePlaceholder = document.querySelector('.guide-video-placeholder');
    if (guideVideo && guidePlaceholder) {
        guideVideo.addEventListener('load', () => guidePlaceholder.classList.add('is-hidden'), { once: true });
        window.setTimeout(() => guidePlaceholder.classList.add('is-hidden'), 12000);
    }

    const equipmentVideos = document.querySelector('.equipment-bouldering-videos');
    const rentalContent = document.querySelector('#rental .tour-content');
    const equipmentInfo = document.querySelector('#rental .equipment-info');
    if (equipmentVideos && rentalContent && equipmentInfo) rentalContent.insertBefore(equipmentVideos, equipmentInfo);

    document.querySelectorAll('.gallery-item img').forEach(image => {
        image.addEventListener('click', () => {
            if (document.getElementById('gallery')) window.location.hash = 'gallery';
        }, true);
    });

    const quizLead = sessionStorage.getItem('climbingQuizLead');
    if (quizLead) {
        try {
            const lead = JSON.parse(quizLead);
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const phone = document.getElementById('phone');
            const message = document.getElementById('message');
            if (name && lead.name) name.value = lead.name;
            if (email && lead.email) email.value = lead.email;
            if (phone && lead.phone) phone.value = lead.phone;
        if (message && lead.interest) message.value = `Climbing safety quiz score: ${lead.score}/9. Follow-up requested: ${lead.interest}`;
            sessionStorage.removeItem('climbingQuizLead');
        } catch (error) {
            sessionStorage.removeItem('climbingQuizLead');
        }
    }
    // Set initial language and translate content
    setLanguage(currentLang);
    
    // Check for climber guide links when in English mode
    checkClimberGuideLinks();
    
    // Language switcher - simple buttons
    const langButtons = document.querySelectorAll('.lang-btn');
    
    if (langButtons.length > 0) {
        // Set active button based on current language
        langButtons.forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            if (btnLang === currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Language button click
        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                closeMobileMenu();
                const lang = button.getAttribute('data-lang');
                localStorage.setItem('preferred-language', lang);
                window.location.assign(`${pagePathForLanguage(lang)}${window.location.hash}`);
            });
        });
    }
    
    // Contact form is now handled by Formspree
    // No need for JavaScript form handling
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    const isEnglishPage = document.documentElement.lang === 'en' || window.location.pathname.startsWith('/en/');
    const closeMobileMenu = () => {
        if (!hamburger) return;
        hamburger.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', isEnglishPage ? 'Open navigation menu' : 'פתיחת תפריט ניווט');
    };

    if (hamburger) {
        // A restored page can retain the old class state (notably on mobile
        // back/forward navigation). Always begin a new page with the menu closed.
        closeMobileMenu();
        if (navMenu && !navMenu.id) navMenu.id = 'site-navigation';
        hamburger.setAttribute('role', 'button');
        hamburger.setAttribute('tabindex', '0');
        if (navMenu) hamburger.setAttribute('aria-controls', navMenu.id);
        hamburger.setAttribute('aria-label', isEnglishPage ? 'Open navigation menu' : 'פתיחת תפריט ניווט');
        hamburger.setAttribute('aria-expanded', 'false');
    }
    document.querySelectorAll('button.carousel-btn').forEach(button => {
        if (!button.hasAttribute('aria-label')) {
            const previous = button.classList.contains('prev');
            button.setAttribute('aria-label', isEnglishPage
                ? (previous ? 'Previous slide' : 'Next slide')
                : (previous ? 'השקופית הקודמת' : 'השקופית הבאה'));
        }
    });
    document.querySelectorAll('button.lightbox-close').forEach(button => button.setAttribute('aria-label', isEnglishPage ? 'Close viewer' : 'סגירת התצוגה'));
    document.querySelectorAll('button.lightbox-prev').forEach(button => button.setAttribute('aria-label', isEnglishPage ? 'Previous image' : 'התמונה הקודמת'));
    document.querySelectorAll('button.lightbox-next').forEach(button => button.setAttribute('aria-label', isEnglishPage ? 'Next image' : 'התמונה הבאה'));
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            if (navMenu) navMenu.classList.toggle('active');
            const expanded = hamburger.classList.contains('active');
            hamburger.setAttribute('aria-expanded', String(expanded));
            hamburger.setAttribute('aria-label', expanded
                ? (isEnglishPage ? 'Close navigation menu' : 'סגירת תפריט ניווט')
                : (isEnglishPage ? 'Open navigation menu' : 'פתיחת תפריט ניווט'));
        });
        hamburger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                hamburger.click();
            }
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close before navigating from any page link, including activity cards.
        document.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('click', closeMobileMenu, { capture: true });
        });

        window.addEventListener('pagehide', closeMobileMenu);
        window.addEventListener('scroll', closeMobileMenu, { passive: true });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Keep the shared logo and gallery navigation from inheriting a contact URL.
    document.querySelectorAll('.navbar .logo').forEach(logo => {
        logo.setAttribute('href', currentLang === 'en' ? '/en/' : '/');
        logo.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.assign(currentLang === 'en' ? '/en/' : '/');
        });
    });

    document.querySelectorAll('.navbar a[href*="#gallery"]').forEach(galleryLink => {
                galleryLink.setAttribute('href', `${currentLang === 'en' ? '/en/' : '/'}#gallery`);
    });
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Testimonials Carousel
    initTestimonialsCarousel();
    initGoogleReviewsCarousel();
    
    // Lightbox
    initLightbox();

    // Interactive climbing-session pricing selector.
    initClimbingPricing();
    initBoulderingVideoCarousels();

    // Single-strip climbing-wall carousel on the climber guide page.
    const wallsCarousel = document.querySelector('[data-walls-carousel]');
    if (wallsCarousel) {
        const slides = [...wallsCarousel.querySelectorAll('.walls-carousel-slide')];
        const dots = [...wallsCarousel.querySelectorAll('.walls-carousel-dots button')];
        let wallsIndex = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));
        const renderWallsSlide = (index) => {
            if (!slides.length) return;
            wallsIndex = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle('active', i === wallsIndex));
            dots.forEach((dot, i) => dot.classList.toggle('active', i === wallsIndex));
        };
        wallsCarousel.querySelector('.walls-carousel-button.prev')?.addEventListener('click', () => renderWallsSlide(wallsIndex - 1));
        wallsCarousel.querySelector('.walls-carousel-button.next')?.addEventListener('click', () => renderWallsSlide(wallsIndex + 1));
        dots.forEach((dot, i) => dot.addEventListener('click', () => renderWallsSlide(i)));
        renderWallsSlide(wallsIndex);
    }

    // Handle guidebook order button clicks
    const guidebookButtons = document.querySelectorAll('a[href="#contact"][data-i18n="activity-guidebook-btn"]');
    guidebookButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Scroll to contact form
            const contactSection = document.querySelector('#contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                
                // Wait for scroll, then fill in the message
                setTimeout(() => {
                    const messageField = document.querySelector('#message');
                    if (messageField) {
                        const messages = {
                            'he': 'שלום, אני מעוניין/ת בהזמנת גייד בוק של קפריסין ואיסוף ציוד טיפוס דרכך. נשמח לפרטים נוספים.',
                            'en': 'Hello, I am interested in ordering the Cyprus climbing guidebook and picking up climbing gear from you. I would appreciate more details.',
                            'ru': 'Здравствуйте, я заинтересован в заказе путеводителя по скалолазанию на Кипре и получении снаряжения от вас. Буду рад дополнительной информации.',
                            'el': 'Γεια σας, ενδιαφέρομαι να παραγγείλω τον οδηγό αναρρίχησης της Κύπρου και να παραλάβω εξοπλισμό από εσάς. Θα εκτιμούσα περισσότερες λεπτομέρειες.'
                        };
                        messageField.value = messages[currentLang] || messages['he'];
                        messageField.focus();
                    }
                }, 1000);
            }
        });
    });
});

function initClimbingPricing() {
    const pricing = document.querySelector('[data-climbing-pricing]');
    if (!pricing) return;

    const options = pricing.querySelectorAll('[data-pricing-option]');
    const value = pricing.querySelector('[data-pricing-value]');
    const currency = pricing.querySelector('[data-pricing-currency]');
    const from = pricing.querySelector('[data-pricing-from]');
    const perParticipant = pricing.querySelector('[data-pricing-per]');
    const states = {
        group: { value: '300', descriptionKey: 'pricing-desc-group', currency: true, from: true, perParticipant: true },
        couple: { value: '250', descriptionKey: 'pricing-desc-couple', currency: true, from: true, perParticipant: true },
        larger: { value: 'בתיאום מראש', descriptionKey: 'pricing-desc-larger', currency: false, from: false, perParticipant: false }
    };

    function renderPricing(state) {
        const selected = states[state] || states.group;
        options.forEach(option => {
            const isActive = option.dataset.pricingOption === state;
            option.classList.toggle('is-active', isActive);
            option.setAttribute('aria-selected', String(isActive));
        });
        value.textContent = selected.value;
        currency.hidden = !selected.currency;
        if (from) from.hidden = !selected.from;
        if (perParticipant) perParticipant.hidden = !selected.perParticipant;
    }

    options.forEach(option => {
        option.addEventListener('click', () => renderPricing(option.dataset.pricingOption));
    });
    renderPricing('group');
}

function initGoogleReviewsCarousel() {
    document.querySelectorAll('[data-google-reviews-carousel]').forEach((carousel) => {
        const track = carousel.querySelector('.google-reviews-track');
        const cards = [...carousel.querySelectorAll('.google-review-card')];
        const dotsContainer = carousel.querySelector('.google-reviews-dots');
        if (!track || cards.length < 2 || !dotsContainer) return;
        let index = 0;

        cards.forEach((_, cardIndex) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = `google-reviews-dot${cardIndex === 0 ? ' is-active' : ''}`;
            dot.setAttribute('aria-label', `${document.documentElement.lang === 'en' ? 'Show review' : 'הצגת ביקורת'} ${cardIndex + 1}`);
            dot.addEventListener('click', () => goTo(cardIndex));
            dotsContainer.appendChild(dot);
        });
        const dots = [...dotsContainer.children];

        function visibleCards() {
            if (window.matchMedia('(max-width: 560px)').matches) return 1;
            if (window.matchMedia('(max-width: 800px)').matches) return 2;
            return 3;
        }
        function goTo(nextIndex) {
            const maxIndex = Math.max(0, cards.length - visibleCards());
            index = Math.min(Math.max(nextIndex, 0), maxIndex);
            track.style.transform = `translate3d(${-index * (cards[0].offsetWidth + 20)}px, 0, 0)`;
            cards.forEach((card, i) => card.classList.toggle('is-active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === Math.min(index, dots.length - 1)));
        }
        carousel.querySelector('.google-reviews-arrow.prev')?.addEventListener('click', () => goTo(index - 1));
        carousel.querySelector('.google-reviews-arrow.next')?.addEventListener('click', () => goTo(index + 1));
        window.addEventListener('resize', () => goTo(index));
        goTo(0);
    });
}

function initBoulderingVideoCarousels() {
    document.querySelectorAll('.bouldering-video-carousel').forEach(carousel => {
        const slides = [...carousel.querySelectorAll('.bouldering-video-slide')];
        const dots = [...carousel.querySelectorAll('.bouldering-video-dots button')];
        const buttons = [...carousel.querySelectorAll('[data-bouldering-direction]')];
        if (slides.length < 2) return;

        let current = 0;
        const render = index => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === current));
            dots.forEach((dot, dotIndex) => {
                const active = dotIndex === current;
                dot.classList.toggle('is-active', active);
                dot.setAttribute('aria-selected', String(active));
            });
        };

        buttons.forEach(button => button.addEventListener('click', () => {
            render(current + Number(button.dataset.boulderingDirection));
        }));
        dots.forEach((dot, dotIndex) => dot.addEventListener('click', () => render(dotIndex)));
        render(0);
    });
}

// Lightweight fallback controls for carousels on pages without the guide's inline script.
if (typeof window.changeSlide !== 'function') {
    window.changeSlide = function(btn, direction, event) {
        if (event) event.stopPropagation();
        const carousel = btn.closest('.image-carousel');
        if (!carousel) return;
        const images = [...carousel.querySelectorAll('.carousel-image')];
        const dots = [...carousel.querySelectorAll('.carousel-dot')];
        const current = images.findIndex(image => image.classList.contains('active'));
        if (!images.length || current < 0) return;
        const next = (current + direction + images.length) % images.length;
        images.forEach((image, index) => image.classList.toggle('active', index === next));
        dots.forEach((dot, index) => dot.classList.toggle('active', index === next));
    };
}

if (typeof window.currentSlide !== 'function') {
    window.currentSlide = function(dot, index, event) {
        if (event) event.stopPropagation();
        const carousel = dot.closest('.image-carousel');
        if (!carousel) return;
        const images = [...carousel.querySelectorAll('.carousel-image')];
        const dots = [...carousel.querySelectorAll('.carousel-dot')];
        images.forEach((image, imageIndex) => image.classList.toggle('active', imageIndex === index));
        dots.forEach((item, dotIndex) => item.classList.toggle('active', dotIndex === index));
    };
}

// Set language function
function setLanguage(lang) {
    currentLang = lang;
    
    // Update HTML lang and dir attributes
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    
    // Set text direction (RTL for Hebrew, LTR for others)
    if (lang === 'he') {
        html.setAttribute('dir', 'rtl');
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
    } else {
        html.setAttribute('dir', 'ltr');
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
    }
    
    // Update all translatable elements
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(element => {
        const key = element.getAttribute('data-i18n-html');
        if (translations[lang] && translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            element.setAttribute('placeholder', translations[lang][key]);
        }
    });

    const guideContent = document.querySelector('.guide-content');
    if (guideContent) {
        guideContent.querySelectorAll('[data-auto-hidden-en]').forEach(element => {
            element.hidden = false;
            element.removeAttribute('data-auto-hidden-en');
        });

        if (lang === 'en') {
            const walker = document.createTreeWalker(guideContent, NodeFilter.SHOW_TEXT);
            const textNodes = [];
            let node;
            while ((node = walker.nextNode())) textNodes.push(node);
            textNodes.forEach(textNode => {
                if (!/[א-ת]/.test(textNode.nodeValue || '')) return;
                const element = textNode.parentElement?.closest('p, h1, h2, h3, h4, h5, a, button, li, label, span, div');
                const key = element?.getAttribute('data-i18n') || element?.getAttribute('data-i18n-html');
                const hasTranslation = key && translations[lang] && translations[lang][key];
                if (element && !hasTranslation) {
                    element.hidden = true;
                    element.setAttribute('data-auto-hidden-en', 'true');
                }
            });
        }
    }

    document.querySelectorAll('[data-hide-in-en]').forEach(element => {
        element.hidden = lang === 'en';
    });
    
    // Update displayed language code
    const langCodes = { 'he': 'HE', 'en': 'EN', 'ru': 'RU', 'el': 'EL' };
    const currentLangElement = document.querySelector('.current-lang');
    if (currentLangElement) {
        currentLangElement.textContent = langCodes[lang];
    }
    
    // Update active option state
    document.querySelectorAll('.lang-option').forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-lang') === lang) {
            option.classList.add('active');
        }
    });
    
    // Save language preference
    localStorage.setItem('preferred-language', lang);
    
    // Re-check climber guide links when language changes
    checkClimberGuideLinks();
}

// Check and handle climber guide links when in English mode
function checkClimberGuideLinks() {
    document.querySelectorAll('[data-quiz-link]').forEach(link => {
        link.setAttribute('href', currentLang === 'en' ? '/en/safety-quiz' : '/safety-quiz');
    });
}

// Testimonials Carousel Function
function initTestimonialsCarousel() {
    const cards = document.querySelectorAll('.testimonial-card');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    if (!cards.length) return;
    
    let currentIndex = 0;
    
    // Create dots
    cards.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `${document.documentElement.lang === 'en' ? 'Show testimonial' : 'הצגת המלצה'} ${index + 1}`);
        dot.setAttribute('aria-pressed', String(index === 0));
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.carousel-dot');
    
    function showSlide(index) {
        cards.forEach(card => card.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        cards[index].classList.add('active');
        dots[index].classList.add('active');
        dots.forEach((dot, dotIndex) => dot.setAttribute('aria-pressed', String(dotIndex === index)));
    }

    function goToSlide(index) {
        currentIndex = index;
        showSlide(currentIndex);
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % cards.length;
        showSlide(currentIndex);
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        showSlide(currentIndex);
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Auto-advance carousel every 5 seconds
    setInterval(nextSlide, 5000);
}

// Lightbox functionality
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('.lightbox-image');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    const counter = document.querySelector('.lightbox-counter');
    
    let currentImageIndex = 0;
    const images = Array.from(galleryItems);
    
    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function updateLightboxImage() {
        if (images[currentImageIndex]) {
            lightboxImg.src = images[currentImageIndex].src;
            lightboxImg.alt = images[currentImageIndex].alt || (document.documentElement.lang === 'en' ? 'Rock climbing in Cyprus' : 'טיפוס צוקים בקפריסין');
            counter.textContent = `${currentImageIndex + 1} / ${images.length}`;
        }
    }
    
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateLightboxImage();
    }
    
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }
    
    // Event listeners
    galleryItems.forEach((img, index) => {
        img.addEventListener('click', () => openLightbox(index));
    });
    
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    if (prevBtn) prevBtn.addEventListener('click', prevImage);
    
    // Close on background click
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });
}

// Video Modal Functions
function openVideoModal(videoSrc) {
    const videoModal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    
    if (videoModal && modalVideo) {
        modalVideo.src = videoSrc;
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modalVideo.play();
    }
}

function closeVideoModal() {
    const videoModal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    
    if (videoModal && modalVideo) {
        videoModal.classList.remove('active');
        document.body.style.overflow = '';
        modalVideo.pause();
        modalVideo.currentTime = 0;
    }
}

// Close video modal on background click
document.addEventListener('DOMContentLoaded', () => {
    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });
    }
    
    // Keyboard navigation for video modal
    document.addEventListener('keydown', (e) => {
        if (videoModal && videoModal.classList.contains('active')) {
            if (e.key === 'Escape') closeVideoModal();
        }
    });

    // Video autoplay on hover
    const videoContainer = document.querySelector('.video-container-full');
    const videoIframe = document.getElementById('videoIframe');
    
    
    if (videoContainer && videoIframe) {
        videoContainer.addEventListener('mouseenter', () => {
            // Send play command to YouTube iframe
            videoIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        });
        
        videoContainer.addEventListener('mouseleave', () => {
            // Send pause command to YouTube iframe
            videoIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        });

        // Start the muted homepage film when it reaches the viewport.
        const playWhenVisible = new IntersectionObserver((entries, observer) => {
            if (entries.some(entry => entry.isIntersecting)) {
                videoIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                observer.disconnect();
            }
        }, { threshold: 0.55 });
        playWhenVisible.observe(videoContainer);
    }

    // Auto-fill contact form message based on source
    function applyContactInterestFromUrl() {
        const requested = new URLSearchParams(window.location.search).get('interest');
        const labels = { 'climbing-day': 'יום טיפוס', course: 'קורס', rappelling: 'סנפלינג', equipment: 'השכרת ציוד' };
        const interest = labels[requested] || requested;
        if (!interest) return;
        const options = document.querySelectorAll('#contact .interest-option');
        const selected = [...options].find(option => option.dataset.interest === interest);
        if (!selected) return;
        options.forEach(option => option.classList.toggle('is-selected', option === selected));
        const hidden = document.getElementById('interest');
        if (hidden) hidden.value = selected.dataset.interest;
    }

    applyContactInterestFromUrl();

    function prefillContactMessage() {
        const urlParams = new URLSearchParams(window.location.search);
        const equipmentType = urlParams.get('equipment');
        const tourType = urlParams.get('tour');
        const activityType = urlParams.get('activity');
        
        const messageField = document.getElementById('message');
        
        if (messageField && (equipmentType || tourType || activityType)) {
            let prefillText = 'היי אני מעוניין/ת בחווית טיפוס בקפריסין';
            
            if (equipmentType) {
                prefillText += `\n\nהיי, אני מתעניין/ת בהשכרת ${equipmentType}. `;
            } else if (tourType) {
                prefillText += `\n\nהיי, אני מתעניין/ת בטיול ${tourType}. `;
            } else if (activityType) {
                prefillText += `\n\nהיי, אני מתעניין/ת ב${activityType}. `;
            }
            
            if (prefillText) {
                messageField.value = prefillText;
                // Scroll to contact form
                setTimeout(() => {
                    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }
    
    // Run on page load
    prefillContactMessage();
    
    // Handle equipment order buttons
    document.querySelectorAll('.equipment-order-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const equipmentType = this.getAttribute('data-equipment-type');
            if (!equipmentType) return;
            e.preventDefault();
            window.location.href = `${currentLang === 'en' ? '/en/' : '/'}?interest=equipment&equipment=${encodeURIComponent(equipmentType)}#contact`;
        });
    });
    
    // Handle activity booking buttons
    document.querySelectorAll('.activity-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.includes('#contact')) {
                e.preventDefault();
                const activityCard = this.closest('.activity-card');
                const activityTitle = activityCard ? activityCard.querySelector('h3').textContent : '';
                const interest = this.dataset.contactInterest || (/סנפלינג|rappel/i.test(activityTitle) ? 'rappelling' : 'climbing-day');
                window.location.href = `${currentLang === 'en' ? '/en/' : '/'}?interest=${interest}&activity=${encodeURIComponent(activityTitle)}#contact`;
            }
        });
    });
    
    // Handle tour booking buttons
    document.querySelectorAll('.tour-book-btn, .cta-button, .book-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.includes('#contact')) {
                e.preventDefault();
                const tourTitle = document.querySelector('.tour-hero h1')?.textContent || 
                                document.querySelector('h1')?.textContent || '';
                const page = window.location.pathname.toLowerCase();
                const interest = this.dataset.contactInterest || (/course|syllabus|sylabus/.test(page) ? 'course' : /equipment/.test(page) ? 'equipment' : 'climbing-day');
                window.location.href = `${currentLang === 'en' ? '/en/' : '/'}?interest=${interest}&tour=${encodeURIComponent(tourTitle)}#contact`;
            }
        });
    });
});
