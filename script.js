const toggle = document.querySelector(".toggle");

toggle.addEventListener("click", () => {
    document.body.classList.toggle("light");

    toggle.textContent =
        document.body.classList.contains("light")
            ? "Dark"
            : "Theme";
});


/* Scroll reveal animations */

const revealElements = document.querySelectorAll(
    ".card, .footer"
);

const observer = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px"
    }
);

revealElements.forEach((element) => {
    observer.observe(element);
});


/* Subtle mouse movement for the glass background */

let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

window.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
});

function animateBackground() {
    currentX += (mouseX - currentX) * 0.025;
    currentY += (mouseY - currentY) * 0.025;

    document.body.style.setProperty(
        "--mouse-x",
        `${currentX * 20}px`
    );

    document.body.style.setProperty(
        "--mouse-y",
        `${currentY * 20}px`
    );

    requestAnimationFrame(animateBackground);
}

animateBackground();


/* Button ripple effect */

document.querySelectorAll(".buttons a").forEach((button) => {
    button.addEventListener("click", function (event) {
        const ripple = document.createElement("span");

        const rect = this.getBoundingClientRect();

        const size = Math.max(
            rect.width,
            rect.height
        );

        ripple.style.position = "absolute";
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${
            event.clientX - rect.left - size / 2
        }px`;
        ripple.style.top = `${
            event.clientY - rect.top - size / 2
        }px`;

        ripple.style.borderRadius = "50%";
        ripple.style.background =
            "rgba(255,255,255,0.25)";
        ripple.style.transform = "scale(0)";
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
                duration: 600,
                easing: "cubic-bezier(.22,1,.36,1)"
            }
        );

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 650);
    });
});