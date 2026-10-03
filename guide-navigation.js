// Keep the guide menu in view even when ancestors clip horizontal overflow.
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.guide-section-nav');
    if (!nav) return;
    const marker = document.createElement('div');
    marker.className = 'guide-nav-placeholder';
    nav.before(marker);
    const header = document.querySelector('.navbar');
    let scheduled = false;
    function update() {
        scheduled = false;
        const position = header && getComputedStyle(header).position;
        const offset = ['fixed', 'sticky'].includes(position) ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
        const height = nav.getBoundingClientRect().height;
        const pinned = marker.getBoundingClientRect().top <= offset;
        nav.style.setProperty('--guide-nav-top', `${offset}px`);
        document.documentElement.style.setProperty('--guide-anchor-offset', `${offset + height + 20}px`);
        marker.style.height = pinned ? `${height}px` : '0px';
        nav.classList.toggle('is-pinned', pinned);
    }
    function schedule() {
        if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    new ResizeObserver(schedule).observe(nav);
    if (header) new ResizeObserver(schedule).observe(header);
    update();
});
