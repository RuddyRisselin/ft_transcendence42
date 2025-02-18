const keysPressed: { [key: string]: boolean } = {};
let socket: WebSocket | null = null; // 🔗 WebSocket pour la communication

export function setupControls(paddle1: any, paddle2: any, canvasHeight: number, ws: WebSocket) {
    socket = ws; // Associer le WebSocket à la connexion

    document.addEventListener("keydown", (event) => {
        if (["ArrowUp", "ArrowDown", "z", "s"].includes(event.key)) {
            event.preventDefault();
            keysPressed[event.key] = true;
            sendMovement(event.key, true);
        }
    });

    document.addEventListener("keyup", (event) => {
        if (["ArrowUp", "ArrowDown", "z", "s"].includes(event.key)) {
            keysPressed[event.key] = false;
            sendMovement(event.key, false);
        }
    });

    function updatePaddlePosition() {
        requestAnimationFrame(updatePaddlePosition);
    }

    updatePaddlePosition();
}

// 🔹 Envoi des mouvements au serveur
function sendMovement(key: string, state: boolean) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "move", key, state }));
    }
}
