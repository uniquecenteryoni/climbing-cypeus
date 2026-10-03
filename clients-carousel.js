document.querySelectorAll('.clients-carousel').forEach(carousel => {
    const images = [...carousel.querySelectorAll('img')];
    const dots = [...carousel.querySelectorAll('.clients-dots button')];
    let index = 0;
    const rtl = () => getComputedStyle(carousel).direction === 'rtl';
    function show(next) {
        index = (next + images.length) % images.length;
        images.forEach((img, i) => { img.hidden = i !== index; });
        dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
        carousel.querySelector('.clients-count').textContent = `${index + 1} / ${images.length}`;
    }
    carousel.querySelector('.clients-prev').addEventListener('click', () => show(index - 1));
    carousel.querySelector('.clients-next').addEventListener('click', () => show(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    carousel.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        show(index + ((event.key === 'ArrowLeft') === rtl() ? 1 : -1));
    });
    let start;
    carousel.addEventListener('touchstart', event => { start = event.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', event => {
        if (start === undefined) return;
        const delta = event.changedTouches[0].clientX - start;
        if (Math.abs(delta) > 45) show(index + ((delta > 0) === rtl() ? 1 : -1));
        start = undefined;
    }, { passive: true });
});
