export const canvasWidth:number = 1000;
export const canvasHeight:number = 500;

export const paddle1 = {
    x: 20,
    y: 250,
    width: 10,
    height: 100,
    speed: 5,
    scored: false // ✅ Ajout de la propriété "scored"
};

export const paddle2 = {
    x: 970,
    y: 250,
    width: 10,
    height: 100,
    speed: 5,
    scored: false // ✅ Ajout de la propriété "scored"
};


export const ball = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    radius: 10,
    speedX: 3.0,
    speedY: 3.0,
	acceleration: 1.05
};

// ✅ Correction : `let` pour modifier les scores
let score1:number = 0;
let score2:number = 0;

export function getScores() {
    return { score1, score2 };
}

export function incrementScore(player: number) {
    if (player === 1) score1++;
    else if (player === 2) score2++;
}

export function resetScores() {
    score1 = 0;
    score2 = 0;
}


export function resetBall() {
    ball.x = canvasWidth / 2;
    ball.y = canvasHeight / 2;
    ball.speedX = ball.speedX > 0 ? -3.0 : 3.0; // Alterne la direction de la balle
    ball.speedY = (Math.random() * 2 - 1) * 3.0;
}

export function increaseBallSpeed() {
	ball.speedX *= ball.acceleration;
	ball.speedY *= ball.acceleration;
  }
  