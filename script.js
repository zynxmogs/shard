const nav = document.querySelector("nav");
const navContainer = document.querySelector("nav > div");

const navLinks = [
    ...document.querySelectorAll("nav a")
];

const toggle = document.querySelector(".toggle");


/* ================================= */
/* IOS-STYLE SLIDER */
/* ================================= */

let activeLink =
    document.querySelector("nav a.active") ||
    navLinks[0];

let pointerDown = false;
let dragged = false;
let startX = 0;


/*
    Get the position of a link relative
    to the navigation container.
*/

function getLinkPosition(link) {
    const container =
        navContainer.getBoundingClientRect();

    const rect =
        link.getBoundingClientRect();

    return {
        left: rect.left - container.left,
        width: rect.width
    };
}


/*
    Move the glass pill.
*/

function moveSlider(
    link,
    animate = true,
    stretch = false
) {
    if (!link) return;

    const position =
        getLinkPosition(link);

    navContainer.style.setProperty(
        "--slider-left",
        `${position.left}px`
    );

    navContainer.style.setProperty(
        "--slider-width",
        `${position.width}px`
    );

    if (!animate) {
        navContainer.style.setProperty(
            "--slider-duration",
            "0s"
        );
    }

    if (stretch) {
        nav.classList.add("dragging");
    } else {
        nav.classList.remove("dragging");
    }
}


/*
    Set active tab.
*/

function setActive(link) {
    navLinks.forEach(item => {
        item.classList.remove("active");
    });

    link.classList.add("active");

    activeLink = link;

    moveSlider(link);
}


/* Initial position */

if (activeLink) {
    requestAnimationFrame(() => {
        moveSlider(activeLink, false);
    });
}


/* ================================= */
/* POINTER / TOUCH INTERACTION */
/* ================================= */

navLinks.forEach(link => {

    link.addEventListener(
        "pointerdown",
        event => {

            pointerDown = true;
            dragged = false;

            startX = event.clientX;

            link.setPointerCapture?.(
                event.pointerId
            );

            nav.classList.add("dragging");

            /*
                Immediately move the pill toward
                the touched item.
            */

            moveSlider(link, true, true);

            navLinks.forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");
        }
    );


    link.addEventListener(
        "pointermove",
        event => {

            if (!pointerDown) return;

            if (
                Math.abs(event.clientX - startX) > 6
            ) {
                dragged = true;
            }
        }
    );


    link.addEventListener(
        "pointerup",
        event => {

            if (!pointerDown) return;

            pointerDown = false;

            nav.classList.remove("dragging");

            activeLink = link;

            moveSlider(link, true, false);

            /*
                Give the pill a tiny spring-like
                settling effect.
            */

            link.animate(
                [
                    {
                        transform: "scale(.96)"
                    },
                    {
                        transform: "scale(1.04)"
                    },
                    {
                        transform: "scale(1)"
                    }
                ],
                {
                    duration: 300,
                    easing: "cubic-bezier(.22,1,.36,1)"
                }
            );
        }
    );
});


/* ================================= */
/* NAVIGATION TRANSITION */
/* ================================= */

navLinks.forEach(link => {

    link.addEventListener("click", event => {

        const href =
            link.getAttribute("href");

        if (!href) return;

        /*
            Let external links behave normally.
        */

        if (
            href.startsWith("http") ||
            href.startsWith("#") ||
            href.startsWith("mailto:")
        ) {
            return;
        }

        /*
            Don't navigate if this was a drag.
        */

        if (dragged) {
            event.preventDefault();
            dragged = false;
            return;
        }

        event.preventDefault();

        setActive(link);

        /*
            The important fix:
            the slider gets time to complete
            its movement before the document
            changes.
        */

        document.body.classList.add(
            "page-leaving"
        );

        setTimeout(() => {
            window.location.href = href;
        }, 430);
    });
});


/* ================================= */
/* THEME BUTTON */
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

                if (!entry.isIntersecting)
                    return;

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
/* BACKGROUND MOUSE PARALLAX */
/* ================================= */

let mouseX = 0;
let mouseY = 0;

let currentX = 0;
let currentY = 0;

window.addEventListener(
    "pointermove",
    event => {

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
/* REALIGN SLIDER */
/* ================================= */

window.addEventListener(
    "resize",
    () => {

        if (!activeLink) return;

        moveSlider(
            activeLink,
            false
        );
    }
);


/* ================================= */
/* PAGE ENTER ANIMATION */
/* ================================= */

window.addEventListener(
    "pageshow",
    () => {

        document.body.classList.remove(
            "page-leaving"
        );

        if (activeLink) {
            requestAnimationFrame(() => {
                moveSlider(
                    activeLink,
                    false
                );
            });
        }
    }
);