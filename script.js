(() => {
    "use strict";

    const THEME_KEY = "shard-theme";

    const navPages =
        document.querySelector(".nav-pages");

    const navIndicator =
        document.querySelector(".nav-indicator");

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

    function getTheme() {

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


    function applyTheme(theme) {

        document.body.classList.toggle(
            "light",
            theme === "light"
        );
    }


    applyTheme(
        getTheme()
    );


    function switchTheme(event) {

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


        const overlay =
            document.createElement(
                "div"
            );

        overlay.className =
            "theme-transition";

        overlay.classList.toggle(
            "light",
            next === "light"
        );

        overlay.style.setProperty(
            "--theme-x",
            `${x}px`
        );

        overlay.style.setProperty(
            "--theme-y",
            `${y}px`
        );


        document.body.appendChild(
            overlay
        );


        if (themeButton) {

            themeButton.animate(
                [
                    {
                        transform:
                            "scale(1) rotate(0deg)"
                    },
                    {
                        transform:
                            "scale(.8) rotate(-12deg)"
                    },
                    {
                        transform:
                            "scale(1.06) rotate(12deg)"
                    },
                    {
                        transform:
                            "scale(1) rotate(0deg)"
                    }
                ],
                {
                    duration: 560,
                    easing:
                        "cubic-bezier(.16,1.28,.34,1)"
                }
            );
        }


        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                overlay.classList.add(
                    "animating"
                );

            });
        });


        setTimeout(() => {

            applyTheme(
                next
            );

        }, 250);


        setTimeout(() => {

            overlay.remove();

        }, 850);
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
            href.startsWith(
                "http://"
            ) ||
            href.startsWith(
                "https://"
            ) ||
            href.startsWith(
                "//"
            ) ||
            href.startsWith(
                "#"
            )
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
       IOS SPRING SLIDER
    ========================================= */

    let activeLink =
        getCurrentLink();

    let activeIndex =
        Math.max(
            0,
            navLinks.indexOf(
                activeLink
            )
        );


    function setIndex(
        index,
        spring = true
    ) {

        if (
            !navPages ||
            !navIndicator
        ) {
            return;
        }


        activeIndex =
            Math.max(
                0,
                Math.min(
                    index,
                    navLinks.length - 1
                )
            );


        navPages.style.setProperty(
            "--nav-index",
            activeIndex
        );

        navPages.style.setProperty(
            "--drag-offset",
            "0px"
        );

        navPages.style.setProperty(
            "--indicator-scale-x",
            "1"
        );

        navPages.style.setProperty(
            "--indicator-scale-y",
            "1"
        );


        if (!spring) {
            navIndicator.style.transition =
                "none";

            navIndicator.offsetWidth;

            requestAnimationFrame(() => {

                navIndicator.style.transition =
                    "";
            });
        }
    }


    function setActive(
        link,
        spring = true
    ) {

        if (!link) {
            return;
        }

        navLinks.forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item === link
                );
            }
        );

        activeLink =
            link;

        setIndex(
            navLinks.indexOf(
                link
            ),
            spring
        );
    }


    setActive(
        activeLink,
        false
    );


    /* =========================================
       DRAGGING
    ========================================= */

    let dragging =
        false;

    let pointerId =
        null;

    let startX =
        0;

    let moved =
        false;

    let dragIndex =
        activeIndex;


    function getNavBounds() {

        if (!navPages) {
            return null;
        }

        const rect =
            navPages.getBoundingClientRect();

        const padding =
            window.innerWidth <= 600
                ? 4
                : 5;

        const width =
            rect.width -
            padding * 2;

        const cellWidth =
            width /
            navLinks.length;

        return {
            rect,
            padding,
            width,
            cellWidth
        };
    }


    function pointerToIndex(
        x
    ) {

        const bounds =
            getNavBounds();

        if (!bounds) {
            return 0;
        }

        let position =
            x -
            bounds.rect.left -
            bounds.padding;

        position =
            Math.max(
                0,
                Math.min(
                    position,
                    bounds.width -
                    0.01
                )
            );

        return Math.max(
            0,
            Math.min(
                Math.floor(
                    position /
                    bounds.cellWidth
                ),
                navLinks.length - 1
            )
        );
    }


    function updateDrag(
        x
    ) {

        const bounds =
            getNavBounds();

        if (!bounds || !navIndicator) {
            return;
        }


        /*
            Work in the exact same grid
            used by the three links.
        */

        const position =
            x -
            bounds.rect.left -
            bounds.padding;

        const selectedIndex =
            pointerToIndex(
                x
            );

        dragIndex =
            selectedIndex;


        /*
            Position continuously inside
            the selected cell.
        */

        let cellStart =
            selectedIndex *
            bounds.cellWidth;

        let cellCenter =
            cellStart +
            bounds.cellWidth / 2;

        let pointerInCell =
            position -
            cellStart;

        let offset =
            pointerInCell -
            bounds.cellWidth / 2;


        /*
            Limit the elastic movement.
        */

        offset =
            Math.max(
                -bounds.cellWidth * .22,
                Math.min(
                    offset,
                    bounds.cellWidth * .22
                )
            );


        navPages.style.setProperty(
            "--nav-index",
            selectedIndex
        );

        navPages.style.setProperty(
            "--drag-offset",
            `${offset}px`
        );

        navPages.style.setProperty(
            "--indicator-scale-x",
            String(
                1 +
                Math.min(
                    .035,
                    Math.abs(offset) /
                    bounds.cellWidth *
                    .055
                )
            )
        );

        navPages.style.setProperty(
            "--indicator-scale-y",
            ".91"
        );


        navLinks.forEach(
            (link, index) => {

                link.classList.toggle(
                    "active",
                    index ===
                        selectedIndex
                );
            }
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


                dragging =
                    true;

                moved =
                    false;

                pointerId =
                    event.pointerId;

                startX =
                    event.clientX;

                dragIndex =
                    pointerToIndex(
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
                    moved =
                        true;
                }

                updateDrag(
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


            dragging =
                false;

            navPages.classList.remove(
                "dragging"
            );


            navPages.releasePointerCapture?.(
                event.pointerId
            );


            pointerId =
                null;


            const selected =
                navLinks[
                    Math.max(
                        0,
                        Math.min(
                            dragIndex,
                            navLinks.length - 1
                        )
                    )
                ];


            navPages.style.setProperty(
                "--drag-offset",
                "0px"
            );

            navPages.style.setProperty(
                "--indicator-scale-x",
                "1"
            );

            navPages.style.setProperty(
                "--indicator-scale-y",
                "1"
            );


            setActive(
                selected,
                true
            );


            if (
                moved &&
                selected
            ) {

                const href =
                    selected.getAttribute(
                        "href"
                    );

                if (
                    href &&
                    normalizeHref(
                        href
                    ) !==
                        currentPage()
                ) {

                    /*
                        Navigate without fading the
                        current page to black.
                    */

                    setTimeout(() => {

                        window.location.href =
                            href;

                    }, 260);
                }
            }


            dragIndex =
                activeIndex;


            setTimeout(() => {
                moved = false;
            }, 50);
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

    navLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    if (moved) {

                        event.preventDefault();

                        moved =
                            false;

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
                        href.startsWith(
                            "//"
                        ) ||
                        href.startsWith(
                            "#"
                        )
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
                        No page-out animation.
                        The new page's entrance animation
                        handles the transition cleanly.
                    */

                    setTimeout(() => {

                        window.location.href =
                            href;

                    }, 260);
                }
            );
        }
    );


    /* =========================================
       PAGE SHOW
    ========================================= */

    window.addEventListener(
        "pageshow",
        () => {

            const current =
                getCurrentLink();

            setActive(
                current,
                false
            );

            applyTheme(
                getTheme()
            );
        }
    );


    /* =========================================
       RESIZE
    ========================================= */

    let resizeTimer =
        null;

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
       GLASS TOUCH / POINTER RESPONSE
    ========================================= */

    document
        .querySelectorAll(
            ".nav-pages, .theme-pill"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "pointermove",
                    event => {

                        if (
                            event.pointerType ===
                                "touch"
                        ) {
                            return;
                        }

                        const rect =
                            element.getBoundingClientRect();

                        const x =
                            (
                                event.clientX -
                                rect.left
                            ) /
                            rect.width *
                            100;

                        const y =
                            (
                                event.clientY -
                                rect.top
                            ) /
                            rect.height *
                            100;

                        element.style.setProperty(
                            "--glass-x",
                            `${x}%`
                        );

                        element.style.setProperty(
                            "--glass-y",
                            `${y}%`
                        );
                    }
                );
            }
        );

})();