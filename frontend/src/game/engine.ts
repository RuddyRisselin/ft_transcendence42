import { ball, paddle1, paddle2, canvasWidth, canvasHeight, getScores, incrementScore, resetBall } from "./objects";
import { increaseBallSpeed } from "./objects";

let socket: WebSocket | null = null;

export function startGame(canvas: HTMLCanvasElement, ws: WebSocket) {
    socket = ws; // Associer le WebSocket à la connexion
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

        requestAnimationFrame(updateGame);
    }

    updateGame();
}

export function setupWebSocket(ws: WebSocket) {
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("📥 Mise à jour reçue :", message);

        if (message.type === "update") {
            ball.x = message.ball.x;
            ball.y = message.ball.y;

            for (const userId in message.players) {
                if (userId === localStorage.getItem("userId")) {
                    paddle1.y = message.players[userId].y;
                } else {
                    paddle2.y = message.players[userId].y;
                }
            }
        }
    };
}


