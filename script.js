const nav = document.querySelector("nav");
const navContainer = document.querySelector("nav > div");

const navLinks = [
    ...document.querySelectorAll("nav a")
];

const toggle =
    document.querySelector(".toggle");


/* ================================= */
/* CURRENT PAGE */
/* ================================= */

function getCurrentPage() {
    const page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    return page || "index.html";
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
        left:
            rect.left -
            container.left,

        width:
            rect.width
    };
}


function moveSlider(element) {

    if (!element) return;

    const position =
        getPosition(element);

    navContainer.style.setProperty(
        "--slider-left",
        `${position.left}px`
    );

    navContainer.style.setProperty(
        "--slider-width",
        `${position.width}px`
    );
}


/* ================================= */
/* INITIAL ACTIVE PAGE */
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
        moveSlider(activeLink);
    });
}


/* ================================= */
/* DRAGGING */
/* ================================= */

let isDragging = false;
let dragStartX = 0;
let draggedDistance = 0;
let dragTarget = null;


function findClosestLink(x) {

    let closest = null;
    let closestDistance = Infinity;

    navLinks.forEach(link => {

        const rect =
            link.getBoundingClientRect();

        const center =
            rect.left +
            rect.width / 2;

        const distance =
            Math.abs(x - center);

        if (distance < closestDistance) {

            closestDistance =
                distance;

            closest = link;
        }
    });

    return closest;
}


/*
    Make the slider follow the finger
    with a small elastic stretch.
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

    const targetCenter =
        targetRect.left +
        targetRect.width / 2;

    const difference =
        x - targetCenter;

    const stretch =
        Math.min(
            12,
            Math.abs(difference) * .25
        );

    let width =
        targetPosition.width +
        stretch;

    let left =
        targetPosition.left -
        stretch / 2;

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

        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {
            return;
        }

        isDragging = true;

        dragStartX =
            event.clientX;

        draggedDistance = 0;
        dragTarget = null;

        nav.classList.add("dragging");

        nav.setPointerCapture?.(
            event.pointerId
        );

        dragSlider(
            event.clientX
        );
    }
);


/* ================================= */
/* POINTER MOVE */
/* ================================= */

nav.addEventListener(
    "pointermove",
    event => {

        if (!isDragging) return;

        draggedDistance =
            Math.abs(
                event.clientX -
                dragStartX
            );

        dragSlider(
            event.clientX
        );
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

        nav.classList.remove(
            "dragging"
        );

        nav.releasePointerCapture?.(
            event.pointerId
        );

        if (!dragTarget) {

            moveSlider(activeLink);

            return;
        }

        activeLink = dragTarget;

        navLinks.forEach(link => {

            link.classList.toggle(
                "active",
                link === activeLink
            );
        });

        /*
            Smoothly snap to the selected item.
        */

        moveSlider(activeLink);

        /*
            iOS-like dock spring.
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
            Navigate after the slider has
            finished settling.
        */

        if (
            draggedDistance > 8
        ) {

            const href =
                activeLink.getAttribute(
                    "href"
                );

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
                Don't run normal click navigation
                after a drag.
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

            link.classList.add(
                "active"
            );

            activeLink = link;

            moveSlider(link);

            /*
                The bar stays exactly the same.
                Only the active pill moves.
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

        if (
            event.pointerType === "touch"
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


/* ================================= */
/* RESIZE */
/* ================================= */

window.addEventListener(
    "resize",
    () => {

        if (!activeLink) return;

        requestAnimationFrame(() => {
            moveSlider(activeLink);
        });
    }
);


/* ================================= */
/* PAGE SHOW */
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

        if (!current) return;

        navLinks.forEach(link => {

            link.classList.toggle(
                "active",
                link === current
            );
        });

        activeLink = current;

        requestAnimationFrame(() => {
            moveSlider(current);
        });
    }
);