const nav = document.querySelector("nav");
const navContainer = document.querySelector("nav > div");
const navLinks = [...document.querySelectorAll("nav a")];
const toggle = document.querySelector(".toggle");


/* ================================= */
/* FIND CURRENT PAGE */
/* ================================= */

function getCurrentPage() {
    const page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    if (!page || page === "index.html") {
        return "index.html";
    }

    return page;
}


/* ================================= */
/* SLIDER POSITION */
/* ================================= */

function getPosition(element) {
    const container =
        navContainer.getBoundingClientRect();

    const rect =
        element.getBoundingClientRect();

    return {
        left: rect.left - container.left,
        width: rect.width
    };
}


function moveSlider(element, animated = true) {
    if (!element) return;

    const position = getPosition(element);

    navContainer.style.setProperty(
        "--slider-left",
        `${position.left}px`
    );

    navContainer.style.setProperty(
        "--slider-width",
        `${position.width}px`
    );

    if (!animated) {
        navContainer.style.setProperty(
            "--slider-duration",
            "0s"
        );
    }
}


/* ================================= */
/* INITIAL ACTIVE TAB */
/* ================================= */

let activeLink =
    navLinks.find(link => {

        const href =
            link.getAttribute("href");

        return href === getCurrentPage();

    }) || navLinks[0];


if (activeLink) {
    activeLink.classList.add("active");

    requestAnimationFrame(() => {
        moveSlider(activeLink, false);
    });
}


/* ================================= */
/* DRAGGING */
/* ================================= */

let isDragging = false;
let dragStartX = 0;
let currentDragX = 0;
let draggedDistance = 0;
let dragTarget = null;


function findClosestLink(x) {

    let closest = null;
    let closestDistance = Infinity;

    navLinks.forEach(link => {

        const rect =
            link.getBoundingClientRect();

        const center =
            rect.left + rect.width / 2;

        const distance =
            Math.abs(x - center);

        if (distance < closestDistance) {
            closestDistance = distance;
            closest = link;
        }
    });

    return closest;
}


/*
    Move the pill toward the finger.

    Instead of jumping directly to another
    link, interpolate its position so it
    stretches/squishes naturally.
*/

function dragSlider(x) {

    const target =
        findClosestLink(x);

    if (!target) return;

    dragTarget = target;

    const targetPosition =
        getPosition(target);

    const container =
        navContainer.getBoundingClientRect();

    const targetRect =
        target.getBoundingClientRect();

    /*
        Calculate how far the finger is from
        the target center.
    */

    const targetCenter =
        targetRect.left +
        targetRect.width / 2;

    const difference =
        x - targetCenter;

    /*
        Small elastic stretch while dragging.
    */

    const stretch =
        Math.min(
            12,
            Math.abs(difference) * .25
        );

    let width =
        targetPosition.width + stretch;

    let left =
        targetPosition.left -
        stretch / 2;

    /*
        Keep the pill inside the navigation.
    */

    const maxLeft =
        container.width - width;

    left =
        Math.max(
            0,
            Math.min(left, maxLeft)
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
        Update text state while dragging.
    */

    navLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link === target
        );
    });
}


/* ================================= */
/* POINTER DOWN */
/* ================================= */

nav.addEventListener(
    "pointerdown",
    event => {

        /*
            Ignore secondary mouse buttons.
        */

        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {
            return;
        }

        isDragging = true;

        dragStartX = event.clientX;
        currentDragX = event.clientX;

        draggedDistance = 0;
        dragTarget = null;

        nav.classList.add("dragging");

        nav.setPointerCapture?.(
            event.pointerId
        );

        /*
            Move immediately toward the touched
            part of the bar.
        */

        dragSlider(event.clientX);
    }
);


/* ================================= */
/* POINTER MOVE */
/* ================================= */

nav.addEventListener(
    "pointermove",
    event => {

        if (!isDragging) return;

        currentDragX = event.clientX;

        draggedDistance =
            Math.abs(
                currentDragX -
                dragStartX
            );

        dragSlider(currentDragX);
    }
);


/* ================================= */
/* POINTER UP */
/* ================================= */

