(() => {
    "use strict";


    /* =========================================
       ELEMENTS
    ========================================= */

    const nav =
        document.querySelector("nav");

    const navContainer =
        document.querySelector("nav > div");

    const navLinks = [
        ...document.querySelectorAll(
            "nav a"
        )
    ];

    const toggle =
        document.querySelector(
            "nav .toggle"
        );


    /* =========================================
       THEME
    ========================================= */

    const THEME_KEY =
        "shard-theme";


    function applyTheme(theme) {

        const isLight =
            theme === "light";

        document.body.classList.toggle(
            "light",
            isLight
        );

        if (toggle) {
            toggle.textContent =
                isLight
                    ? "Dark"
                    : "Theme";
        }
    }


    function loadTheme() {

        const savedTheme =
            localStorage.getItem(
                THEME_KEY
            );

        applyTheme(
            savedTheme === "light"
                ? "light"
                : "dark"
        );
    }


    function toggleTheme() {

        const isLight =
            document.body.classList.contains(
                "light"
            );

        const newTheme =
            isLight
                ? "dark"
                : "light";

        localStorage.setItem(
            THEME_KEY,
            newTheme
        );

        applyTheme(newTheme);
    }


    /*
        Apply saved theme immediately.
    */

    loadTheme();


    if (toggle) {

        toggle.addEventListener(
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

    function getCurrentPage() {

        let page =
            window.location.pathname
                .split("/")
                .filter(Boolean)
                .pop();

        if (!page) {
            return "index.html";
        }

        page =
            page.toLowerCase();

        /*
            Treat the root page as index.html.
        */

        if (
            page === "/" ||
            page === ""
        ) {
            return "index.html";
        }

        return page;
    }


    /* =========================================
       LINK MATCHING
    ========================================= */

    function normalizePage(href) {

        if (!href) {
            return "";
        }

        /*
            Ignore external URLs.
        */

        if (
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("//")
        ) {
            return href;
        }

        /*
            Remove query strings / hashes.
        */

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

        return href
            .split("/")
            .filter(Boolean)
            .pop()
            .toLowerCase();
    }


    function findCurrentLink() {

        const currentPage =
            getCurrentPage();

        return (
            navLinks.find(link => {

                const href =
                    normalizePage(
                        link.getAttribute(
                            "href"
                        )
                    );

                return href === currentPage;
            })
            || navLinks[0]
        );
    }


    /* =========================================
       SLIDER GEOMETRY
    ========================================= */

    let activeLink =
        findCurrentLink();


    function getSliderPosition(
        element
    ) {

        if (
            !element ||
            !navContainer
        ) {
            return null;
        }

        const navRect =
            navContainer.getBoundingClientRect();

        const linkRect =
            element.getBoundingClientRect();

        return {
            left:
                linkRect.left -
                navRect.left,

            width:
                linkRect.width
        };
    }


    function setSlider(
        element,
        animate = true
    ) {

        if (!element) {
            return;
        }

        const position =
            getSliderPosition(
                element
            );

        if (!position) {
            return;
        }

        if (!animate) {

            /*
                Temporarily disable CSS transition.
            */

            navContainer.classList.add(
                "slider-no-transition"
            );
        }

        navContainer.style.setProperty(
            "--slider-left",
            `${position.left}px`
        );

        navContainer.style.setProperty(
            "--slider-width",
            `${position.width}px`
        );

        if (!animate) {

            /*
                Force layout before restoring
                transitions.
            */

            navContainer.offsetWidth;

            navContainer.classList.remove(
                "slider-no-transition"
            );
        }
    }


    /*
        CSS helper for instant placement.
    */

    const sliderStyle =
        document.createElement("style");

    sliderStyle.textContent = `
        nav > div.slider-no-transition::before {
            transition: none !important;
        }
    `;

    document.head.appendChild(
        sliderStyle
    );


    /* =========================================
       ACTIVE LINK
    ========================================= */

    function setActiveLink(
        link,
        animate = true
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

        activeLink = link;

        setSlider(
            activeLink,
            animate
        );
    }


    /* =========================================
       INITIAL POSITION
    ========================================= */

    function initializeSlider() {

        const current =
            findCurrentLink();

        setActiveLink(
            current,
            false
        );
    }


    /*
        Do this after fonts and layout are ready.
    */

    if (
        document.fonts &&
        document.fonts.ready
    ) {

        document.fonts.ready.then(() => {

            requestAnimationFrame(
                initializeSlider
            );
        });

    } else {

        requestAnimationFrame(
            initializeSlider
        );
    }


    /* =========================================
       DRAG STATE
    ========================================= */

    let isDragging = false;

    let dragStartX = 0;

    let draggedDistance = 0;

    let dragTarget = null;

    let dragPointerId = null;


    /* =========================================
       CLOSEST TAB
    ========================================= */

    function findClosestLink(x) {

        let closest = null;
        let closestDistance =
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
                closestDistance
            ) {
                closestDistance =
                    distance;

                closest = link;
            }
        });

        return closest;
    }


    /* =========================================
       DRAG SLIDER
    ========================================= */

    function updateDrag(
        pointerX
    ) {

        if (!navContainer) {
            return;
        }

        const target =
            findClosestLink(
                pointerX
            );

        if (!target) {
            return;
        }

        dragTarget = target;

        const navRect =
            navContainer.getBoundingClientRect();

        const targetRect =
            target.getBoundingClientRect();

        const targetLeft =
            targetRect.left -
            navRect.left;

        const targetWidth =
            targetRect.width;

        const targetCenter =
            targetRect.left +
            targetRect.width / 2;

        /*
            Distance of finger from
            target center.
        */

        const difference =
            pointerX -
            targetCenter;

        /*
            Stretch based on distance.
        */

        const stretch =
            Math.min(
                14,
                Math.abs(difference) * .22
            );

        let width =
            targetWidth +
            stretch;

        let left =
            targetLeft -
            stretch / 2;

        /*
            Keep the pill inside the dock.
        */

        left =
            Math.max(
                0,
                Math.min(
                    left,
                    navRect.width -
                    width
                )
            );

        navContainer.style.setProperty(
            "--slider-left",
            `${left}px`
        );

        navContainer.style.setProperty(
            "--slider-width",
            `${width}px`
        );

        /*
            Text follows the finger too.
        */

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

    if (nav) {

        nav.addEventListener(
            "pointerdown",
            event => {

                /*
                    Only use left mouse button.
                */

                if (
                    event.pointerType ===
                        "mouse" &&
                    event.button !== 0
                ) {
                    return;
                }

                isDragging = true;

                dragPointerId =
                    event.pointerId;

                dragStartX =
                    event.clientX;

                draggedDistance = 0;

                dragTarget =
                    findClosestLink(
                        event.clientX
                    );

                nav.classList.add(
                    "dragging"
                );

                nav.setPointerCapture?.(
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

        nav.addEventListener(
            "pointermove",
            event => {

                if (
                    !isDragging ||
                    event.pointerId !==
                        dragPointerId
                ) {
                    return;
                }

                draggedDistance =
                    Math.abs(
                        event.clientX -
                        dragStartX
                    );

                updateDrag(
                    event.clientX
                );
            }
        );


        /* =====================================
           POINTER END
        ===================================== */

        function finishDrag(event) {

            if (
                !isDragging ||
                event.pointerId !==
                    dragPointerId
            ) {
                return;
            }

            isDragging = false;

            nav.classList.remove(
                "dragging"
            );

            nav.releasePointerCapture?.(
                event.pointerId
            );

            dragPointerId = null;


            /*
                Nothing useful selected.
            */

            if (!dragTarget) {

                setSlider(
                    activeLink,
                    true
                );

                return;
            }


            const selected =
                dragTarget;

            activeLink =
                selected;


            navLinks.forEach(link => {

                link.classList.toggle(
                    "active",
                    link === selected
                );
            });


            /*
                Snap the pill into its
                exact position.
            */

            setSlider(
                selected,
                true
            );


            /*
                Small spring effect on the dock.
            */

            nav.animate(
                [
                    {
                        transform:
                            "translateX(-50%) scale(1)"
                    },
                    {
                        transform:
                            "translateX(-50%) scale(.985)"
                    },
                    {
                        transform:
                            "translateX(-50%) scale(1)"
                    }
                ],
                {
                    duration: 260,
                    easing:
                        "cubic-bezier(.22,1,.36,1)"
                }
            );
        }


        nav.addEventListener(
            "pointerup",
            finishDrag
        );

        nav.addEventListener(
            "pointercancel",
            finishDrag
        );
    }


    /* =========================================
       NAVIGATION
    ========================================= */

    navLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                /*
                    If user dragged, don't allow
                    the browser's click event to
                    navigate a second time.
                */

                if (
                    draggedDistance > 8
                ) {

                    event.preventDefault();

                    draggedDistance = 0;

                    return;
                }


                const href =
                    link.getAttribute(
                        "href"
                    );

                if (!href) {
                    return;
                }


                /*
                    External links remain normal links.
                */

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
                    normalizePage(
                        href
                    );


                /*
                    Already on this page.
                */

                if (
                    destination ===
                    getCurrentPage()
                ) {

                    event.preventDefault();

                    setActiveLink(
                        link,
                        true
                    );

                    return;
                }


                event.preventDefault();


                /*
                    Move the pill first.
                */

                setActiveLink(
                    link,
                    true
                );


                /*
                    Then fade the page out.
                */

                document.body.classList.add(
                    "page-leaving"
                );


                /*
                    The nav itself remains visible
                    and completes its animation before
                    navigation.
                */

                setTimeout(() => {

                    window.location.href =
                        href;

                }, 430);
            }
        );
    });


    /* =========================================
       DRAG -> NAVIGATION
    ========================================= */

    /*
        Navigation after a genuine drag.
        Delay slightly so the snap animation
        remains visible.
    */

    nav?.addEventListener(
        "pointerup",
        () => {

            if (
                !dragTarget ||
                draggedDistance <= 8
            ) {
                return;
            }

            const target =
                dragTarget;

            const href =
                target.getAttribute(
                    "href"
                );

            draggedDistance = 0;

            if (!href) {
                return;
            }

            if (
                href.startsWith("http") ||
                href.startsWith("#")
            ) {
                return;
            }

            if (
                normalizePage(href) ===
                getCurrentPage()
            ) {
                return;
            }

            document.body.classList.add(
                "page-leaving"
            );

            setTimeout(() => {

                window.location.href =
                    href;

            }, 430);
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
                        findCurrentLink();

                    setActiveLink(
                        current,
                        false
                    );

                }, 80);
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

            loadTheme();

            const current =
                findCurrentLink();

            setActiveLink(
                current,
                false
            );

            /*
                One more alignment after the
                browser has finished painting.
            */

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {

                    setSlider(
                        current,
                        false
                    );

                });
            });
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

                    ripple.style.position =
                        "absolute";

                    ripple.style.width =
                        `${size}px`;

                    ripple.style.height =
                        `${size}px`;

                    ripple.style.left =
                        `${
                            event.clientX -
                            rect.left -
                            size / 2
                        }px`;

                    ripple.style.top =
                        `${
                            event.clientY -
                            rect.top -
                            size / 2
                        }px`;

                    ripple.style.borderRadius =
                        "50%";

                    ripple.style.background =
                        "rgba(255,255,255,.3)";

                    ripple.style.pointerEvents =
                        "none";

                    button.appendChild(
                        ripple
                    );

                    ripple.animate(
                        [
                            {
                                transform:
                                    "scale(0)",
                                opacity: .8
                            },
                            {
                                transform:
                                    "scale(2)",
                                opacity: 0
                            }
                        ],
                        {
                            duration: 650,
                            easing:
                                "cubic-bezier(.22,1,.36,1)"
                        }
                    );

                    setTimeout(
                        () => {
                            ripple.remove();
                        },
                        700
                    );
                }
            );
        });


    /* =========================================
       BACKGROUND PARALLAX
    ========================================= */

    let mouseX = 0;
    let mouseY = 0;

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

            mouseX =
                (
                    event.clientX /
                    window.innerWidth -
                    .5
                ) * 2;

            mouseY =
                (
                    event.clientY /
                    window.innerHeight -
                    .5
                ) * 2;
        }
    );


    function animateBackground() {

        currentX +=
            (mouseX - currentX) * .025;

        currentY +=
            (mouseY - currentY) * .025;

        document.body.style.backgroundPosition =
            `${currentX * 8}px ${currentY * 8}px`;

        requestAnimationFrame(
            animateBackground
        );
    }

    animateBackground();

})();