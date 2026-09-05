(() => {
    "use strict";


    /* =========================================
       SVG LIQUID DISTORTION
    ========================================= */

    const distortion =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

    distortion.setAttribute(
        "width",
        "0"
    );

    distortion.setAttribute(
        "height",
        "0"
    );

    distortion.style.position =
        "absolute";

    distortion.style.pointerEvents =
        "none";

    distortion.innerHTML = `
        <defs>
            <filter
                id="shard-liquid"
                x="-20%"
                y="-30%"
                width="140%"
                height="160%"
                color-interpolation-filters="sRGB"
            >
                <feTurbulence
                    type="fractalNoise"
                    baseFrequency=".018 .028"
                    numOctaves="2"
                    seed="7"
                    result="noise"
                />

                <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="6"
                    xChannelSelector="R"
                    yChannelSelector="G"
                />

                <feGaussianBlur
                    stdDeviation=".08"
                />
            </filter>
        </defs>
    `;

    document.body.appendChild(
        distortion
    );


    /* =========================================
       ELEMENTS
    ========================================= */

    const nav =
        document.querySelector(
            "nav"
        );

    const navPages =
        document.querySelector(
            ".nav-pages"
        );

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

    const THEME_KEY =
        "shard-theme";


    function getTheme() {

        try {

            const stored =
                localStorage.getItem(
                    THEME_KEY
                );

            if (
                stored === "light" ||
                stored === "dark"
            ) {
                return stored;
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
        getTheme()
    );


    async function changeTheme(
        event
    ) {

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


        if (themeButton) {

            themeButton.classList.remove(
                "switching"
            );

            void themeButton.offsetWidth;

            themeButton.classList.add(
                "switching"
            );
        }


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


        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                overlay.classList.add(
                    "animating"
                );

            });
        });


        /*
            Change the page underneath the
            expanding transition.
        */

        setTimeout(() => {

            applyTheme(next);

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

                changeTheme(
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
        getCurrentLink();


    function getLinkIndex(
        link
    ) {

        return navLinks.indexOf(
            link
        );
    }


    function setSliderIndex(
        index,
        immediate = false
    ) {

        if (!navPages) {
            return;
        }

        if (immediate) {

            navPages.classList.add(
                "slider-static"
            );
        }

        navPages.style.setProperty(
            "--slider-index",
            index
        );

        if (immediate) {

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

        const index =
            getLinkIndex(
                link
            );

        if (index >= 0) {

            setSliderIndex(
                index,
                !animated
            );
        }
    }


    function initializeSlider() {

        const current =
            getCurrentLink();

        setActive(
            current,
            false
        );
    }


    if (
        document.fonts &&
        document.fonts.ready
    ) {

        document.fonts.ready.then(
            () => {

                requestAnimationFrame(
                    initializeSlider
                );

            }
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
       LIQUID DRAG
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
        -1;


    function getPageIndexFromX(
        x
    ) {

        if (!navPages) {
            return 0;
        }

        const rect =
            navPages.getBoundingClientRect();

        const padding =
            5;

        const usableWidth =
            rect.width -
            padding * 2;

        const cellWidth =
            usableWidth /
            navLinks.length;

        let relative =
            x -
            rect.left -
            padding;

        relative =
            Math.max(
                0,
                Math.min(
                    relative,
                    usableWidth -
                    0.01
                )
            );

        let index =
            Math.floor(
                relative /
                cellWidth
            );

        index =
            Math.max(
                0,
                Math.min(
                    index,
                    navLinks.length - 1
                )
            );

        return index;
    }


    function getCellRect(
        index
    ) {

        if (!navPages) {
            return null;
        }

        const rect =
            navPages.getBoundingClientRect();

        const padding =
            5;

        const usableWidth =
            rect.width -
            padding * 2;

        const width =
            usableWidth /
            navLinks.length;

        return {
            left:
                rect.left +
                padding +
                index * width,

            top:
                rect.top +
                padding,

            width:
                width,

            height:
                rect.height -
                padding * 2
        };
    }


    function dragSlider(
        x
    ) {

        if (!navPages) {
            return;
        }

        const index =
            getPageIndexFromX(
                x
            );

        dragIndex =
            index;

        /*
            The pill and the cells now use
            the exact same geometry, so the
            text and slider cannot drift apart.
        */

        const cell =
            getCellRect(
                index
            );

        if (!cell) {
            return;
        }

        const navRect =
            navPages.getBoundingClientRect();

        /*
            Follow the pointer continuously
            inside the current/nearest cell.
        */

        const cellCenter =
            cell.left +
            cell.width / 2;

        const distance =
            x -
            cellCenter;

        const elastic =
            Math.min(
                7,
                Math.abs(distance) * .08
            );

        let left =
            cell.left -
            navRect.left -
            elastic / 2;

        const width =
            cell.width +
            elastic;

        navPages.style.setProperty(
            "--slider-index",
            index
        );

        /*
            Switch from index-based placement
            to direct pixel placement while dragging.
        */

        navPages.style.setProperty(
            "--slider-drag-x",
            `${left}px`
        );

        navPages.style.setProperty(
            "--slider-drag-width",
            `${width}px`
        );

        navPages.style.setProperty(
            "--slider-scale-x",
            "1.035"
        );

        navPages.style.setProperty(
            "--slider-scale-y",
            ".91"
        );


        /*
            Temporary direct-position mode.
        */

        navPages.classList.add(
            "slider-direct"
        );


        navLinks.forEach(
            (link, i) => {

                link.classList.toggle(
                    "active",
                    i === index
                );
            }
        );
    }


    if (navPages) {

        /*
            Dynamically add the direct drag
            positioning rule once.
        */

        const directStyle =
            document.createElement(
                "style"
            );

        directStyle.textContent = `
            .nav-pages.slider-direct::before {
                left:
                    var(--slider-drag-x)
                    !important;

                width:
                    var(--slider-drag-width)
                    !important;

                transition:
                    left .025s linear,
                    width .025s linear,
                    transform .12s linear,
                    border-radius .12s linear,
                    filter .12s linear;
            }
        `;

        document.head.appendChild(
            directStyle
        );


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
                    getPageIndexFromX(
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

                if (
                    Math.abs(
                        event.clientX -
                        startX
                    ) > 6
                ) {
                    moved =
                        true;
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


            const index =
                Math.max(
                    0,
                    Math.min(
                        dragIndex,
                        navLinks.length - 1
                    )
                );

            const selected =
                navLinks[index];


            navPages.classList.remove(
                "slider-direct"
            );


            if (selected) {

                setActive(
                    selected,
                    true
                );
            }


            if (
                moved &&
                selected
            ) {

                const href =
                    selected.getAttribute(
                        "href"
                    );

                const destination =
                    normalizeHref(
                        href
                    );

                if (
                    href &&
                    destination !==
                        currentPage()
                ) {

                    document.body.classList.add(
                        "page-leaving"
                    );

                    setTimeout(
                        () => {

                            window.location.href =
                                href;

                        },
                        430
                    );
                }
            }


            moved =
                false;

            dragIndex =
                -1;
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
       NAVIGATION
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


                    document.body.classList.add(
                        "page-leaving"
                    );


                    setTimeout(
                        () => {

                            window.location.href =
                                href;

                        },
                        430
                    );
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

            document.body.classList.remove(
                "page-leaving"
            );

            applyTheme(
                getTheme()
            );


            /*
                Recalculate after the browser,
                font rendering and layout have
                settled. No nav entrance animation.
            */

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

    let resizeTimer =
        null;

    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );

            resizeTimer =
                setTimeout(
                    () => {

                        setActive(
                            getCurrentLink(),
                            false
                        );

                    },
                    80
                );
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
        .forEach(
            button => {

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

                                    opacity:
                                        .75
                                },
                                {
                                    transform:
                                        "scale(2)",

                                    opacity:
                                        0
                                }
                            ],
                            {
                                duration:
                                    600,

                                easing:
                                    "cubic-bezier(.22,1,.36,1)"
                            }
                        );

                        setTimeout(
                            () => {
                                ripple.remove();
                            },
                            650
                        );
                    }
                );
            }
        );


    /* =========================================
       GLASS POINTER RESPONSE
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
                                (
                                    event.clientX -
                                    rect.left
                                ) /
                                rect.width
                            ) * 100;

                        const y =
                            (
                                (
                                    event.clientY -
                                    rect.top
                                ) /
                                rect.height
                            ) * 100;

                        element.style.setProperty(
                            "--glass-x",
                            `${x}%`
                        );

                        element.style.setProperty(
                            "--glass-y",
                            `${y}%`
                        );

                        element.style.setProperty(
                            "--theme-x",
                            `${x}%`
                        );

                        element.style.setProperty(
                            "--theme-y",
                            `${y}%`
                        );
                    }
                );
            }
        );


    /* =========================================
       BACKGROUND PARALLAX
    ========================================= */

    let targetX =
        0;

    let targetY =
        0;

    let currentX =
        0;

    let currentY =
        0;


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
            (
                targetX -
                currentX
            ) * .018;

        currentY +=
            (
                targetY -
                currentY
            ) * .018;

        document.body.style.backgroundPosition =
            `${currentX * 6}px ${currentY * 6}px`;

        requestAnimationFrame(
            animateBackground
        );
    }


    animateBackground();

})();