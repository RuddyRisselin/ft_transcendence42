export default function StarsBackground(): HTMLElement {
    const starsContainer = document.createElement("div");
    starsContainer.className = "absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0";

    for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.className = "absolute bg-white rounded-full opacity-75 animate-twinkle";
        const size = Math.random() * 3 + "px";
        star.style.width = size;
        star.style.height = size;
        star.style.top = Math.random() * 100 + "vh";
        star.style.left = Math.random() * 100 + "vw";
        star.style.animationDuration = Math.random() * 3 + 2 + "s";
        starsContainer.appendChild(star);
    }

    return starsContainer;
}
