(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        const body = document.body;

        const pageNav =
            document.getElementById("pageNav");

        const slider =
            document.getElementById("navSlider");

        const themeToggle =
            document.getElementById("themeToggle");

        const links = pageNav
            ? [...pageNav.querySelectorAll("a[data-page]")]
            : [];

        /* =====================================================
           THEME
        ===================================================== */

        const THEME_KEY = "shard-theme";

        function isLightTheme() {
            return (
                localStorage.getItem(THEME_KEY) ===
                "light"
            );
        }

        function applyTheme(light) {
            body.classList.toggle(
                "light",
                light
            );

            localStorage.setItem(
                THEME_KEY,
                light ? "light" : "dark"
            );
        }

        applyTheme(isLightTheme());

        function switchTheme() {
            if (!themeToggle) {
                return;
            }

            const nextLight =
                !body.classList.contains("light");

            const flash =
                document.createElement("div");

            flash.className =
                "theme-flash";

            flash.style.setProperty(
                "--flash-color",
                nextLight
                    ? "#f4f4f6"
                    : "#080708"
            );

            body.appendChild(flash);

            themeToggle.animate(
                [
                    {
                        transform:
                            "scale(1) rotate(0deg)"
                    },
                    {
                        transform:
                            "scale(.88) rotate(-7deg)"
                    },
                    {
                        transform:
                            "scale(1.06) rotate(5deg)"
                    },
                    {
                        transform:
                            "scale(1) rotate(0deg)"
                    }
                ],
                {
                    duration: 430,
                    easing:
                        "cubic-bezier(.22,1,.36,1)"
                }
            );

            /*
             * Change the actual theme shortly after
             * the transition begins. No huge circle,
             * no black screen and no clipped page.
             */
            window.setTimeout(() => {
                applyTheme(nextLight);
            }, 70);

            window.setTimeout(() => {
                flash.remove();
            }, 470);
        }

        if (themeToggle) {
            themeToggle.addEventListener(
                "click",
                switchTheme
            );
        }

        /* =====================================================
           CURRENT PAGE
        ===================================================== */

        function getCurrentPage() {
            let page =
                window.location.pathname
                    .split("/")
                    .pop()
                    .toLowerCase();

            if (!page) {
                page = "index.html";
            }

            return page;
        }

        function getCurrentIndex() {
            const current =
                getCurrentPage();

            const found =
                links.findIndex(link => {
                    return (
                        (
                            link.dataset.page ||
                            ""
                        ).toLowerCase() ===
                        current
                    );
                });

            return found >= 0
                ? found
                : 0;
        }

        /* =====================================================
           SLIDER GEOMETRY
        ===================================================== */

        let activeIndex =
            getCurrentIndex();

        function getSliderGeometry() {
            if (!pageNav) {
                return null;
            }

            const navRect =
                pageNav.getBoundingClientRect();

            const style =
                window.getComputedStyle(
                    pageNav
                );

            const paddingLeft =
                parseFloat(
                    style.paddingLeft
                ) || 0;

            const paddingRight =
                parseFloat(
                    style.paddingRight
                ) || 0;

            const innerWidth =
                navRect.width -
                paddingLeft -
                paddingRight;

            const cellWidth =
                innerWidth /
                links.length;

            return {
                cellWidth,
                left: paddingLeft,
                top:
                    parseFloat(
                        style.paddingTop
                    ) || 0
            };
        }

        /*
         * The slider is positioned using PIXELS, not
         * percentage transforms. This prevents it from
         * escaping the pill on different screen widths.
         */

        function setSliderPosition(
            index,
            options = {}
        ) {
            if (!pageNav || !slider) {
                return;
            }

            const {
                instant = false,
                dragX = 0,
                scale = 1
            } = options;

            const geometry =
                getSliderGeometry();

            if (!geometry) {
                return;
            }

            activeIndex =
                Math.max(
                    0,
                    Math.min(
                        index,
                        links.length - 1
                    )
                );

            const x =
                geometry.cellWidth *
                activeIndex;

            slider.style.width =
                `${geometry.cellWidth}px`;

            slider.style.height =
                `${Math.max(
                    0,
                    pageNav.clientHeight -
                        geometry.top * 2
                )}px`;

            slider.style.transform =
                `translate3d(${x + dragX}px, 0, 0) scaleX(${scale})`;

            slider.style.transition =
                instant
                    ? "none"
                    : "";

            links.forEach(
                (link, i) => {
                    link.classList.toggle(
                        "active",
                        i === activeIndex
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

        setSliderPosition(
            activeIndex,
            { instant: true }
        );

        /* =====================================================
           DRAG
        ===================================================== */

        let dragging = false;
        let pointerId = null;

        let dragStartX = 0;
        let dragLatestX = 0;

        let dragStartIndex = 0;
        let dragged = false;

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

        function beginDrag(event) {
            if (
                !pageNav ||
                links.length === 0
            ) {
                return;
            }

            /*
             * Mouse clicks should behave like normal
             * navigation. Touch and pen get dragging.
             */
            if (
                event.pointerType === "mouse"
            ) {
                return;
            }

            dragging = true;
            dragged = false;

            pointerId =
                event.pointerId;

            dragStartX =
                event.clientX;

            dragLatestX =
                event.clientX;

            dragStartIndex =
                activeIndex;

            pageNav.classList.add(
                "dragging"
            );

            pageNav.setPointerCapture(
                pointerId
            );
        }

        function moveDrag(event) {
            if (
                !dragging ||
                event.pointerId !== pointerId
            ) {
                return;
            }

            dragLatestX =
                event.clientX;

            const dx =
                dragLatestX -
                dragStartX;

            if (
                Math.abs(dx) > 6
            ) {
                dragged = true;
            }

            const geometry =
                getSliderGeometry();

            if (!geometry) {
                return;
            }

            const width =
                geometry.cellWidth;

            /*
             * Calculate the exact absolute slider
             * position rather than adding nested
             * percentage transforms.
             */
            const rawPosition =
                dragStartIndex * width +
                dx;

            const minPosition = 0;

            const maxPosition =
                width *
                (links.length - 1);

            /*
             * Small resistance when pulling past
             * either edge.
             */
            let position;

            if (
                rawPosition < minPosition
            ) {
                position =
                    minPosition +
                    (
                        rawPosition -
                        minPosition
                    ) *
                    0.25;
            } else if (
                rawPosition >
                maxPosition
            ) {
                position =
                    maxPosition +
                    (
                        rawPosition -
                        maxPosition
                    ) *
                    0.25;
            } else {
                position = rawPosition;
            }

            const safePosition =
                clamp(
                    position,
                    -width * 0.22,
                    maxPosition +
                        width * 0.22
                );

            /*
             * Keep the visual active state synchronized
             * while dragging.
             */
            let visualIndex =
                Math.round(
                    safePosition / width
                );

            visualIndex =
                clamp(
                    visualIndex,
                    0,
                    links.length - 1
                );

            links.forEach(
                (link, index) => {
                    link.classList.toggle(
                        "active",
                        index === visualIndex
                    );
                }
            );

            const scale =
                Math.abs(dx) > 5
                    ? 1.035
                    : 1;

            slider.style.transition =
                "none";

            slider.style.transform =
                `translate3d(${safePosition}px, 0, 0) scaleX(${scale})`;
        }

        function endDrag(event) {
            if (
                !dragging ||
                (
                    event &&
                    event.pointerId !==
                        pointerId
                )
            ) {
                return;
            }

            dragging = false;

            pageNav.classList.remove(
                "dragging"
            );

            const geometry =
                getSliderGeometry();

            if (!geometry) {
                pointerId = null;
                return;
            }

            const dx =
                dragLatestX -
                dragStartX;

            const width =
                geometry.cellWidth;

            let target =
                dragStartIndex;

            /*
             * A moderate swipe changes the tab.
             * Small movements snap back.
             */
            if (
                Math.abs(dx) >
                width * 0.22
            ) {
                target =
                    dragStartIndex +
                    (
                        dx > 0
                            ? 1
                            : -1
                    );
            } else {
                target =
                    Math.round(
                        (
                            dragStartIndex *
                                width +
                            dx
                        ) /
                        width
                    );
            }

            target =
                clamp(
                    target,
                    0,
                    links.length - 1
                );

            activeIndex = target;

            setSliderPosition(
                target,
                {
                    instant: false
                }
            );

            pointerId = null;

            if (
                dragged &&
                links[target]
            ) {
                const destination =
                    links[target].href;

                window.setTimeout(() => {
                    window.location.href =
                        destination;
                }, 250);
            }

            window.setTimeout(() => {
                dragged = false;
            }, 50);
        }

        if (pageNav) {
            pageNav.addEventListener(
                "pointerdown",
                beginDrag
            );

            pageNav.addEventListener(
                "pointermove",
                moveDrag
            );

            pageNav.addEventListener(
                "pointerup",
                endDrag
            );

            pageNav.addEventListener(
                "pointercancel",
                endDrag
            );
        }

        /* =====================================================
           CLICK NAVIGATION
        ===================================================== */

        links.forEach(
            (link, index) => {
                link.addEventListener(
                    "click",
                    event => {
                        /*
                         * A touch swipe creates a click after
                         * release in some browsers. Ignore it.
                         */
                        if (dragged) {
                            event.preventDefault();
                            return;
                        }

                        if (
                            index ===
                            activeIndex
                        ) {
                            event.preventDefault();
                            return;
                        }

                        event.preventDefault();

                        const destination =
                            link.href;

                        setSliderPosition(
                            index,
                            {
                                instant: false
                            }
                        );

                        window.setTimeout(() => {
                            window.location.href =
                                destination;
                        }, 250);
                    }
                );
            }
        );

        /* =====================================================
           RIPPLE
        ===================================================== */

        document
            .querySelectorAll(
                ".primary, .secondary"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    event => {
                        const rect =
                            button.getBoundingClientRect();

                        const ripple =
                            document.createElement(
                                "span"
                            );

                        ripple.className =
                            "ripple";

                        ripple.style.left =
                            `${
                                event.clientX -
                                rect.left
                            }px`;

                        ripple.style.top =
                            `${
                                event.clientY -
                                rect.top
                            }px`;

                        button.style.position =
                            "relative";

                        button.style.overflow =
                            "hidden";

                        button.appendChild(
                            ripple
                        );

                        window.setTimeout(() => {
                            ripple.remove();
                        }, 600);
                    }
                );
            });

        /* =====================================================
           SCROLL REVEALS
        ===================================================== */

        const revealItems =
            document.querySelectorAll(
                ".card, .footer"
            );

        if (
            "IntersectionObserver" in
            window
        ) {
            const observer =
                new IntersectionObserver(
                    entries => {
                        entries.forEach(
                            entry => {
                                if (
                                    entry.isIntersecting
                                ) {
                                    entry.target.classList.add(
                                        "reveal",
                                        "revealed"
                                    );

                                    observer.unobserve(
                                        entry.target
                                    );
                                }
                            }
                        );
                    },
                    {
                        threshold: 0.08
                    }
                );

            revealItems.forEach(
                item => {
                    item.classList.add(
                        "reveal"
                    );

                    observer.observe(
                        item
                    );
                }
            );
        } else {
            revealItems.forEach(
                item => {
                    item.classList.add(
                        "revealed"
                    );
                }
            );
        }

        /* =====================================================
           RESIZE
        ===================================================== */

        window.addEventListener(
            "resize",
            () => {
                setSliderPosition(
                    activeIndex,
                    {
                        instant: true
                    }
                );
            }
        );

        /* =====================================================
           PAGE SHOW / BACK BUTTON
        ===================================================== */

        window.addEventListener(
            "pageshow",
            () => {
                applyTheme(
                    isLightTheme()
                );

                activeIndex =
                    getCurrentIndex();

                setSliderPosition(
                    activeIndex,
                    {
                        instant: true
                    }
                );
            }
        );
    });
})();