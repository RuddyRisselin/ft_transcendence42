const keysPressed: { [key: string]: boolean } = {}; 

export function setupControls(paddle1: any, paddle2: any, canvasHeight: number) {
    document.addEventListener("keydown", (event) => {
        if (["ArrowUp", "ArrowDown", "z", "s"].includes(event.key)) {
            event.preventDefault();
            keysPressed[event.key] = true;
        }
    });

    document.addEventListener("keyup", (event) => {
        if (["ArrowUp", "ArrowDown", "z", "s"].includes(event.key)) {
            keysPressed[event.key] = false;
        }
    });

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
