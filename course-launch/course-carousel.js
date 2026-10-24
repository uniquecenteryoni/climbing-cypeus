(() => {
    const carousel = document.querySelector('.lead-carousel');
    if (!carousel) return;
    const track = carousel.querySelector('.lead-carousel-track');
    const slides = [...track.querySelectorAll('.lead-carousel-slide')];
    const count = carousel.querySelector('.lead-carousel-count');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;

    const show = (next) => {
        index = (next + slides.length) % slides.length;
        track.scrollTo({ left: -index * track.clientWidth, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    };
    carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => show(index - 1));
    carousel.querySelector('[data-carousel-next]').addEventListener('click', () => show(index + 1));
    track.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        show(index + (event.key === 'ArrowLeft' ? 1 : -1));
    });
    track.addEventListener('scroll', () => {
        index = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
        count.textContent = `${index + 1} / ${slides.length}`;
    }, { passive: true });
    new ResizeObserver(() => {
        track.scrollTo({ left: -index * track.clientWidth, behavior: 'instant' });
    }).observe(track);
})();
