import { ball, paddle1, paddle2, canvasWidth, canvasHeight, getScores, incrementScore, resetBall } from "./objects";
import { increaseBallSpeed } from "./objects";


export function startGame(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");

    function updateGame() {
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 🎯 Récupérer les scores actuels
        const { score1, score2 } = getScores();

        // ✅ Affichage des scores
        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.fillText(score1.toString(), canvas.width / 4, 50);
        ctx.fillText(score2.toString(), (canvas.width * 3) / 4, 50);

        // ✅ Dessiner les raquettes
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
            incrementScore(2); // Joueur 2 marque
            resetBall();
        }

        if (ball.x - ball.radius >= canvas.width) {
            incrementScore(1); // Joueur 1 marque
            resetBall();
        }

        requestAnimationFrame(updateGame);
    }

    updateGame();
}
