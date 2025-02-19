const keysPressed: { [key: string]: boolean } = {};

// ✅ Gestion des événements clavier
function handleKeyDown(event: KeyboardEvent) {
    if (["ArrowUp", "ArrowDown", "z", "s"].includes(event.key)) {
        keysPressed[event.key] = true;
    }
}

function handleKeyUp(event: KeyboardEvent) {
    if (["ArrowUp", "ArrowDown", "z", "s"].includes(event.key)) {
        keysPressed[event.key] = false;
    }
}

// ✅ Fonction pour activer les contrôles
export function setupControls(paddle1: any, paddle2: any, canvasHeight: number) {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    function updatePaddlePosition() {
        if (keysPressed["z"] && paddle1.y > 0) {
            paddle1.y -= paddle1.speed;
        }
        if (keysPressed["s"] && paddle1.y + paddle1.height < canvasHeight) {
            paddle1.y += paddle1.speed;
        }
        if (keysPressed["ArrowUp"] && paddle2.y > 0) {
            paddle2.y -= paddle2.speed;
        }
        if (keysPressed["ArrowDown"] && paddle2.y + paddle2.height < canvasHeight) {
            paddle2.y += paddle2.speed;
        }

        requestAnimationFrame(updatePaddlePosition);
    }

    updatePaddlePosition();
}

// ✅ Fonction pour désactiver les contrôles après la partie
export function removeAllControls() {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);

    // ✅ Réinitialiser toutes les touches en supprimant leur état
    Object.keys(keysPressed).forEach((key) => {
        keysPressed[key] = false;
    });

    console.log("⌨️ Contrôles désactivés après la partie.");
}
