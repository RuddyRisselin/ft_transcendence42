import { paddle1, paddle2 } from './objects';
import { aiKeyState } from './ai';

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

    // Boucle d'animation pour mettre à jour les positions des paddles
    function updatePosition() {
        // Contrôles du joueur 1 (touches Z et S)
        if (keysPressed['z']) {
            paddle1.y = Math.max(0, paddle1.y - paddle1.speed);
        }
        if (keysPressed['s']) {
            paddle1.y = Math.min(canvasHeight - paddle1.height, paddle1.y + paddle1.speed);
        }

        // Contrôles du joueur 2 (flèches haut et bas) ou simulation d'IA
        // L'IA utilise les mêmes contrôles que le joueur humain
        if (keysPressed['ArrowUp'] || aiKeyState.ArrowUp) {
            paddle2.y = Math.max(0, paddle2.y - paddle2.speed);
        }
        if (keysPressed['ArrowDown'] || aiKeyState.ArrowDown) {
            paddle2.y = Math.min(canvasHeight - paddle2.height, paddle2.y + paddle2.speed);
        }

        requestAnimationFrame(updatePosition);
    }

    // Démarrer la boucle d'animation
    updatePosition();
}

// ✅ Fonction pour désactiver les contrôles après la partie
export function cleanupControls() {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
    
    // Réinitialiser l'état des touches
    for (const key in keysPressed) {
        keysPressed[key] = false;
    }

    console.log("⌨️ Contrôles désactivés après la partie.");
}
