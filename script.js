// Language switcher and interaction functionality
let currentLang = 'he';

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language
    setLanguage(currentLang);
    
    // Language switcher dropdown
    const langToggle = document.getElementById('langToggle');
    const langDropdown = document.getElementById('langDropdown');
    const langOptions = document.querySelectorAll('.lang-option');
    
    if (langToggle && langDropdown) {
        // Toggle dropdown
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!langToggle.contains(e.target) && !langDropdown.contains(e.target)) {
                langDropdown.classList.remove('active');
            }
        });
        
        // Language option selection
        langOptions.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                setLanguage(lang);
                
                // Update active option
                langOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Update displayed language code
                const langCodes = { 'he': 'HE', 'en': 'EN', 'ru': 'RU', 'el': 'EL' };
                document.querySelector('.current-lang').textContent = langCodes[lang];
                
                // Close dropdown
                langDropdown.classList.remove('active');
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
    
    // Save language preference
    localStorage.setItem('preferred-language', lang);
}

// Load saved language preference on page load
window.addEventListener('load', () => {
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && translations[savedLang]) {
        setLanguage(savedLang);
        
        // Update option active state
        document.querySelectorAll('.lang-option').forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-lang') === savedLang) {
                option.classList.add('active');
            }
        });
        
        // Update displayed language code
        const langCodes = { 'he': 'HE', 'en': 'EN', 'ru': 'RU', 'el': 'EL' };
        const currentLangElement = document.querySelector('.current-lang');
        if (currentLangElement) {
            currentLangElement.textContent = langCodes[savedLang];
        }
    }
});

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
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
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




