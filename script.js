const nav = document.querySelector("nav");
const navLinks = document.querySelectorAll("nav a");
const navContainer = document.querySelector("nav > div");
const toggle = document.querySelector(".toggle");


/* -------------------------------- */
/* BOTTOM NAV SLIDER */
/* -------------------------------- */

function updateSlider(element) {
    if (!element || !navContainer) return;

    const containerRect = navContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const left =
        elementRect.left -
        containerRect.left;

    navContainer.style.setProperty(
        "--slider-left",
        `${left}px`
    );

    navContainer.style.setProperty(
        "--slider-width",
        `${elementRect.width}px`
    );
}

function setActiveLink(element) {
    navLinks.forEach(link => {
        link.classList.remove("active");
    });

    element.classList.add("active");

    updateSlider(element);
}


/* Automatically activate first link */

if (navLinks.length > 0) {
    setActiveLink(navLinks[0]);
}


/* Move slider when clicking */

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        setActiveLink(link);
    });
});


/* Keep slider aligned when screen changes */

window.addEventListener("resize", () => {
    const active = document.querySelector("nav a.active");

    if (active) {
        updateSlider(active);
    }
});


/* -------------------------------- */
/* THEME */
/* -------------------------------- */

toggle.addEventListener("click", () => {
    document.body.classList.toggle("light");

    toggle.textContent =
        document.body.classList.contains("light")
            ? "Dark"
            : "Theme";
});


/* -------------------------------- */
/* SCROLL REVEAL */
/* -------------------------------- */

const revealElements = document.querySelectorAll(
    ".card, .footer"
);

const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");

                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px"
    }
);

revealElements.forEach(element => {
    observer.observe(element);
});


/* -------------------------------- */
/* BUTTON RIPPLE */
/* -------------------------------- */

document
    .querySelectorAll(".buttons a")
    .forEach(button => {

        button.addEventListener("click", function (event) {

            const rect = this.getBoundingClientRect();

            const size = Math.max(
                rect.width,
                rect.height
            );

            const ripple =
                document.createElement("span");

            ripple.style.position = "absolute";
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;

            ripple.style.left =
                `${event.clientX - rect.left - size / 2}px`;

            ripple.style.top =
                `${event.clientY - rect.top - size / 2}px`;

            ripple.style.borderRadius = "50%";

            ripple.style.background =
                "rgba(255,255,255,0.28)";

            ripple.style.pointerEvents = "none";

            ripple.animate(
                [
                    {
                        transform: "scale(0)",
                        opacity: 0.8
                    },
                    {
                        transform: "scale(2)",
                        opacity: 0
                    }
                ],
                {
                    duration: 650,
                    easing: "cubic-bezier(.22,1,.36,1)"
                }
            );

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 700);
        });
    });


/* -------------------------------- */
/* SUBTLE BACKGROUND MOUSE MOVEMENT */
/* -------------------------------- */

let mouseX = 0;
let mouseY = 0;

let currentX = 0;
let currentY = 0;

window.addEventListener("mousemove", event => {
    mouseX =
        (event.clientX / window.innerWidth - 0.5) * 2;

    mouseY =
        (event.clientY / window.innerHeight - 0.5) * 2;
});

function animateBackground() {
    currentX +=
        (mouseX - currentX) * 0.025;

    currentY +=
        (mouseY - currentY) * 0.025;

    document.body.style.backgroundPosition =
        `${currentX * 8}px ${currentY * 8}px`;

    requestAnimationFrame(animateBackground);
}

animateBackground();


/* -------------------------------- */
/* INITIAL SLIDER ALIGNMENT */
/* -------------------------------- */

window.addEventListener("load", () => {
    const active =
        document.querySelector("nav a.active");

    if (active) {
        updateSlider(active);
    }
});