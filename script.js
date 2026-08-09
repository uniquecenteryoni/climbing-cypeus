// Language switcher and interaction functionality
// Get language from URL parameter, then localStorage, then default to Hebrew
function getInitialLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    
    // If lang is in URL, use it and save to localStorage
    if (urlLang && ['he', 'en'].includes(urlLang)) {
        localStorage.setItem('preferred-language', urlLang);
        return urlLang;
    }
    
    // Otherwise use localStorage or default to Hebrew
    return localStorage.getItem('preferred-language') || 'he';
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
                const lang = button.getAttribute('data-lang');
                setLanguage(lang);
                
                // Update URL without reloading the page
                const url = new URL(window.location);
                url.searchParams.set('lang', lang);
                window.history.pushState({}, '', url);
                
                // Update active button
                langButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }
    
    // Contact form is now handled by Formspree
    // No need for JavaScript form handling
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
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
    
    // Lightbox
    initLightbox();

    // Interactive climbing-session pricing selector.
    initClimbingPricing();

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
    const description = pricing.querySelector('[data-pricing-description]');
    const states = {
        group: { value: '300', descriptionKey: 'pricing-desc-group', currency: true },
        couple: { value: '250', descriptionKey: 'pricing-desc-couple', currency: true },
        larger: { value: 'בתיאום מראש', descriptionKey: 'pricing-desc-larger', currency: false }
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
        description.dataset.i18n = selected.descriptionKey;
        description.textContent = translations[currentLang]?.[selected.descriptionKey] || description.textContent;
    }

    options.forEach(option => {
        option.addEventListener('click', () => renderPricing(option.dataset.pricingOption));
    });
    renderPricing('group');
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
    // The guide is available in both Hebrew and English; keep normal navigation.
    return;
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
    function prefillContactMessage() {
        const urlParams = new URLSearchParams(window.location.search);
        const equipmentType = urlParams.get('equipment');
        const tourType = urlParams.get('tour');
        const activityType = urlParams.get('activity');
        
        const messageField = document.getElementById('message');
        
        if (messageField) {
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
            e.preventDefault();
            const equipmentType = this.getAttribute('data-equipment-type');
            window.location.href = `index.html?equipment=${encodeURIComponent(equipmentType)}#contact`;
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
                window.location.href = `index.html?activity=${encodeURIComponent(activityTitle)}#contact`;
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
                window.location.href = `index.html?tour=${encodeURIComponent(tourTitle)}#contact`;
            }
        });
    });
});
