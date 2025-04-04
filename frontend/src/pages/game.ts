import Layout from "../components/layout";
import { startGame } from "../game/engine";
import { setupControls } from "../game/controls";
import { paddle1, paddle2, canvasHeight } from "../game/objects";
import { translateText } from "../translate";

export default function Game() {
    const container: HTMLDivElement = document.createElement("div");
    container.className = "flex flex-col items-center justify-center min-h-screen p-4 text-center";

    const title: HTMLHeadingElement = document.createElement("h1");
    title.className = "text-3xl font-bold mb-4";
    translateText("Mode Pong").then((translated) => {
        title.innerHTML = "🏓 " + translated;
    })
    const gameCanvas: HTMLCanvasElement = document.createElement("canvas");
    gameCanvas.width = 1000;
    gameCanvas.height = 500;
    gameCanvas.className = "border-4 border-white";

    container.appendChild(title);
    container.appendChild(gameCanvas);

    setTimeout(() => {
        startGame(gameCanvas);
        setupControls(paddle1, paddle2, gameCanvas.height);
    }, 100);

    return Layout(container);
}