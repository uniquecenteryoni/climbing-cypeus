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
    
    // Check if we're on climber-guide.html page in English mode
    if (window.location.pathname.includes('climber-guide.html') && currentLang === 'en') {
        // Hide all content
        const mainContent = document.querySelector('main') || document.querySelector('article') || document.querySelector('.container');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
        // Show the modal
        showHebrewOnlyModal();
    }
    
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
    const climberGuideLinks = document.querySelectorAll('a[href*="climber-guide.html"]');
    
    climberGuideLinks.forEach(link => {
        // Remove any existing event listeners
        link.replaceWith(link.cloneNode(true));
    });
    
    // Re-select links after cloning
    const newLinks = document.querySelectorAll('a[href*="climber-guide.html"]');
    
    newLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (currentLang === 'en') {
                e.preventDefault();
                showHebrewOnlyModal();
            }
        });
    });
}

// Show modal for Hebrew-only content
function showHebrewOnlyModal() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        padding: 1rem;
        animation: fadeIn 0.3s ease-out;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 2.5rem;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        text-align: center;
        position: relative;
        animation: slideIn 0.3s ease-out;
    `;
    
    modalContent.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">🇮🇱</div>
        <h3 style="color: #2c5f2d; margin-bottom: 1rem; font-size: 1.5rem;">Climber's Guide Available in Hebrew Only</h3>
        <p style="color: #666; line-height: 1.6; margin-bottom: 1.5rem;">
            The comprehensive climbing guide is currently available only in Hebrew.<br>
            Please switch to Hebrew to view this content.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button id="switchToHebrew" style="
                padding: 0.75rem 1.5rem;
                background: #2c5f2d;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                font-size: 1rem;
                transition: all 0.3s;
            ">
                Switch to Hebrew
            </button>
            <button id="closeModal" style="
                padding: 0.75rem 1.5rem;
                background: #f0f0f0;
                color: #333;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                font-size: 1rem;
                transition: all 0.3s;
            ">
                Back to Home
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { 
                opacity: 0;
                transform: translateY(-20px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        #switchToHebrew:hover {
            background: #3d7f3f !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(44, 95, 45, 0.3);
        }
        #closeModal:hover {
            background: #e0e0e0 !important;
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
    
    // Handle button clicks
    document.getElementById('switchToHebrew').addEventListener('click', () => {
        setLanguage('he');
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === 'he') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        window.location.href = 'climber-guide.html';
    });
    
    document.getElementById('closeModal').addEventListener('click', () => {
        // If we're on climber-guide page, redirect to home
        if (window.location.pathname.includes('climber-guide.html')) {
            window.location.href = 'index.html';
        } else {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => modal.remove(), 300);
        }
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => modal.remove(), 300);
        }
    });
    
    // Add fadeOut animation
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(fadeOutStyle);
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
    }

    // Auto-fill contact form message based on source
    function prefillContactMessage() {
        const urlParams = new URLSearchParams(window.location.search);
        const equipmentType = urlParams.get('equipment');
        const tourType = urlParams.get('tour');
        const activityType = urlParams.get('activity');
        
        const messageField = document.getElementById('message');
        
        if (messageField) {
            let prefillText = '';
            
            if (equipmentType) {
                prefillText = `היי, אני מתעניין/ת בהשכרת ${equipmentType}. `;
            } else if (tourType) {
                prefillText = `היי, אני מתעניין/ת בטיול ${tourType}. `;
            } else if (activityType) {
                prefillText = `היי, אני מתעניין/ת ב${activityType}. `;
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




