(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        const body = document.body;

        const pageNav = document.getElementById("pageNav");
        const slider = document.getElementById("navSlider");
        const themeToggle = document.getElementById("themeToggle");

        const links = pageNav
            ? [...pageNav.querySelectorAll("a[data-page]")]
            : [];

        /* =========================================
           THEME
        ========================================= */

        const THEME_KEY = "shard-theme";

        function savedTheme() {
            return localStorage.getItem(THEME_KEY) === "light";
        }

        function applyTheme(isLight) {
            body.classList.toggle("light", isLight);

            localStorage.setItem(
                THEME_KEY,
                isLight ? "light" : "dark"
            );
        }

        applyTheme(savedTheme());

        function switchTheme(event) {
            if (!themeToggle) return;

            const goingLight =
                !body.classList.contains("light");

            const rect =
                themeToggle.getBoundingClientRect();

            const x =
                event?.clientX ??
                rect.left + rect.width / 2;

            const y =
                event?.clientY ??
                rect.top + rect.height / 2;

            const overlay =
                document.createElement("div");

            overlay.className =
                "theme-transition";

            overlay.style.setProperty(
                "--transition-x",
                `${x}px`
            );

            overlay.style.setProperty(
                "--transition-y",
                `${y}px`
            );

            overlay.style.setProperty(
                "--transition-color",
                goingLight
                    ? "#f3f3f5"
                    : "#050506"
            );

            body.appendChild(overlay);

            themeToggle.animate(
                [
                    {
                        transform:
                            "scale(1) rotate(0deg)"
                    },
                    {
                        transform:
                            "scale(.82) rotate(-10deg)"
                    },
                    {
                        transform:
                            "scale(1.08) rotate(7deg)"
                    },
                    {
                        transform:
                            "scale(1) rotate(0deg)"
                    }
                ],
                {
                    duration: 560,
                    easing:
                        "cubic-bezier(.22,1,.36,1)"
                }
            );

            requestAnimationFrame(() => {
                applyTheme(goingLight);

                requestAnimationFrame(() => {
                    overlay.classList.add("active");
                });
            });

            window.setTimeout(() => {
                overlay.remove();
            }, 850);
        }

        if (themeToggle) {
            themeToggle.addEventListener(
                "click",
                switchTheme
            );
        }

        /* =========================================
           PAGE DETECTION
        ========================================= */

        function currentPage() {
            const pathname =
                window.location.pathname;

            let page =
                pathname
                    .split("/")
                    .pop()
                    .toLowerCase();

            if (!page) {
                page = "index.html";
            }

            return page;
        }

        function findCurrentIndex() {
            const page = currentPage();

            const index =
                links.findIndex(link => {
                    const linkPage =
                        link
                            .getAttribute("data-page")
                            ?.toLowerCase();

                    return linkPage === page;
                });

            return index >= 0 ? index : 0;
        }

        /* =========================================
           SLIDER
        ========================================= */

        let activeIndex =
            findCurrentIndex();

        function setSlider(
            index,
            instant = false
        ) {
            if (!slider || !pageNav) {
                return;
            }

            activeIndex = Math.max(
                0,
                Math.min(
                    index,
                    links.length - 1
                )
            );

            if (instant) {
                slider.style.transition =
                    "none";
            } else {
                slider.style.transition = "";
            }

            pageNav.style.setProperty(
                "--slider-position",
                activeIndex
            );

            pageNav.style.setProperty(
                "--drag-x",
                "0px"
            );

            pageNav.style.setProperty(
                "--slider-scale",
                "1"
            );

            links.forEach(
                (link, index) => {
                    link.classList.toggle(
                        "active",
                        index === activeIndex
                    );
                }
            );

            if (instant) {
                requestAnimationFrame(() => {
                    slider.style.transition =
                        "";
                });
            }
        }

        setSlider(
            activeIndex,
            true
        );

        /* =========================================
           TOUCH DRAG
        ========================================= */

        let dragging = false;
        let pointerId = null;
        let startX = 0;
        let startIndex = 0;
        let latestX = 0;
        let didDrag = false;

        function cellWidth() {
            if (!pageNav) return 1;

            const rect =
                pageNav.getBoundingClientRect();

            const computed =
                getComputedStyle(pageNav);

            const leftPadding =
                parseFloat(
                    computed.paddingLeft
                ) || 0;

            const rightPadding =
                parseFloat(
                    computed.paddingRight
                ) || 0;

            return (
                rect.width -
                leftPadding -
                rightPadding
            ) / links.length;
        }

        function clamp(
            value,
            min,
            max
        ) {
            return Math.max(
                min,
                Math.min(value, max)
            );
        }

        function updateDrag(x) {
            if (!pageNav || !slider) {
                return;
            }

            latestX = x;

            const dx =
                x - startX;

            if (Math.abs(dx) > 6) {
                didDrag = true;
            }

            const width =
                cellWidth();

            let movement =
                dx / width;

            let floatingIndex =
                startIndex + movement;

            floatingIndex =
                clamp(
                    floatingIndex,
                    -0.18,
                    links.length - 0.82
                );

            let visualIndex =
                Math.round(floatingIndex);

            visualIndex =
                clamp(
                    visualIndex,
                    0,
                    links.length - 1
                );

            const nearest =
                Math.round(
                    floatingIndex
                );

            const base =
                clamp(
                    nearest,
                    0,
                    links.length - 1
                );

            const remainder =
                dx -
                (base - startIndex) * width;

            const maxDrag =
                width * 0.95;

            const limited =
                clamp(
                    remainder,
                    -maxDrag,
                    maxDrag
                );

            pageNav.style.setProperty(
                "--slider-position",
                base
            );

            pageNav.style.setProperty(
                "--drag-x",
                `${limited}px`
            );

            pageNav.style.setProperty(
                "--slider-scale",
                "1.055"
            );

            links.forEach(
                (link, index) => {
                    link.classList.toggle(
                        "active",
                        index === visualIndex
                    );
                }
            );
        }

        function finishDrag() {
            if (!dragging) return;

            dragging = false;

            pageNav.classList.remove(
                "dragging"
            );

            const width =
                cellWidth();

            const totalDx =
                latestX - startX;

            let target =
                startIndex;

            if (
                Math.abs(totalDx) >
                width * 0.2
            ) {
                target =
                    startIndex +
                    (totalDx > 0 ? 1 : -1);
            }

            target =
                clamp(
                    target,
                    0,
                    links.length - 1
                );

            setSlider(
                target,
                false
            );

            if (
                didDrag &&
                links[target]
            ) {
                const href =
                    links[target].href;

                window.setTimeout(() => {
                    window.location.href =
                        href;
                }, 250);
            }

            pointerId = null;

            window.setTimeout(() => {
                didDrag = false;
            }, 40);
        }

        if (pageNav) {
            pageNav.addEventListener(
                "pointerdown",
                event => {
                    if (
                        event.pointerType ===
                        "mouse"
                    ) {
                        return;
                    }

                    dragging = true;
                    didDrag = false;

                    pointerId =
                        event.pointerId;

                    startX =
                        event.clientX;

                    latestX =
                        event.clientX;

                    startIndex =
                        activeIndex;

                    pageNav.classList.add(
                        "dragging"
                    );

                    pageNav.setPointerCapture(
                        pointerId
                    );
                }
            );

            pageNav.addEventListener(
                "pointermove",
                event => {
                    if (
                        !dragging ||
                        event.pointerId !==
                            pointerId
                    ) {
                        return;
                    }

                    updateDrag(
                        event.clientX
                    );
                }
            );

            pageNav.addEventListener(
                "pointerup",
                event => {
                    if (
                        event.pointerId !==
                        pointerId
                    ) {
                        return;
                    }

                    finishDrag();
                }
            );

            pageNav.addEventListener(
                "pointercancel",
                finishDrag
            );
        }

        /* =========================================
           CLICK NAVIGATION
        ========================================= */

        links.forEach((link, index) => {
            link.addEventListener(
                "click",
                event => {
                    if (didDrag) {
                        event.preventDefault();
                        return;
                    }

                    const destination =
                        link.href;

                    if (
                        index === activeIndex
                    ) {
                        event.preventDefault();
                        return;
                    }

                    event.preventDefault();

                    setSlider(
                        index,
                        false
                    );

                    window.setTimeout(() => {
                        window.location.href =
                            destination;
                    }, 250);
                }
            );
        });

        /* =========================================
           RESIZE
        ========================================= */

        window.addEventListener(
            "resize",
            () => {
                setSlider(
                    activeIndex,
                    true
                );
            }
        );

        /* =========================================
           BFCACHE / PAGE RETURN
        ========================================= */

        window.addEventListener(
            "pageshow",
            () => {
                applyTheme(savedTheme());

                setSlider(
                    findCurrentIndex(),
                    true
                );
            }
        );
    });
})();