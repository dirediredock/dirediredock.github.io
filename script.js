(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;

    // Theme: light by default; the toggle switches to dark and remembers it.
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const render = () => {
            themeToggle.setAttribute('aria-checked', String(root.dataset.theme === 'dark'));
        };
        render();
        themeToggle.addEventListener('click', () => {
            root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem('theme', root.dataset.theme); } catch (e) { /* storage blocked: still switches */ }
            render();
        });
    }

    // Gallery: shuffle the illustrations on every page load (Fisher–Yates).
    const gallery = document.querySelector('.gallery');
    if (gallery) {
        const items = Array.from(gallery.children);
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        gallery.append(...items);
    }

    // Justified rows: split items into rows of equal height that fill the width
    // exactly. Aspect ratios come from each <img>'s width/height attributes, so
    // layout happens before images load and nothing is ever cropped.
    const justify = (container, targetHeight) => {
        const items = Array.from(container.querySelectorAll(':scope > a, :scope > .jrow > a'));
        const ratios = items.map((a) => {
            const img = a.querySelector('img');
            return Number(img.getAttribute('width')) / Number(img.getAttribute('height')) || 1;
        });
        let rowCount = 0;

        // Contiguous split of ratios into k rows with the smallest worst-row width (linear partition).
        const partition = (k) => {
            const n = ratios.length;
            const prefix = [0];
            ratios.forEach((r, i) => prefix.push(prefix[i] + r));
            const sum = (i, j) => prefix[j] - prefix[i];
            const cost = Array.from({ length: k + 1 }, () => Array(n + 1).fill(Infinity));
            const cut = Array.from({ length: k + 1 }, () => Array(n + 1).fill(0));
            cost[0][0] = 0;
            for (let r = 1; r <= k; r++) {
                for (let j = r; j <= n; j++) {
                    for (let i = r - 1; i < j; i++) {
                        const c = Math.max(cost[r - 1][i], sum(i, j));
                        if (c < cost[r][j]) { cost[r][j] = c; cut[r][j] = i; }
                    }
                }
            }
            const bounds = [];
            for (let r = k, j = n; r > 0; r--) { bounds.unshift(cut[r][j]); j = cut[r][j]; }
            bounds.push(n);
            return bounds.slice(0, -1).map((start, r) => [start, bounds[r + 1]]);
        };

        const layout = () => {
            const width = container.clientWidth;
            if (!width) return;
            const total = ratios.reduce((a, b) => a + b, 0);
            const k = Math.min(items.length, Math.max(1, Math.round((total * targetHeight()) / width)));
            if (k === rowCount) return;
            rowCount = k;
            const rows = partition(k).map(([start, end]) => {
                const row = document.createElement('div');
                row.className = 'jrow';
                for (let i = start; i < end; i++) {
                    items[i].style.flex = `${ratios[i]} 1 0`;
                    row.append(items[i]);
                }
                return row;
            });
            container.replaceChildren(...rows);
            container.classList.add('is-justified');
        };

        layout();
        if ('ResizeObserver' in window) new ResizeObserver(layout).observe(container);
    };

    const phone = window.matchMedia('(max-width: 600px)');
    const plans = document.querySelector('.plans');
    if (plans) justify(plans, () => (phone.matches ? 110 : 150));
    if (gallery) justify(gallery, () => (phone.matches ? 150 : 260));

    // Expand buttons: any button with aria-controls opens/closes that region.
    const setOpen = (button, open) => {
        const region = document.getElementById(button.getAttribute('aria-controls'));
        if (!region) return;
        region.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', String(open));
        const label = button.querySelector('.more-label');
        if (label) {
            if (!label.dataset.closed) label.dataset.closed = label.textContent;
            label.textContent = open ? (button.dataset.openLabel || 'Close') : label.dataset.closed;
        }
    };
    document.querySelectorAll('button[aria-controls]').forEach((button) => {
        button.addEventListener('click', () => {
            setOpen(button, button.getAttribute('aria-expanded') !== 'true');
        });
    });

    // Tool cards: a click anywhere on the card works like its Details button.
    // Skipped for links, buttons, the open Details text, and text selections.
    document.querySelectorAll('.tool').forEach((card) => {
        const details = card.querySelector('button.more');
        if (!details) return;
        card.classList.add('is-clickable');
        card.addEventListener('click', (event) => {
            if (event.target.closest('a, button, .tool-more')) return;
            if (String(window.getSelection())) return;
            details.click();
        });
    });

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

        const revealButton = document.querySelector('[aria-controls="more-illustration"]');
        let downX = 0;
        let downScroll = 0;
        mural.addEventListener('click', (event) => {
            const moved = Math.abs(event.clientX - downX) + Math.abs(mural.scrollLeft - downScroll);
            if (revealButton && moved < 6) setOpen(revealButton, true);
        });

        mural.addEventListener('pointerdown', (event) => {
            downX = event.clientX;
            downScroll = mural.scrollLeft;
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

        // When the whole mural fits (wide screens), drop the drag cursor and hint.
        const checkFits = () => {
            mural.classList.toggle('mural--fits', mural.scrollWidth <= mural.clientWidth + 1);
        };
        checkFits();
        mural.querySelector('img').addEventListener('load', checkFits);
        if ('ResizeObserver' in window) new ResizeObserver(checkFits).observe(mural);

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
