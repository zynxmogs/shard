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
                    ? "Dark"
                    : "Light";
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

        const current =
            document.body.classList.contains(
                "light"
            )
                ? "light"
                : "dark";

        const next =
            current === "light"
                ? "dark"
                : "light";

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
       SLIDER GEOMETRY
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


    /* =========================================
       INITIAL SLIDER POSITION
    ========================================= */

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
            initializeSlider
        );
    }


    /* =========================================
       DRAG STATE
    ========================================= */

    let dragging = false;
    let pointerId = null;

    let startX = 0;

    let moved = false;

    let dragTarget = null;


    /* =========================================
       FIND CLOSEST TAB
    ========================================= */

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


    /* =========================================
       DRAG UPDATE
    ========================================= */

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

        /*
            Keep the pill exactly aligned with
            the selected link while dragging.
        */

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

        navLinks.forEach(link => {

            link.classList.toggle(
                "active",
                link === target
            );
        });
    }


    /* =========================================
       POINTER DOWN
    ========================================= */

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


        /* =====================================
           POINTER MOVE
        ===================================== */

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


        /* =====================================
           POINTER UP
        ===================================== */

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


            /*
                Navigate only after a genuine drag.
            */

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
       NORMAL CLICK NAVIGATION
    ========================================= */

    navLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                /*
                    Prevent the click generated after
                    a drag from navigating twice.
                */

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
                    href.startsWith(
                        "http://"
                    ) ||
                    href.startsWith(
                        "https://"
                    ) ||
                    href.startsWith("//") ||
                    href.startsWith("#")
                ) {
                    return;
                }

                const destination =
                    normalizeHref(href);


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


                /*
                    Keep the navigation on screen
                    while the content changes.
                */

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

                    const current =
                        getCurrentLink();

                    setActive(
                        current,
                        false
                    );

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

                    const current =
                        getCurrentLink();

                    setActive(
                        current,
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


    /* =========================================
       BUTTON RIPPLE
    ========================================= */

    document
        .querySelectorAll(
            ".buttons a"
        )
        .forEach(button => {

            button.addEventListener(
                "pointerdown",
                event => {

                    const rect =
                        button.getBoundingClientRect();

                    const size =
                        Math.max(
                            rect.width,
                            rect.height
                        );

                    const ripple =
                        document.createElement(
                            "span"
                        );

                    Object.assign(
                        ripple.style,
                        {
                            position:
                                "absolute",

                            width:
                                `${size}px`,

                            height:
                                `${size}px`,

                            left:
                                `${
                                    event.clientX -
                                    rect.left -
                                    size / 2
                                }px`,

                            top:
                                `${
                                    event.clientY -
                                    rect.top -
                                    size / 2
                                }px`,

                            borderRadius:
                                "50%",

                            background:
                                "rgba(255,255,255,.24)",

                            pointerEvents:
                                "none"
                        }
                    );

                    button.appendChild(
                        ripple
                    );

                    ripple.animate(
                        [
                            {
                                transform:
                                    "scale(0)",

                                opacity: .75
                            },
                            {
                                transform:
                                    "scale(2)",

                                opacity: 0
                            }
                        ],
                        {
                            duration: 600,

                            easing:
                                "cubic-bezier(.22,1,.36,1)"
                        }
                    );

                    setTimeout(() => {
                        ripple.remove();
                    }, 650);
                }
            );
        });


    /* =========================================
       BACKGROUND PARALLAX
    ========================================= */

    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;


    window.addEventListener(
        "pointermove",
        event => {

            if (
                event.pointerType ===
                    "touch"
            ) {
                return;
            }

            targetX =
                (
                    event.clientX /
                    window.innerWidth -
                    .5
                ) * 2;

            targetY =
                (
                    event.clientY /
                    window.innerHeight -
                    .5
                ) * 2;
        }
    );


    function animateBackground() {

        currentX +=
            (targetX - currentX) *
            .018;

        currentY +=
            (targetY - currentY) *
            .018;

        document.body.style.backgroundPosition =
            `${currentX * 7}px ${currentY * 7}px`;

        requestAnimationFrame(
            animateBackground
        );
    }


    animateBackground();

})();