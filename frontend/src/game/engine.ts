import { ball, paddle1, paddle2, canvasWidth, canvasHeight, resetBall } from "./objects";
import { increaseBallSpeed, GameTheme, currentTheme, particles, createExplosion, resetPaddleSpeeds } from "./objects";

let gameInterval: number | null = null; // ✅ Stocker l'intervalle du jeu pour éviter les doubles exécutions
let ctx: CanvasRenderingContext2D | null = null;
let lastTime = 0;
const FPS = 60;
const frameTime = 1000 / FPS;

export function startGame(canvas: HTMLCanvasElement, onScore?: (scorer: "left" | "right") => void) {
    ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Optimisation avec requestAnimationFrame
    if (gameInterval !== null) {
        cancelAnimationFrame(gameInterval);
        gameInterval = null;
    }

    resetGame(); // ✅ Réinitialiser le jeu à chaque nouvelle partie
    lastTime = performance.now();

    // Activer les effets avancés si le thème le permet
    if (currentTheme.glowEffect) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = currentTheme.ballColor;
    }

    function gameLoop(timestamp: number) {
        // Calcul du delta time pour une animation fluide
        const deltaTime = timestamp - lastTime;
        
        if (deltaTime >= frameTime) {
            lastTime = timestamp - (deltaTime % frameTime);
            update();
            render();
        }
        
        gameInterval = requestAnimationFrame(gameLoop);
    }

    // Séparation logique entre mise à jour et rendu
    function update() {
        // ✅ Déplacer la balle
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        // Ajouter un point à la traînée de la balle (effet visuel)
        if (currentTheme.particlesEnabled) {
            ball.trail.push({
                x: ball.x,
                y: ball.y,
                alpha: 1.0
            });
            
            // Limiter la taille de la traînée
            if (ball.trail.length > 10) {
                ball.trail.shift();
            }
            
            // Diminuer l'opacité des points de la traînée
            ball.trail.forEach(point => {
                point.alpha -= 0.1;
            });
        }

        // ✅ Collision avec le haut et bas du canvas
        if (ball.y - ball.radius <= 0) {
            ball.speedY = Math.abs(ball.speedY); // Force la direction vers le bas
            ball.y = ball.radius; // Évite que la balle ne sorte du canvas
            if (currentTheme.particlesEnabled) {
                createExplosion(ball.x, ball.y, 5);
            }
        } else if (ball.y + ball.radius >= canvasHeight) {
            ball.speedY = -Math.abs(ball.speedY); // Force la direction vers le haut
            ball.y = canvasHeight - ball.radius; // Évite que la balle ne sorte du canvas
            if (currentTheme.particlesEnabled) {
                createExplosion(ball.x, ball.y, 5);
            }
        }

        // ✅ Collision avec la raquette gauche (paddle1)
        if (
            ball.x - ball.radius <= paddle1.x + paddle1.width &&
            ball.x + ball.radius >= paddle1.x && // S'assure que la balle n'est pas complètement à gauche de la raquette
            ball.y >= paddle1.y &&
            ball.y <= paddle1.y + paddle1.height &&
            ball.speedX < 0 // Vérification de la direction pour éviter les doubles collisions
        ) {
            // Calcul de l'angle de rebond basé sur la position d'impact sur la raquette
            const impactPoint = (ball.y - paddle1.y) / paddle1.height;
            const bounceAngle = (impactPoint - 0.5) * Math.PI * 0.7; // Angle de rebond entre -35° et +35°
            
            // Calcul de la nouvelle vitesse
            const speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
            ball.speedX = Math.cos(bounceAngle) * speed;
            ball.speedY = Math.sin(bounceAngle) * speed;
            
            // Assurer que la balle part dans la bonne direction (vers la droite)
            if (ball.speedX <= 0) ball.speedX = 2;
            
            // Éviter que la balle ne reste coincée dans la raquette
            ball.x = paddle1.x + paddle1.width + ball.radius;
            
            if (currentTheme.particlesEnabled) {
                createExplosion(ball.x, ball.y, 10);
            }
            
            increaseBallSpeed();
        }

        // ✅ Collision avec la raquette droite (paddle2)
        if (
            ball.x + ball.radius >= paddle2.x &&
            ball.x - ball.radius <= paddle2.x + paddle2.width && // S'assure que la balle n'est pas complètement à droite de la raquette
            ball.y >= paddle2.y &&
            ball.y <= paddle2.y + paddle2.height &&
            ball.speedX > 0 // Vérification de la direction
        ) {
            // Calcul de l'angle de rebond basé sur la position d'impact sur la raquette
            const impactPoint = (ball.y - paddle2.y) / paddle2.height;
            const bounceAngle = (impactPoint - 0.5) * Math.PI * 0.7 + Math.PI; // Angle de rebond entre 145° et 215°
            
            // Calcul de la nouvelle vitesse
            const speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
            ball.speedX = Math.cos(bounceAngle) * speed;
            ball.speedY = Math.sin(bounceAngle) * speed;
            
            // Assurer que la balle part dans la bonne direction (vers la gauche)
            if (ball.speedX >= 0) ball.speedX = -2;
            
            // Éviter que la balle ne reste coincée dans la raquette
            ball.x = paddle2.x - ball.radius;
            
            if (currentTheme.particlesEnabled) {
                createExplosion(ball.x, ball.y, 10);
            }
            
            increaseBallSpeed();
        }

        // ✅ Vérifier si un joueur marque un point
        if (ball.x + ball.radius <= 0) {
            if (onScore) onScore("right");
            resetBall();
        }

        if (ball.x - ball.radius >= canvasWidth) {
            if (onScore) onScore("left");
            resetBall();
        }

        // Mettre à jour les particules
        if (currentTheme.particlesEnabled) {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.life--;
                
                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }
                
                const angle = Math.random() * Math.PI * 2;
                p.x += Math.cos(angle) * p.speed * 0.5;
                p.y += Math.sin(angle) * p.speed * 0.5;
            }
        }
    }

    function render() {
        if (!ctx) return;
        
        // Appliquer le fond en fonction du thème
        if (currentTheme.background.includes("gradient")) {
            const gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
            if (currentTheme.background.includes("1e1b4b")) {
                // Thème tournoi (violet/indigo)
                gradient.addColorStop(0, "#1e1b4b");
                gradient.addColorStop(0.5, "#581c87");
                gradient.addColorStop(1, "#1e1b4b");
            } else if (currentTheme.background.includes("172554")) {
                // Thème local (bleu intense)
                gradient.addColorStop(0, "#172554");
                gradient.addColorStop(0.5, "#1d4ed8");
                gradient.addColorStop(1, "#172554");
            } else if (currentTheme.background.includes("064e3b")) {
                // Thème IA facile (vert)
                gradient.addColorStop(0, "#064e3b");
                gradient.addColorStop(0.5, "#22c55e");
                gradient.addColorStop(1, "#064e3b");
            } else if (currentTheme.background.includes("7c2d12")) {
                // Thème IA normal (orange)
                gradient.addColorStop(0, "#92400e");
                gradient.addColorStop(0.5, "#f97316");
                gradient.addColorStop(1, "#92400e");
            } else if (currentTheme.background.includes("92400e")) {
                // Thème IA normal (orange) mis à jour
                gradient.addColorStop(0, "#92400e");
                gradient.addColorStop(0.5, "#f97316");
                gradient.addColorStop(1, "#92400e");
            } else if (currentTheme.background.includes("7f1d1d")) {
                // Thème IA difficile (rouge)
                gradient.addColorStop(0, "#7f1d1d");
                gradient.addColorStop(0.5, "#ef4444");
                gradient.addColorStop(1, "#7f1d1d");
            } else {
                gradient.addColorStop(0, "#000000");
                gradient.addColorStop(0.5, "#333333");
                gradient.addColorStop(1, "#000000");
            }
            
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = currentTheme.background;
        }
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Dessiner la ligne centrale
        ctx.strokeStyle = currentTheme.netColor;
        ctx.setLineDash(currentTheme.netDashPattern);
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, 0);
        ctx.lineTo(canvasWidth / 2, canvasHeight);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Dessiner la traînée de la balle
        if (currentTheme.particlesEnabled && ball.trail.length > 0) {
            ball.trail.forEach(point => {
                if (point.alpha <= 0 || !ctx) return;
                
                ctx.globalAlpha = point.alpha;
                ctx.beginPath();
                ctx.arc(point.x, point.y, ball.radius * 0.7, 0, Math.PI * 2);
                ctx.fillStyle = currentTheme.ballColor;
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;
        }
        
        // Dessiner les particules
        if (currentTheme.particlesEnabled) {
            particles.forEach(p => {
                if (!ctx) return;
                ctx.globalAlpha = p.life / 50;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;
        }

        // ✅ Dessiner les raquettes avec la couleur du thème
        if (currentTheme.glowEffect) {
            ctx.shadowColor = currentTheme.paddle1Color;
            ctx.shadowBlur = 10;
        }
        ctx.fillStyle = currentTheme.paddle1Color;
        ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
        
        if (currentTheme.glowEffect) {
            ctx.shadowColor = currentTheme.paddle2Color;
        }
        ctx.fillStyle = currentTheme.paddle2Color;
        ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
        
        // ✅ Dessiner la balle
        if (currentTheme.glowEffect) {
            ctx.shadowColor = currentTheme.ballColor;
        }
        ctx.fillStyle = currentTheme.ballColor;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Réinitialiser les effets de shadow
        if (currentTheme.glowEffect) {
            ctx.shadowBlur = 0;
        }
    }

    gameLoop(performance.now());
}

// ✅ Fonction pour remettre le jeu à zéro
export function resetGame() {
    ball.x = canvasWidth / 2;
    ball.y = canvasHeight / 2;
    ball.speedX = 4; // ✅ Remettre une vitesse normale
    ball.speedY = 4;
    ball.trail = []; // Réinitialiser la traînée

    paddle1.y = canvasHeight / 2 - paddle1.height / 2;
    paddle2.y = canvasHeight / 2 - paddle2.height / 2;

    // Réinitialiser les vitesses des raquettes (importante pour avoir des vitesses cohérentes)
    resetPaddleSpeeds();
    
    // Vider les particules
    particles.length = 0;
    
    // Assurons-nous que gameInterval est bien nettoyé
    if (gameInterval !== null) {
        cancelAnimationFrame(gameInterval);
        gameInterval = null;
    }
}

// ✅ Fonction pour arrêter proprement le jeu lorsqu'on quitte la page
export function stopGame() {
    if (gameInterval !== null) {
        cancelAnimationFrame(gameInterval);
        gameInterval = null;
    }
}
