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

        const THEME_KEY = "shard-theme";

        /* =====================================================
           THEME
        ===================================================== */

        function isLight() {
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

        applyTheme(isLight());

        function switchTheme(event) {
            if (!themeToggle) return;

            const nextLight =
                !body.classList.contains("light");

            const rect =
                themeToggle.getBoundingClientRect();

            const x =
                event?.clientX ??
                rect.left + rect.width / 2;

            const y =
                event?.clientY ??
                rect.top + rect.height / 2;

            const flash =
                document.createElement("div");

            flash.className =
                "theme-flash";

            flash.style.setProperty(
                "--theme-x",
                `${x}px`
            );

            flash.style.setProperty(
                "--theme-y",
                `${y}px`
            );

            flash.style.setProperty(
                "--theme-color",
                nextLight
                    ? "#202023"
                    : "#09090b"
            );

            body.appendChild(flash);

            themeToggle.animate(
                [
                    {
                        transform:
                            "scale(1) rotate(0)"
                    },
                    {
                        transform:
                            "scale(.88) rotate(-7deg)"
                    },
                    {
                        transform:
                            "scale(1.07) rotate(6deg)"
                    },
                    {
                        transform:
                            "scale(1) rotate(0)"
                    }
                ],
                {
                    duration: 440,
                    easing:
                        "cubic-bezier(.22,1,.36,1)"
                }
            );

            window.setTimeout(() => {
                applyTheme(nextLight);
            }, 65);

            window.setTimeout(() => {
                flash.remove();
            }, 460);
        }

        if (themeToggle) {
            themeToggle.addEventListener(
                "click",
                switchTheme
            );
        }

        /* =====================================================
           PAGE DETECTION
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

            const index =
                links.findIndex(link => {
                    return (
                        (
                            link.dataset.page ||
                            ""
                        ).toLowerCase() ===
                        current
                    );
                });

            return index >= 0
                ? index
                : 0;
        }

        /* =====================================================
           SLIDER GEOMETRY
        ===================================================== */

        let activeIndex =
            getCurrentIndex();

        function getGeometry() {
            if (!pageNav || !links.length) {
                return null;
            }

            const style =
                getComputedStyle(pageNav);

            const paddingLeft =
                parseFloat(
                    style.paddingLeft
                ) || 0;

            const paddingRight =
                parseFloat(
                    style.paddingRight
                ) || 0;

            const innerWidth =
                pageNav.clientWidth -
                paddingLeft -
                paddingRight;

            const cellWidth =
                innerWidth /
                links.length;

            return {
                cellWidth,
                paddingLeft,
                paddingTop:
                    parseFloat(
                        style.paddingTop
                    ) || 0
            };
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

        function updateLinks(index) {
            links.forEach(
                (link, i) => {
                    link.classList.toggle(
                        "active",
                        i === index
                    );
                }
            );
        }

        function positionSlider(
            index,
            instant = false
        ) {
            if (
                !pageNav ||
                !slider ||
                !links.length
            ) {
                return;
            }

            const geometry =
                getGeometry();

            if (!geometry) return;

            activeIndex =
                clamp(
                    index,
                    0,
                    links.length - 1
                );

            slider.style.width =
                `${geometry.cellWidth}px`;

            slider.style.height =
                `${pageNav.clientHeight - 10}px`;

            slider.style.left =
                `${geometry.paddingLeft}px`;

            slider.style.top =
                `${geometry.paddingTop}px`;

            slider.style.setProperty(
                "--slider-x",
                `${
                    geometry.cellWidth *
                    activeIndex
                }px`
            );

            slider.style.setProperty(
                "--slider-scale-x",
                "1"
            );

            slider.style.setProperty(
                "--slider-scale-y",
                "1"
            );

            slider.style.setProperty(
                "--slider-tilt",
                "0deg"
            );

            slider.style.setProperty(
                "--gloss-x",
                "50%"
            );

            slider.style.transition =
                instant
                    ? "none"
                    : "";

            updateLinks(activeIndex);

            if (instant) {
                requestAnimationFrame(() => {
                    slider.style.transition =
                        "";
                });
            }
        }

        positionSlider(
            activeIndex,
            true
        );

        /* =====================================================
           DRAG STATE
        ===================================================== */

        let dragging = false;
        let pointerId = null;

        let startX = 0;
        let latestX = 0;

        let startIndex = 0;

        let didDrag = false;
        let lastMoveTime = 0;
        let lastMoveX = 0;
        let velocity = 0;

        /* =====================================================
           DRAG START
        ===================================================== */

        function onPointerDown(event) {
            if (
                !pageNav ||
                event.pointerType === "mouse"
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

            lastMoveX =
                event.clientX;

            lastMoveTime =
                performance.now();

            velocity = 0;

            pageNav.classList.add(
                "dragging"
            );

            slider.style.transition =
                "none";

            pageNav.setPointerCapture(
                pointerId
            );
        }

        /* =====================================================
           DRAG MOVE
        ===================================================== */

        function onPointerMove(event) {
            if (
                !dragging ||
                event.pointerId !== pointerId
            ) {
                return;
            }

            const now =
                performance.now();

            const x =
                event.clientX;

            latestX = x;

            const dx =
                x - startX;

            if (
                Math.abs(dx) > 6
            ) {
                didDrag = true;
            }

            const dt =
                Math.max(
                    1,
                    now - lastMoveTime
                );

            velocity =
                (x - lastMoveX) /
                dt;

            lastMoveX = x;
            lastMoveTime = now;

            const geometry =
                getGeometry();

            if (!geometry) return;

            const width =
                geometry.cellWidth;

            const rawPosition =
                startIndex * width +
                dx;

            const maxPosition =
                width *
                (links.length - 1);

            let position =
                rawPosition;

            /*
             * Elastic resistance at the
             * beginning and end.
             */
            if (position < 0) {
                position *= 0.24;
            }

            if (
                position >
                maxPosition
            ) {
                position =
                    maxPosition +
                    (
                        position -
                        maxPosition
                    ) *
                    0.24;
            }

            position =
                clamp(
                    position,
                    -width * 0.25,
                    maxPosition +
                        width * 0.25
                );

            const nearestIndex =
                clamp(
                    Math.round(
                        position / width
                    ),
                    0,
                    links.length - 1
                );

            /*
             * Stronger stretch while dragging.
             */
            const velocityStretch =
                clamp(
                    Math.abs(velocity) *
                        0.15,
                    0,
                    0.08
                );

            const dragStretch =
                clamp(
                    Math.abs(dx) /
                        width *
                        0.045,
                    0,
                    0.055
                );

            const scaleX =
                1 +
                velocityStretch +
                dragStretch;

            const scaleY =
                1 -
                clamp(
                    (scaleX - 1) * 0.7,
                    0,
                    0.075
                );

            /*
             * Slight tilt gives the slider
             * a softer liquid-body feel.
             */
            const tilt =
                clamp(
                    velocity * 0.55,
                    -3.5,
                    3.5
                );

            const gloss =
                clamp(
                    50 +
                    velocity * 7,
                    15,
                    85
                );

            slider.style.width =
                `${width}px`;

            slider.style.height =
                `${pageNav.clientHeight - 10}px`;

            slider.style.left =
                `${geometry.paddingLeft}px`;

            slider.style.top =
                `${geometry.paddingTop}px`;

            slider.style.setProperty(
                "--slider-x",
                `${position}px`
            );

            slider.style.setProperty(
                "--slider-scale-x",
                scaleX
            );

            slider.style.setProperty(
                "--slider-scale-y",
                scaleY
            );

            slider.style.setProperty(
                "--slider-tilt",
                `${tilt}deg`
            );

            slider.style.setProperty(
                "--gloss-x",
                `${gloss}%`
            );

            updateLinks(
                nearestIndex
            );
        }

        /* =====================================================
           DRAG END
        ===================================================== */

        function onPointerUp(event) {
            if (
                !dragging ||
                (
                    event &&
                    event.pointerId !== pointerId
                )
            ) {
                return;
            }

            dragging = false;

            pageNav.classList.remove(
                "dragging"
            );

            const geometry =
                getGeometry();

            if (!geometry) {
                pointerId = null;
                return;
            }

            const dx =
                latestX - startX;

            const width =
                geometry.cellWidth;

            let target =
                startIndex;

            /*
             * Release momentum counts slightly.
             */
            const momentum =
                velocity * 125;

            const projected =
                dx +
                momentum;

            if (
                Math.abs(projected) >
                width * 0.2
            ) {
                target =
                    startIndex +
                    (
                        projected > 0
                            ? 1
                            : -1
                    );
            } else {
                target =
                    Math.round(
                        (
                            startIndex *
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

            /*
             * Reset all liquid deformation and
             * let the slider spring into place.
             */
            slider.style.transition =
                "transform 620ms cubic-bezier(.16,1.35,.25,1)";

            slider.style.setProperty(
                "--slider-x",
                `${
                    width * target
                }px`
            );

            slider.style.setProperty(
                "--slider-scale-x",
                "1"
            );

            slider.style.setProperty(
                "--slider-scale-y",
                "1"
            );

            slider.style.setProperty(
                "--slider-tilt",
                "0deg"
            );

            slider.style.setProperty(
                "--gloss-x",
                "50%"
            );

            updateLinks(target);

            const shouldNavigate =
                didDrag &&
                target !== startIndex &&
                links[target];

            activeIndex =
                target;

            pointerId = null;

            if (shouldNavigate) {
                const destination =
                    links[target].href;

                window.setTimeout(() => {
                    window.location.href =
                        destination;
                }, 260);
            }

            window.setTimeout(() => {
                didDrag = false;
            }, 60);
        }

        if (pageNav) {
            pageNav.addEventListener(
                "pointerdown",
                onPointerDown
            );

            pageNav.addEventListener(
                "pointermove",
                onPointerMove
            );

            pageNav.addEventListener(
                "pointerup",
                onPointerUp
            );

            pageNav.addEventListener(
                "pointercancel",
                onPointerUp
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
                        if (didDrag) {
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

                        positionSlider(
                            index,
                            false
                        );

                        activeIndex =
                            index;

                        const destination =
                            link.href;

                        window.setTimeout(() => {
                            window.location.href =
                                destination;
                        }, 260);
                    }
                );
            }
        );

        /* =====================================================
           NAV HOVER GLASS RESPONSE
        ===================================================== */

        if (pageNav) {
            pageNav.addEventListener(
                "pointermove",
                event => {
                    if (
                        dragging ||
                        event.pointerType !==
                            "mouse"
                    ) {
                        return;
                    }

                    const rect =
                        pageNav.getBoundingClientRect();

                    const x =
                        (
                            (event.clientX -
                                rect.left) /
                            rect.width
                        ) * 100;

                    pageNav.style.setProperty(
                        "--mouse-x",
                        `${x}%`
                    );
                },
                { passive: true }
            );
        }

        /* =====================================================
           BUTTON RIPPLES
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
                        "reveal",
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
                positionSlider(
                    activeIndex,
                    true
                );
            }
        );

        /* =====================================================
           BACK / FORWARD CACHE
        ===================================================== */

        window.addEventListener(
            "pageshow",
            () => {
                applyTheme(
                    isLight()
                );

                activeIndex =
                    getCurrentIndex();

                positionSlider(
                    activeIndex,
                    true
                );
            }
        );
    });
})();