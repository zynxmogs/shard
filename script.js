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
       THEME ICONS
    ========================================= */

    if (themeButton) {

        themeButton.innerHTML = `
            <svg
                class="theme-icon theme-icon-moon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M20.5 15.4A8.5 8.5 0 0 1 8.6 3.5 8.5 8.5 0 1 0 20.5 15.4Z"/>
            </svg>

            <svg
                class="theme-icon theme-icon-sun"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
            >
                <circle cx="12" cy="12" r="3.5"/>
                <path d="M12 2.5V4"/>
                <path d="M12 20V21.5"/>
                <path d="M4.58 4.58L5.65 5.65"/>
                <path d="M18.35 18.35L19.42 19.42"/>
                <path d="M2.5 12H4"/>
                <path d="M20 12H21.5"/>
                <path d="M4.58 19.42L5.65 18.35"/>
                <path d="M18.35 5.65L19.42 4.58"/>
            </svg>
        `;
    }


    /* =========================================
       THEME STORAGE
    ========================================= */

    function getSavedTheme() {

        try {

            const saved =
                localStorage.getItem(
                    THEME_KEY
                );

            if (
                saved === "light" ||
                saved === "dark"
            ) {
                return saved;
            }

        } catch {}

        return "dark";
    }


    function applyTheme(
        theme
    ) {

        document.body.classList.toggle(
            "light",
            theme === "light"
        );
    }


    applyTheme(
        getSavedTheme()
    );


    /* =========================================
       THEME TRANSITION
    ========================================= */

    function switchTheme(
        event
    ) {

        if (!themeButton) {
            return;
        }

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


        const x =
            event?.clientX ??
            window.innerWidth / 2;

        const y =
            event?.clientY ??
            window.innerHeight / 2;


        /*
            Create a full-screen layer.
            The new theme expands from the point
            where the user touched the icon.
        */

        const transition =
            document.createElement(
                "div"
            );

        transition.className =
            "theme-transition";

        transition.classList.toggle(
            "light",
            next === "light"
        );

        transition.style.setProperty(
            "--theme-x",
            `${x}px`
        );

        transition.style.setProperty(
            "--theme-y",
            `${y}px`
        );

        document.body.appendChild(
            transition
        );


        themeButton.classList.remove(
            "switching"
        );

        void themeButton.offsetWidth;

        themeButton.classList.add(
            "switching"
        );


        /*
            Start the circular reveal.
        */

        requestAnimationFrame(() => {

            transition.classList.add(
                "animating"
            );

        });


        /*
            Change the actual page theme
            partway through the reveal,
            while the overlay covers it.
        */

        setTimeout(() => {

            applyTheme(next);

        }, 300);


        /*
            Remove the overlay after
            the transition finishes.
        */

        setTimeout(() => {

            transition.remove();

        }, 760);
    }


    if (themeButton) {

        themeButton.addEventListener(
            "pointerup",
            event => {

                event.preventDefault();
                event.stopPropagation();

                switchTheme(
                    event
                );
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


    function normalizeHref(
        href
    ) {

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


    function currentLink() {

        const page =
            currentPage();

        return (
            navLinks.find(
                link =>
                    normalizeHref(
                        link.getAttribute(
                            "href"
                        )
                    ) === page
            )
            || navLinks[0]
        );
    }


    /* =========================================
       SLIDER
    ========================================= */

    let activeLink =
        currentLink();


    function getMetrics(
        link
    ) {

        if (
            !link ||
            !navPages
        ) {
            return null;
        }

        const parent =
            navPages.getBoundingClientRect();

        const rect =
            link.getBoundingClientRect();

        return {
            left:
                rect.left -
                parent.left,

            top:
                rect.top -
                parent.top,

            width:
                rect.width,

            height:
                rect.height
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
            "--slider-scale-x",
            "1"
        );

        navPages.style.setProperty(
            "--slider-scale-y",
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
            currentLink();

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

        document.fonts.ready.then(
            initializeSlider
        );

    } else {

        window.addEventListener(
            "load",
            initializeSlider,
            {
                once: true
            }
        );
    }


    /* =========================================
       DRAGGING
    ========================================= */

    let dragging = false;

    let pointerId = null;

    let startX = 0;

    let moved = false;

    let dragTarget = null;


    function closestLink(
        x
    ) {

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
                distance <
                smallest
            ) {

                smallest =
                    distance;

                closest =
                    link;
            }
        });

        return closest;
    }


    /*
        During a drag, move the actual pill
        continuously rather than jumping it
        between tabs.
    */

    function dragSlider(
        x
    ) {

        if (!navPages) {
            return;
        }

        const parent =
            navPages.getBoundingClientRect();

        const reference =
            dragTarget ||
            closestLink(x);

        if (!reference) {
            return;
        }

        const referenceRect =
            reference.getBoundingClientRect();

        const width =
            referenceRect.width;

        const height =
            referenceRect.height;

        let left =
            x -
            parent.left -
            width / 2;


        const minimum =
            referenceRect.left -
            parent.left;

        const maximum =
            parent.width -
            width -
            5;


        left =
            Math.max(
                5,
                Math.min(
                    left,
                    maximum
                )
            );


        /*
            Stretch slightly as the finger
            moves rapidly.
        */

        const nearest =
            closestLink(x);

        if (
            nearest &&
            nearest !== dragTarget
        ) {
            dragTarget =
                nearest;
        }


        const target =
            dragTarget ||
            nearest;


        if (target) {

            navLinks.forEach(link => {

                link.classList.toggle(
                    "active",
                    link === target
                );
            });
        }


        navPages.style.setProperty(
            "--slider-x",
            `${left}px`
        );

        navPages.style.setProperty(
            "--slider-y",
            `${referenceRect.top - parent.top}px`
        );

        navPages.style.setProperty(
            "--slider-width",
            `${width}px`
        );

        navPages.style.setProperty(
            "--slider-height",
            `${height}px`
        );

        navPages.style.setProperty(
            "--slider-scale-x",
            "1.035"
        );

        navPages.style.setProperty(
            "--slider-scale-y",
            ".91"
        );
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

                dragSlider(
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

                const distance =
                    Math.abs(
                        event.clientX -
                        startX
                    );

                if (
                    distance > 6
                ) {
                    moved = true;
                }

                dragSlider(
                    event.clientX
                );
            }
        );


        function finishDrag(
            event
        ) {

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
                dragTarget ||
                closestLink(
                    event.clientX
                );


            if (!selected) {

                setActive(
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
                Only navigate when the user
                actually dragged.
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

            /*
                Let the following click know that
                it came from a drag.
            */

            setTimeout(() => {

                moved = false;

            }, 40);
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


                /*
                    The navigation stays visible.
                    Only page content transitions.
                */

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

            applyTheme(
                getSavedTheme()
            );


            /*
                The pill is positioned instantly
                on page load. It does NOT animate
                into the new page's position.
            */

            requestAnimationFrame(() => {

                requestAnimationFrame(() => {

                    setActive(
                        currentLink(),
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

                    setActive(
                        currentLink(),
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

                entries.forEach(
                    entry => {

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
                    }
                );

            },
            {
                threshold: .12,
                rootMargin:
                    "0px 0px -60px 0px"
            }
        );


    revealElements.forEach(
        element => {
            observer.observe(
                element
            );
        }
    );


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
       POINTER GLASS HIGHLIGHT
    ========================================= */

    function updateGlassPosition(
        element,
        event
    ) {

        const rect =
            element.getBoundingClientRect();

        const x =
            ((event.clientX -
                rect.left) /
                rect.width) *
            100;

        const y =
            ((event.clientY -
                rect.top) /
                rect.height) *
            100;

        element.style.setProperty(
            "--mx",
            `${x}%`
        );

        element.style.setProperty(
            "--my",
            `${y}%`
        );
    }


    document
        .querySelectorAll(
            ".nav-pages, .theme-pill"
        )
        .forEach(element => {

            element.addEventListener(
                "pointermove",
                event => {

                    if (
                        event.pointerType ===
                            "touch"
                    ) {
                        return;
                    }

                    updateGlassPosition(
                        element,
                        event
                    );
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
            `${currentX * 6}px ${currentY * 6}px`;

        requestAnimationFrame(
            animateBackground
        );
    }


    animateBackground();

})();