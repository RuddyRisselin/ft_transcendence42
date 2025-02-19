import { ball, paddle1, paddle2, canvasWidth, canvasHeight, resetBall } from "./objects";
import { increaseBallSpeed } from "./objects";

let gameInterval: number | null = null; // ✅ Stocker l'intervalle du jeu pour éviter les doubles exécutions

export function startGame(canvas: HTMLCanvasElement, onScore?: (scorer: "left" | "right") => void) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ✅ Assurer qu'aucune autre instance du jeu ne tourne
    if (gameInterval !== null) {
        cancelAnimationFrame(gameInterval);
        gameInterval = null;
    }

    resetGame(); // ✅ Réinitialiser le jeu à chaque nouvelle partie

    function updateGame() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ✅ Dessiner les raquettes
        ctx.fillStyle = "white";
        ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
        ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);

        // ✅ Dessiner la balle
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // ✅ Déplacer la balle
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        // ✅ Collision avec le haut et bas du canvas
        if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
            ball.speedY *= -1;
        }

        // ✅ Collision avec les raquettes
        if (
            ball.x - ball.radius <= paddle1.x + paddle1.width &&
            ball.y >= paddle1.y &&
            ball.y <= paddle1.y + paddle1.height
        ) {
            ball.speedX *= -1;
            ball.x = paddle1.x + paddle1.width + ball.radius;
            increaseBallSpeed();
        }

        if (
            ball.x + ball.radius >= paddle2.x &&
            ball.y >= paddle2.y &&
            ball.y <= paddle2.y + paddle2.height
        ) {
            ball.speedX *= -1;
            ball.x = paddle2.x - ball.radius;
            increaseBallSpeed();
        }

        // ✅ Vérifier si un joueur marque un point
        if (ball.x + ball.radius <= 0) {
            if (onScore) onScore("right");
            resetBall();
        }

        if (ball.x - ball.radius >= canvas.width) {
            if (onScore) onScore("left");
            resetBall();
        }

        gameInterval = requestAnimationFrame(updateGame);
    }

    updateGame();
}

// ✅ Fonction pour remettre le jeu à zéro
export function resetGame() {
    ball.x = canvasWidth / 2;
    ball.y = canvasHeight / 2;
    ball.speedX = 4; // ✅ Remettre une vitesse normale
    ball.speedY = 4;

    paddle1.y = canvasHeight / 2 - paddle1.height / 2;
    paddle2.y = canvasHeight / 2 - paddle2.height / 2;

    paddle1.speed = 5;
    paddle2.speed = 5;
}

// ✅ Fonction pour arrêter proprement le jeu lorsqu'on quitte la page
export function stopGame() {
    if (gameInterval !== null) {
        cancelAnimationFrame(gameInterval);
        gameInterval = null;
    }
}