nav.addEventListener(
    "pointerup",
    event => {

        if (!isDragging) return;

        isDragging = false;

        nav.classList.remove("dragging");

        nav.releasePointerCapture?.(
            event.pointerId
        );

        if (!dragTarget) {
            moveSlider(activeLink);
            return;
        }

        const target = dragTarget;

        navLinks.forEach(link => {
            link.classList.remove("active");
        });

        target.classList.add("active");

        activeLink = target;

        /*
            Snap smoothly into place.
        */

        moveSlider(target);


        /*
            Small iOS-like spring.
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


        /*
            Navigate only when the user actually
            dragged to another page.
        */

        if (
            draggedDistance > 8
        ) {

            const href =
                target.getAttribute("href");

            if (
                href &&
                !href.startsWith("#") &&
                !href.startsWith("http") &&
                href !== getCurrentPage()
            ) {

                document.body.classList.add(
                    "page-leaving"
                );

                setTimeout(() => {
                    window.location.href =
                        href;
                }, 430);
            }
        }
    }
);


/* ================================= */
/* NORMAL CLICK NAVIGATION */
/* ================================= */

navLinks.forEach(link => {

    link.addEventListener(
        "click",
        event => {

            /*
                Drag navigation handles its own
                navigation.
            */

            if (
                draggedDistance > 8
            ) {
                event.preventDefault();
                return;
            }

            const href =
                link.getAttribute("href");

            if (!href) return;

            if (
                href.startsWith("http") ||
                href.startsWith("#")
            ) {
                return;
            }

            if (
                href === getCurrentPage()
            ) {
                event.preventDefault();
                return;
            }

            event.preventDefault();

            navLinks.forEach(item => {
                item.classList.remove(
                    "active"
                );
            });

            link.classList.add("active");

            activeLink = link;

            moveSlider(link);

            document.body.classList.add(
                "page-leaving"
            );

            /*
                The bar remains completely identical
                during the transition. Only the pill
                moves.
            */

            setTimeout(() => {
                window.location.href =
                    href;
            }, 430);
        }
    );
});


/* ================================= */
/* THEME */
/* ================================= */

if (toggle) {

    toggle.addEventListener(
        "click",
        event => {

            event.preventDefault();

            document.body.classList.toggle(
                "light"
            );

            toggle.textContent =
                document.body.classList.contains(
                    "light"
                )
                    ? "Dark"
                    : "Theme";
        }
    );
}


/* ================================= */
/* SCROLL REVEAL */
/* ================================= */

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


/* ================================= */
/* BUTTON RIPPLE */
/* ================================= */

document
    .querySelectorAll(".buttons a")
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
                    "rgba(255,255,255,.28)";

                ripple.style.pointerEvents =
                    "none";

                button.appendChild(ripple);

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
                    () => ripple.remove(),
                    700
                );
            }
        );
    });


/* ================================= */
/* BACKGROUND PARALLAX */
/* ================================= */

let mouseX = 0;
let mouseY = 0;

let currentX = 0;
let currentY = 0;

window.addEventListener(
    "pointermove",
    event => {

        if (event.pointerType === "touch") {
            return;
        }

        mouseX =
            (event.clientX /
                window.innerWidth -
                .5) * 2;

        mouseY =
            (event.clientY /
                window.innerHeight -
                .5) * 2;
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


/* ================================= */
/* RESIZE */
/* ================================= */

window.addEventListener(
    "resize",
    () => {

        if (!activeLink) return;

        requestAnimationFrame(() => {
            moveSlider(
                activeLink,
                false
            );
        });
    }
);


/* ================================= */
/* PAGE ENTER */
/* ================================= */

window.addEventListener(
    "pageshow",
    () => {

        document.body.classList.remove(
            "page-leaving"
        );

        const current =
            navLinks.find(
                link =>
                    link.getAttribute("href") ===
                    getCurrentPage()
            );

        if (current) {

            navLinks.forEach(link => {
                link.classList.remove(
                    "active"
                );
            });

            current.classList.add(
                "active"
            );

            activeLink = current;

            requestAnimationFrame(() => {
                moveSlider(
                    current,
                    false
                );
            });
        }
    }
);