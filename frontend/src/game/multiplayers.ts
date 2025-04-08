import { currentTheme, setTheme, tournamentTheme, neonTheme, classicTheme, localTheme, GameTheme } from "./objects";
import { startGame, stopGame } from "./engine";

// Modes de jeu disponibles
export enum GameMode {
    LOCAL = "local",
    TOURNAMENT = "tournament",
    ONLINE = "online",
    AI = "ai"
}

// Interface pour les options de jeu
export interface GameOptions {
    mode: GameMode;
    scoreLimit?: number;
    theme?: GameTheme;
    aiDifficulty?: "easy" | "medium" | "hard";
    callback?: (winner: string) => void;
}

// Fonction principale pour démarrer une partie avec les options
export function startGameWithOptions(canvas: HTMLCanvasElement, options: GameOptions) {
    
    // Sélection du thème en fonction du mode
    if (options.theme) {
        setTheme(options.theme);
    } else {
        switch (options.mode) {
            case GameMode.TOURNAMENT:
                setTheme(tournamentTheme);
                break;
            case GameMode.LOCAL:
                setTheme(localTheme);
                break;
            case GameMode.ONLINE:
                setTheme(neonTheme);
                break;
            default:
                setTheme(classicTheme);
        }
    }
    
    // Variables pour suivre le score
    let scoreLeft = 0;
    let scoreRight = 0;
    
    // Démarrer le jeu avec le callback approprié
    startGame(canvas, (scorer: "left" | "right") => {
        // Mise à jour du score
        if (scorer === "left") {
            scoreRight++;
        } else {
            scoreLeft++;
        }
        
        
        // Vérifier si le score limite est atteint et appeler le callback
        if (options.callback && options.scoreLimit) {
            if (scoreLeft >= options.scoreLimit) {
                options.callback("left");
            } else if (scoreRight >= options.scoreLimit) {
                options.callback("right");
            }
        }
    });
    
    return () => {
        stopGame(); // Fonction pour nettoyer le jeu
    };
}

// Gestion de l'IA
export function updateAI(ballY: number, paddle2Y: number, paddleHeight: number, difficulty: "easy" | "medium" | "hard") {
    // Ajout d'un délai de réaction et d'une marge d'erreur pour rendre l'IA plus humaine
    let reactionSpeed = 0;
    let errorMargin = 0;
    
    switch (difficulty) {
        case "easy":
            reactionSpeed = 0.02;
            errorMargin = 50;
            break;
        case "medium":
            reactionSpeed = 0.05;
            errorMargin = 20;
            break;
        case "hard":
            reactionSpeed = 0.1;
            errorMargin = 5;
            break;
    }
    
    // Calculer la position cible avec une marge d'erreur
    const targetY = ballY - paddleHeight / 2 + (Math.random() * errorMargin - errorMargin / 2);
    
    // Déplacer le paddle vers la balle avec le délai de réaction
    return paddle2Y + (targetY - paddle2Y) * reactionSpeed;
}

// Fonctions pour les tournois
export function createTournamentMatch(player1: string, player2: string, options: GameOptions) {
    return {
        player1,
        player2,
        winner: null as string | null,
        options
    };
}

export function finishMatch(winner: string) {
    console.log(`🏆 Fin du match, vainqueur: ${winner}`);
}
