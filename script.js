(() => {
    "use strict";

    const THEME_KEY = "shard-theme";

    const navPages =
        document.querySelector(".nav-pages");

    const navLinks = [
        ...document.querySelectorAll(
            ".nav-pages a"
        )
    ];

    const themeButton =
        document.querySelector(
            ".theme-button"
        );


    /* =========================================
       THEME
    ========================================= */

    function applyTheme(theme) {

        const isLight =
            theme === "light";

        document.body.classList.toggle(
            "light",
            isLight
        );

        if (themeButton) {
            themeButton.textContent =
                isLight
                    ? "☀"
                    : "☾";
        }
    }


    function loadTheme() {

        let theme = "dark";

        try {

            const saved =
                localStorage.getItem(
                    THEME_KEY
                );

            if (
                saved === "light" ||
                saved === "dark"
            ) {
                theme = saved;
            }

        } catch {}

        applyTheme(theme);
    }


    function toggleTheme() {

        const next =
            document.body.classList.contains(
                "light"
            )
                ? "dark"
                : "light";

        if (themeButton) {
            themeButton.classList.remove(
                "switching"
            );

            void themeButton.offsetWidth;

            themeButton.classList.add(
                "switching"
            );
        }

        try {
            localStorage.setItem(
                THEME_KEY,
                next
            );
        } catch {}

        applyTheme(next);
    }


    loadTheme();


    if (themeButton) {

        themeButton.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                toggleTheme();
            }
        );
    }


    /* =========================================
       PAGE DETECTION
    ========================================= */

    function currentPage() {

        let path =
            window.location.pathname;

        path =
            path
                .split("?")[0]
                .split("#")[0];

        if (
            !path ||
            path === "/" ||
            path.endsWith("/")
        ) {
            return "index.html";
        }

        return (
            path
                .split("/")
                .filter(Boolean)
                .pop()
                .toLowerCase()
        ) || "index.html";
    }


    function normalizeHref(href) {

        if (!href) {
            return "";
        }

        if (
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("//") ||
            href.startsWith("#")
        ) {
            return href;
        }

        href =
            href
                .split("?")[0]
                .split("#")[0];

        if (
            href === "" ||
            href === "/"
        ) {
            return "index.html";
        }

        return (
            href
                .split("/")
                .filter(Boolean)
                .pop()
                .toLowerCase()
        );
    }


    function getCurrentLink() {

        const page =
            currentPage();

        return (
            navLinks.find(link => {

                return (
                    normalizeHref(
                        link.getAttribute(
                            "href"
                        )
                    ) === page
                );

            })
            || navLinks[0]
        );
    }


    /* =========================================
       SLIDER
    ========================================= */

    let activeLink =
        getCurrentLink();


    function getMetrics(link) {

        if (
            !link ||
            !navPages
        ) {
            return null;
        }

        const navRect =
            navPages.getBoundingClientRect();

        const linkRect =
            link.getBoundingClientRect();

        return {
            left:
                linkRect.left -
                navRect.left,

            top:
                linkRect.top -
                navRect.top,

            width:
                linkRect.width,

            height:
                linkRect.height
        };
    }


    function setSlider(
        link,
        animated = true
    ) {

        if (
            !link ||
            !navPages
        ) {
            return;
        }

        const metrics =
            getMetrics(link);

        if (!metrics) {
            return;
        }

        if (!animated) {
            navPages.classList.add(
                "slider-static"
            );
        }

        navPages.style.setProperty(
            "--slider-x",
            `${metrics.left}px`
        );

        navPages.style.setProperty(
            "--slider-y",
            `${metrics.top}px`
        );

        navPages.style.setProperty(
            "--slider-width",
            `${metrics.width}px`
        );

        navPages.style.setProperty(
            "--slider-height",
            `${metrics.height}px`
        );

        navPages.style.setProperty(
            "--slider-blur",
            "0px"
        );

        navPages.style.setProperty(
            "--slider-scale",
            "1"
        );

        if (!animated) {

            navPages.offsetWidth;

            navPages.classList.remove(
                "slider-static"
            );
        }
    }


    function setActive(
        link,
        animated = true
    ) {

        if (!link) {
            return;
        }

        navLinks.forEach(item => {

            item.classList.toggle(
                "active",
                item === link
            );
        });

        activeLink =
            link;

        setSlider(
            link,
            animated
        );
    }


    function initializeSlider() {

        const current =
            getCurrentLink();

        setActive(
            current,
            false
        );

        requestAnimationFrame(() => {

            setSlider(
                current,
                false
            );

        });
    }


    function initializeAfterLayout() {

        if (
            document.fonts &&
            document.fonts.ready
        ) {

            document.fonts.ready.then(() => {

                requestAnimationFrame(() => {
                    initializeSlider();
                });

            });

        } else {

            window.addEventListener(
                "load",
                initializeSlider,
                {
                    once: true
                }
            );
        }
    }


    initializeAfterLayout();


    /* =========================================
       DRAGGING
    ========================================= */

    let dragging = false;
    let pointerId = null;

    let startX = 0;
    let moved = false;

    let dragTarget = null;


    function closestLink(x) {

        let closest = null;
        let smallest =
            Infinity;

        navLinks.forEach(link => {

            const rect =
                link.getBoundingClientRect();

            const center =
                rect.left +
                rect.width / 2;

            const distance =
                Math.abs(
                    x - center
                );

            if (
                distance < smallest
            ) {

                smallest =
                    distance;

                closest =
                    link;
            }
        });

        return closest;
    }


    function updateDrag(x) {

        if (!navPages) {
            return;
        }

        const target =
            closestLink(x);

        if (!target) {
            return;
        }

        dragTarget =
            target;

        const metrics =
            getMetrics(target);

        if (!metrics) {
            return;
        }

        navPages.style.setProperty(
            "--slider-x",
            `${metrics.left}px`
        );

        navPages.style.setProperty(
            "--slider-y",
            `${metrics.top}px`
        );

        navPages.style.setProperty(
            "--slider-width",
            `${metrics.width}px`
        );

        navPages.style.setProperty(
            "--slider-height",
            `${metrics.height}px`
        );

        navPages.style.setProperty(
            "--slider-blur",
            "0.35px"
        );

        navPages.style.setProperty(
            "--slider-scale",
            "1.015"
        );


        navLinks.forEach(link => {

            link.classList.toggle(
                "active",
                link === target
            );
        });
    }


    if (navPages) {

        navPages.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.pointerType ===
                        "mouse" &&
                    event.button !== 0
                ) {
                    return;
                }

                dragging = true;
                moved = false;

                pointerId =
                    event.pointerId;

                startX =
                    event.clientX;

                dragTarget =
                    closestLink(
                        event.clientX
                    );

                navPages.classList.add(
                    "dragging"
                );

                navPages.setPointerCapture?.(
                    event.pointerId
                );

                updateDrag(
                    event.clientX
                );
            }
        );


        navPages.addEventListener(
            "pointermove",
            event => {

                if (
                    !dragging ||
                    event.pointerId !==
                        pointerId
                ) {
                    return;
                }

                if (
                    Math.abs(
                        event.clientX -
                        startX
                    ) > 6
                ) {
                    moved = true;
                }

                updateDrag(
                    event.clientX
                );
            }
        );


        function finishDrag(event) {

            if (
                !dragging ||
                event.pointerId !==
                    pointerId
            ) {
                return;
            }

            dragging = false;

            navPages.classList.remove(
                "dragging"
            );

            navPages.releasePointerCapture?.(
                event.pointerId
            );

            pointerId = null;


            const selected =
                dragTarget;

            if (!selected) {

                setSlider(
                    activeLink,
                    true
                );

                return;
            }


            setActive(
                selected,
                true
            );


            if (
                moved &&
                normalizeHref(
                    selected.getAttribute(
                        "href"
                    )
                ) !==
                    currentPage()
            ) {

                const href =
                    selected.getAttribute(
                        "href"
                    );

                document.body.classList.add(
                    "page-leaving"
                );

                setTimeout(() => {

                    window.location.href =
                        href;

                }, 430);
            }

            dragTarget = null;
        }


        navPages.addEventListener(
            "pointerup",
            finishDrag
        );

        navPages.addEventListener(
            "pointercancel",
            finishDrag
        );
    }


    /* =========================================
       NORMAL NAVIGATION
    ========================================= */

    navLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                if (moved) {

                    event.preventDefault();

                    moved = false;

                    return;
                }

                const href =
                    link.getAttribute(
                        "href"
                    );

                if (!href) {
                    return;
                }

                if (
                    href.startsWith("http://") ||
                    href.startsWith("https://") ||
                    href.startsWith("//") ||
                    href.startsWith("#")
                ) {
                    return;
                }

                const destination =
                    normalizeHref(
                        href
                    );


                if (
                    destination ===
                    currentPage()
                ) {

                    event.preventDefault();

                    setActive(
                        link,
                        true
                    );

                    return;
                }


                event.preventDefault();

                setActive(
                    link,
                    true
                );

                document.body.classList.add(
                    "page-leaving"
                );


                setTimeout(() => {

                    window.location.href =
                        href;

                }, 430);
            }
        );
    });


    /* =========================================
       PAGE SHOW
    ========================================= */

    window.addEventListener(
        "pageshow",
        () => {

            document.body.classList.remove(
                "page-leaving"
            );

            loadTheme();

            requestAnimationFrame(() => {

                requestAnimationFrame(() => {

                    if (
                        document.fonts &&
                        document.fonts.ready
                    ) {

                        document.fonts.ready.then(
                            () => {

                                setActive(
                                    getCurrentLink(),
                                    false
                                );

                            }
                        );

                    } else {

                        setActive(
                            getCurrentLink(),
                            false
                        );
                    }
                });
            });
        }
    );


    /* =========================================
       RESIZE
    ========================================= */

    let resizeTimer = null;

    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );

            resizeTimer =
                setTimeout(() => {

                    setActive(
                        getCurrentLink(),
                        false
                    );

                }, 80);
        }
    );


    /* =========================================
       SCROLL REVEAL
    ========================================= */

    const revealElements =
        document.querySelectorAll(
            ".card, .footer"
        );

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        !entry.isIntersecting
                    ) {
                        return;
                    }

                    entry.target.classList.add(
                        "visible"
                    );

                    observer.unobserve(
                        entry.target
                    );
                });

            },
            {
                threshold: .12,
                rootMargin:
                    "0px 0px -60px 0px"
            }
        );


    revealElements.forEach(element => {
        observer.observe(element);
    });

})();