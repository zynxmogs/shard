(() => {
    "use strict";

    const THEME_KEY = "shard-theme";
    const DRAG_THRESHOLD = 8; // px of pointer movement before a tap becomes a drag

    const navPages = document.querySelector(".nav-pages");
    const navLinks = [...document.querySelectorAll(".nav-pages a")];
    const themeButton = document.querySelector(".theme-button");
    const themePill = document.querySelector(".theme-pill");


    /* =========================================
       THEME (icon, animated cross-fade)
    ========================================= */

    const SUN_ICON = `<svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7"/></svg>`;
    const MOON_ICON = `<svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.6 15.2a8.7 8.7 0 1 1-11.8-11.8.7.7 0 0 1 .8 1 7 7 0 0 0 9.4 9.4.7.7 0 0 1 1 .8 8.8 8.8 0 0 1 .6.6Z"/></svg>`;

    function buildThemeButton() {
        if (!themeButton) return;
        themeButton.innerHTML = SUN_ICON + MOON_ICON;
        themeButton.setAttribute("type", "button");
        themeButton.setAttribute("aria-label", "Toggle theme");
    }

    function applyTheme(theme) {
        const isLight = theme === "light";
        document.body.classList.toggle("light", isLight);

        if (themeButton) {
            themeButton.setAttribute("aria-pressed", String(isLight));
        }
    }

    function loadTheme() {
        let theme = "dark";

        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === "light" || saved === "dark") {
                theme = saved;
            }
        } catch {}

        applyTheme(theme);
    }

    function toggleTheme() {
        const next = document.body.classList.contains("light") ? "dark" : "light";

        if (themeButton) {
            themeButton.classList.remove("switching");
            void themeButton.offsetWidth;
            themeButton.classList.add("switching");
        }

        try {
            localStorage.setItem(THEME_KEY, next);
        } catch {}

        applyTheme(next);
    }

    buildThemeButton();
    loadTheme();

    if (themeButton) {
        themeButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleTheme();
        });
    }


    /* =========================================
       POINTER-REACTIVE GLASS HIGHLIGHT
    ========================================= */

    function attachSpecular(el) {
        if (!el) return;

        el.addEventListener("pointermove", (event) => {
            const rect = el.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            el.style.setProperty("--mx", `${x}%`);
            el.style.setProperty("--my", `${y}%`);
        });

        el.addEventListener("pointerleave", () => {
            el.style.removeProperty("--mx");
            el.style.removeProperty("--my");
        });
    }

    attachSpecular(navPages);
    attachSpecular(themePill);


    /* =========================================
       PAGE DETECTION
    ========================================= */

    function currentPage() {
        let path = window.location.pathname;
        path = path.split("?")[0].split("#")[0];

        if (!path || path === "/" || path.endsWith("/")) {
            return "index.html";
        }

        return path.split("/").filter(Boolean).pop().toLowerCase() || "index.html";
    }

    function normalizeHref(href) {
        if (!href) return "";

        if (
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("//") ||
            href.startsWith("#")
        ) {
            return href;
        }

        href = href.split("?")[0].split("#")[0];

        if (href === "" || href === "/") {
            return "index.html";
        }

        return href.split("/").filter(Boolean).pop().toLowerCase();
    }

    function getCurrentLink() {
        const page = currentPage();

        return (
            navLinks.find((link) => normalizeHref(link.getAttribute("href")) === page) ||
            navLinks[0]
        );
    }

    function navigateTo(href) {
        document.body.classList.add("page-leaving");

        window.setTimeout(() => {
            window.location.href = href;
        }, 430);
    }


    /* =========================================
       SLIDER
    ========================================= */

    let activeLink = getCurrentLink();

    function getMetrics(link) {
        if (!link || !navPages) return null;

        const navRect = navPages.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();

        return {
            left: linkRect.left - navRect.left,
            top: linkRect.top - navRect.top,
            width: linkRect.width,
            height: linkRect.height
        };
    }

    function setSlider(link, animated = true) {
        if (!link || !navPages) return;

        const metrics = getMetrics(link);
        if (!metrics) return;

        if (!animated) {
            navPages.classList.add("slider-static");
        }

        navPages.style.setProperty("--slider-x", `${metrics.left}px`);
        navPages.style.setProperty("--slider-y", `${metrics.top}px`);
        navPages.style.setProperty("--slider-width", `${metrics.width}px`);
        navPages.style.setProperty("--slider-height", `${metrics.height}px`);
        navPages.style.setProperty("--slider-blur", "0px");
        navPages.style.setProperty("--slider-scale", "1");

        if (!animated) {
            navPages.offsetWidth;
            navPages.classList.remove("slider-static");
        }
    }

    function setActive(link, animated = true) {
        if (!link) return;

        navLinks.forEach((item) => {
            item.classList.toggle("active", item === link);
        });

        activeLink = link;
        setSlider(link, animated);
    }

    function initializeSlider(animated) {
        setActive(getCurrentLink(), animated);
    }

    function primeSlider() {
        // Position instantly with whatever layout is available right now, so
        // the pill never visibly "pops" into place after the page is already
        // on screen (or after the user has already clicked to another tab).
        initializeSlider(false);

        // If a webfont swaps in later and nudges link widths, quietly
        // re-measure once - still without animating - to correct any drift.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                requestAnimationFrame(() => initializeSlider(false));
            });
        }
    }

    requestAnimationFrame(primeSlider);


    /* =========================================
       DRAGGING (press-and-slide to pick a tab)
    ========================================= */

    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let isDragging = false; // true only once movement passes the threshold
    let moved = false;      // true once a real drag happened this gesture
    let dragTarget = null;

    function closestLink(x) {
        let closest = null;
        let smallest = Infinity;

        navLinks.forEach((link) => {
            const rect = link.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            const distance = Math.abs(x - center);

            if (distance < smallest) {
                smallest = distance;
                closest = link;
            }
        });

        return closest;
    }

    function updateDrag(x) {
        if (!navPages) return;

        const target = closestLink(x);
        if (!target) return;

        dragTarget = target;
        const metrics = getMetrics(target);
        if (!metrics) return;

        navPages.style.setProperty("--slider-x", `${metrics.left}px`);
        navPages.style.setProperty("--slider-y", `${metrics.top}px`);
        navPages.style.setProperty("--slider-width", `${metrics.width}px`);
        navPages.style.setProperty("--slider-height", `${metrics.height}px`);
        navPages.style.setProperty("--slider-blur", "0.4px");
        navPages.style.setProperty("--slider-scale", "1.02");

        navLinks.forEach((link) => {
            link.classList.toggle("active", link === target);
        });
    }

    function endLiquidDrag() {
        navPages.classList.remove("dragging");
        navPages.style.setProperty("--slider-blur", "0px");
        navPages.style.setProperty("--slider-scale", "1");
    }

    if (navPages) {
        navPages.addEventListener("pointerdown", (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;

            pointerId = event.pointerId;
            startX = event.clientX;
            startY = event.clientY;
            moved = false;
            isDragging = false;
            dragTarget = null;

            navPages.setPointerCapture?.(event.pointerId);
        });

        navPages.addEventListener("pointermove", (event) => {
            if (event.pointerId !== pointerId) return;

            if (!isDragging) {
                const dx = event.clientX - startX;
                const dy = event.clientY - startY;
                if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

                // Only a real drag starts the "liquid" visual state - a plain
                // tap never touches the slider, so it never has anything to
                // spring back from.
                isDragging = true;
                navPages.classList.add("dragging");
            }

            moved = true;
            updateDrag(event.clientX);
        });

        function finishDrag(event) {
            if (event.pointerId !== pointerId) return;

            navPages.releasePointerCapture?.(event.pointerId);
            pointerId = null;

            if (!isDragging) {
                // Simple tap - let the anchor's own click handler do the work.
                dragTarget = null;
                return;
            }

            endLiquidDrag();
            isDragging = false;

            const selected = dragTarget || activeLink;
            setActive(selected, true);

            if (moved && normalizeHref(selected.getAttribute("href")) !== currentPage()) {
                navigateTo(selected.getAttribute("href"));
            }

            dragTarget = null;
        }

        navPages.addEventListener("pointerup", finishDrag);

        navPages.addEventListener("pointercancel", (event) => {
            if (event.pointerId !== pointerId) return;

            navPages.releasePointerCapture?.(event.pointerId);
            pointerId = null;

            if (isDragging) {
                endLiquidDrag();
                setSlider(activeLink, true);
            }

            isDragging = false;
            dragTarget = null;
        });
    }


    /* =========================================
       NORMAL NAVIGATION (click / keyboard)
    ========================================= */

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            if (moved) {
                // This click is the tail end of a drag gesture that already
                // navigated (or didn't need to) - swallow it.
                event.preventDefault();
                moved = false;
                return;
            }

            const href = link.getAttribute("href");
            if (!href) return;

            if (
                href.startsWith("http://") ||
                href.startsWith("https://") ||
                href.startsWith("//") ||
                href.startsWith("#")
            ) {
                return;
            }

            event.preventDefault();
            setActive(link, true);

            if (normalizeHref(href) === currentPage()) return;

            navigateTo(href);
        });
    });


    /* =========================================
       PAGE SHOW (bfcache / back-forward restore)
    ========================================= */

    window.addEventListener("pageshow", () => {
        document.body.classList.remove("page-leaving");
        loadTheme();
        requestAnimationFrame(primeSlider);
    });


    /* =========================================
       RESIZE
    ========================================= */

    let resizeTimer = null;

    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initializeSlider(false);
        }, 80);
    });


    /* =========================================
       SCROLL REVEAL
    ========================================= */

    const revealElements = document.querySelectorAll(".card, .footer");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const target = entry.target;

                // Stagger each list item's reveal based on its own position,
                // so this works for any number of items (not just the first 5).
                target.querySelectorAll("li").forEach((item, index) => {
                    item.style.transitionDelay = `${Math.min(index, 8) * 70}ms`;
                });

                target.classList.add("visible");
                observer.unobserve(target);
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    revealElements.forEach((element) => observer.observe(element));

})();
