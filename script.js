(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Sticky bar: show once the banner has scrolled above the viewport.
    const banner = document.getElementById('banner');
    const sticky = document.getElementById('sticky');
    if (banner && sticky && 'IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
            sticky.classList.toggle('is-visible', scrolledPast);
        }).observe(banner);
    }

    // Lightbox: tap an illustration to see it whole; tap anywhere, Esc, or × to close.
    const lightbox = document.getElementById('lightbox');
    if (lightbox && typeof lightbox.showModal === 'function') {
        const big = lightbox.querySelector('img');
        document.querySelectorAll('a.zoom').forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const thumb = link.querySelector('img');
                big.src = link.getAttribute('href');
                big.alt = thumb ? thumb.alt : '';
                lightbox.showModal();
            });
        });
        lightbox.addEventListener('click', () => lightbox.close());
        lightbox.addEventListener('close', () => big.removeAttribute('src'));
    }

    // Mural: drag to pan with a mouse (touch scrolls natively), plus a slow drift
    // that stops for good as soon as the visitor touches it.
    const mural = document.getElementById('mural');
    if (mural) {
        let userTookOver = false;
        let dragging = false;
        let startX = 0;
        let startScroll = 0;

        const takeOver = () => { userTookOver = true; };

        mural.addEventListener('pointerdown', (event) => {
            takeOver();
            if (event.pointerType !== 'mouse') return;
            dragging = true;
            startX = event.clientX;
            startScroll = mural.scrollLeft;
            mural.classList.add('is-dragging');
            mural.setPointerCapture(event.pointerId);
        });
        mural.addEventListener('pointermove', (event) => {
            if (dragging) mural.scrollLeft = startScroll - (event.clientX - startX);
        });
        const endDrag = () => {
            dragging = false;
            mural.classList.remove('is-dragging');
        };
        mural.addEventListener('pointerup', endDrag);
        mural.addEventListener('pointercancel', endDrag);
        ['wheel', 'touchstart', 'keydown'].forEach((type) => {
            mural.addEventListener(type, takeOver, { passive: true });
        });

        if (!reduceMotion.matches && 'IntersectionObserver' in window) {
            const speed = 18; // px per second
            let onScreen = false;
            let last = 0;
            let position = 0;
            let direction = 1;

            new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; }).observe(mural);

            const drift = (now) => {
                if (userTookOver || reduceMotion.matches) return;
                const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
                last = now;
                const max = mural.scrollWidth - mural.clientWidth;
                if (onScreen && max > 0) {
                    position += direction * speed * dt;
                    if (position >= max) { position = max; direction = -1; }
                    if (position <= 0) { position = 0; direction = 1; }
                    mural.scrollLeft = position;
                }
                requestAnimationFrame(drift);
            };
            requestAnimationFrame(drift);
        }
    }
})();
