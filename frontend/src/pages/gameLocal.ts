import Layout from "../components/layout";
import { state } from "../state";
import { navigateTo } from "../router";
import { startGame, resetGame } from "../game/engine";
import { setupControls, cleanupControls } from "../game/controls";
import { paddle1, paddle2, resetPaddleSpeeds, PLAYER_PADDLE_SPEED, ball } from "../game/objects";
import { localTheme, setTheme } from "../game/objects";
import { GameMode, GameOptions } from "../game/multiplayers";
import { translateText } from "../translate";

async function saveMatch(winner: string) {
    if (!state.localMatch) {
        console.error("❌ Erreur : `state.localMatch` est null !");
        return;
    }

    // ✅ Ajoute une vérification explicite pour éviter l'erreur
    const { player1, player2 } = state.localMatch;
    if (!player1 || !player2) {
        console.error("❌ Erreur : Les noms des joueurs ne sont pas définis.");
        return;
    }

    try {
        // 🔹 Récupérer les ID des joueurs via l'API
        const responseUsers = await fetch(`/api/users?username=${player1}&username=${player2}`);
        const usersData = await responseUsers.json();

        if (!usersData || usersData.length < 2) {
            console.error("❌ Impossible de récupérer les ID des joueurs :", usersData);
            return;
        }

        // 🔹 Associer les ID des joueurs
        const player1_id = usersData.find(user => user.username === player1)?.id;
        const player2_id = usersData.find(user => user.username === player2)?.id;
        const winner_id = usersData.find(user => user.username === winner)?.id;

        if (!player1_id || !player2_id || !winner_id) {
            console.error("❌ Erreur : Impossible d'associer les ID des joueurs.");
            return;
        }

        const matchData = { player1_id, player2_id, winner_id };
        console.log("📌 Envoi des données du match :", matchData);

        const response = await fetch("http://localhost:3000/matches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(matchData)
        });

        const result = await response.json();
        console.log("✅ Match enregistré avec succès :", result);
    } catch (error) {
        console.error("❌ Erreur serveur lors de l'enregistrement du match :", error);
    }
}


// ✅ Fonction pour récupérer l'ID d'un utilisateur à partir de son username
async function getUserId(username: string) {
    const response = await fetch(`/users`);
    const users = await response.json();
    const user = users.find((u: any) => u.username === username);
    return user ? user.id : null;
}

export default function GameLocal() {
    document.addEventListener("DOMContentLoaded", () => {
        document.documentElement.style.overflow = "hidden"; // Désactive le scroll globalement
        document.body.style.overflow = "hidden"; // Désactive le scroll sur le body
    }); 
    resetGame();
    
    // ✅ NOUVEAU: Vérifier et restaurer les données si nécessaire
    if (!state.localMatch && localStorage.getItem('localMatchData')) {
        try {
            state.localMatch = JSON.parse(localStorage.getItem('localMatchData')!);
            console.log("✅ Données de match local restaurées depuis localStorage");
        } catch (error) {
            console.error("❌ Erreur lors de la restauration des données:", error);
        }
    }
    
    // Rediriger seulement si les données ne sont toujours pas disponibles
    if (!state.localMatch) {
        const currentPage = localStorage.getItem('currentPage');
        if (currentPage === 'local-match') {
            navigateTo(new Event("click"), "/local-match");
        } else {
            navigateTo(new Event("click"), "/");
        }
        return document.createElement("div");
    }
    
    // ✅ NOUVEAU: Stocker l'état actuel dans localStorage
    localStorage.setItem('currentPage', 'game-local');
    localStorage.setItem('localMatchData', JSON.stringify(state.localMatch));
    
    // Appliquer le thème local
    setTheme(localTheme);
    
    // S'assurer que les raquettes des joueurs ont la bonne vitesse
    resetPaddleSpeeds();
    paddle1.speed = PLAYER_PADDLE_SPEED;
    paddle2.speed = PLAYER_PADDLE_SPEED;
    
    let player1Score = 0;
    let player2Score = 0;
    let matchEnded = false;
    let lastStateSave = Date.now();

    // ✅ NOUVEAU: Restaurer les scores depuis localStorage s'ils existent
    if (localStorage.getItem('localGameScores')) {
        try {
            const savedScores = JSON.parse(localStorage.getItem('localGameScores')!);
            // Vérifier si les scores sont récents (moins de 3 minutes)
            if (Date.now() - savedScores.timestamp < 180000) {
                player1Score = savedScores.player1;
                player2Score = savedScores.player2;
                console.log("✅ Scores restaurés:", player1Score, "-", player2Score);
            } else {
                // Scores trop anciens, les supprimer
                localStorage.removeItem('localGameScores');
            }
        } catch (error) {
            console.error("❌ Erreur lors de la restauration des scores:", error);
        }
    }
    
    // ✅ NOUVEAU: Ajouter un événement pour détecter les rechargements de page
    window.addEventListener('beforeunload', (event) => {
        // Sauvegarder les données de jeu avant le rechargement
        localStorage.setItem('localGameScores', JSON.stringify({
            player1: player1Score,
            player2: player2Score,
            timestamp: Date.now()
        }));

        // Sauvegarder l'état des raquettes et de la balle
        localStorage.setItem('gameState', JSON.stringify({
            paddle1: { y: paddle1.y },
            paddle2: { y: paddle2.y },
            ball: { x: ball.x, y: ball.y, speedX: ball.speedX, speedY: ball.speedY },
            timestamp: Date.now()
        }));
    });

    const container = document.createElement("div");
    container.className = "absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-r from-blue-950 via-blue-700 to-blue-950 text-white";

    const header = document.createElement("div");
    header.className = "w-full max-w-3xl bg-black bg-opacity-40 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-blue-500/30 mb-8";
    
    const title = document.createElement("h1");
    title.className = "text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200 text-center";
    title.innerText = `🏓 Match Local`;
    
    // Sous-titre avec les noms des joueurs
    const subtitle = document.createElement("div");
    subtitle.className = "mt-2 text-2xl text-center";
    
    const player1Span = document.createElement("span");
    player1Span.className = "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500 font-bold";
    player1Span.innerText = state.localMatch.player1;
    
    const vsSpan = document.createElement("span");
    vsSpan.className = "text-blue-200 mx-3";
    vsSpan.innerText = "vs";
    
    const player2Span = document.createElement("span");
    player2Span.className = "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500 font-bold";
    player2Span.innerText = state.localMatch.player2;
    
    subtitle.append(player1Span, vsSpan, player2Span);
    header.append(title, subtitle);

    // Conteneur du jeu avec effet glassmorphism
    const gameContainer = document.createElement("div");
    gameContainer.className = "bg-black bg-opacity-30 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-blue-500/30";

    const gameCanvas: HTMLCanvasElement = document.createElement("canvas");
    gameCanvas.width = 1000;
    gameCanvas.height = 500;
    gameCanvas.className = "border-4 border-blue-500/30 rounded-xl shadow-lg";
    gameCanvas.style.background = localTheme.background; // Définir explicitement l'arrière-plan du canvas

    // Créer un conteneur pour le canvas qui permettra un positionnement relatif
    const canvasContainer = document.createElement("div");
    canvasContainer.className = "relative";
    canvasContainer.appendChild(gameCanvas);
    
    // Message de victoire (placé dans le conteneur du canvas)
    const endMessage = document.createElement("div");
    endMessage.className = "hidden absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl z-10";
    
    // Contenu du message de victoire
    const victoryContent = document.createElement("div");
    victoryContent.className = "bg-black/60 p-8 rounded-xl border border-blue-500/50 shadow-2xl text-center";
    endMessage.appendChild(victoryContent);
    canvasContainer.appendChild(endMessage);

    // Tableau de scores stylisé
    const scoreBoard = document.createElement("div");
    scoreBoard.className = "text-3xl font-bold mt-6 p-6 rounded-xl bg-gradient-to-r from-blue-800/80 to-blue-700/80 shadow-lg border border-blue-500/30 flex justify-center items-center space-x-8";
    
    const player1Container = document.createElement("div");
    player1Container.className = "flex flex-col items-center";
    
    const player1Name = document.createElement("div");
    player1Name.className = "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500 font-medium mb-2";
    player1Name.innerText = state.localMatch.player1;
    
    const player1ScoreDisplay = document.createElement("div");
    player1ScoreDisplay.className = "text-4xl font-bold bg-black/50 w-16 h-16 flex items-center justify-center rounded-xl border border-blue-500/30";
    player1ScoreDisplay.innerText = "0";
    
    player1Container.append(player1Name, player1ScoreDisplay);
    
    const versus = document.createElement("div");
    versus.className = "text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200 font-bold";
    versus.innerText = "VS";
    
    const player2Container = document.createElement("div");
    player2Container.className = "flex flex-col items-center";
    
    const player2Name = document.createElement("div");
    player2Name.className = "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500 font-medium mb-2";
    player2Name.innerText = state.localMatch.player2;
    
    const player2ScoreDisplay = document.createElement("div");
    player2ScoreDisplay.className = "text-4xl font-bold bg-black/50 w-16 h-16 flex items-center justify-center rounded-xl border border-blue-500/30";
    player2ScoreDisplay.innerText = "0";
    
    player2Container.append(player2Name, player2ScoreDisplay);
    
    scoreBoard.append(player1Container, versus, player2Container);

    gameContainer.append(canvasContainer, scoreBoard);
    container.append(header, gameContainer);

    function updateScoreBoard() {
        player1ScoreDisplay.innerText = String(player1Score);
        player2ScoreDisplay.innerText = String(player2Score);

        // ✅ NOUVEAU: Sauvegarder les scores dans localStorage
        localStorage.setItem('localGameScores', JSON.stringify({
            player1: player1Score,
            player2: player2Score,
            timestamp: Date.now()
        }));
    }

    function endMatch(winner: string) {
        if (matchEnded) return;
        matchEnded = true;

        cleanupControls(); // ✅ Désactive proprement les touches après la partie
        
        // Création d'un message de victoire animé
        victoryContent.innerHTML = `
            <div class="text-7xl mb-6">🏆</div>
            <h2 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-4">${winner}</h2>
            <p class="text-xl text-white/90 mb-2">a gagné la partie !</p>
            <div class="mt-6 text-blue-200/80 text-sm">Retour au tableau de bord dans quelques secondes...</div>
        `;
        
        // Afficher le message avec une animation
        endMessage.classList.remove("hidden");
        
        // Ajouter une animation personnalisée au contenu
        victoryContent.style.animation = "scale-up 0.5s ease-out forwards";
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @keyframes scale-up {
                0% { transform: scale(0.7); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(styleElement);

        // ✅ NOUVEAU: Nettoyer les données du match terminé et les scores
        setTimeout(() => {
            localStorage.removeItem('localMatchData');
            localStorage.removeItem('localGameScores');
            localStorage.removeItem('gameState');
        }, 4500); // Juste avant la redirection

        // Sauvegarde du match et redirection
        saveMatch(winner);
        setTimeout(() => navigateTo(new Event("click"), "/matches"), 5000);
    }

    // Utilisation du nouveau système de jeu avec thèmes
    const gameOptions: GameOptions = {
        mode: GameMode.LOCAL,
        scoreLimit: state.localMatch?.mode === "points" ? state.localMatch.target : undefined,
        timeLimit: state.localMatch?.mode === "time" ? state.localMatch.target : undefined,
        theme: localTheme,
        callback: (winner: string) => {
            if (matchEnded || !state.localMatch) return;
            if (winner === "left") {
                endMatch(state.localMatch.player1);
            } else {
                endMatch(state.localMatch.player2);
            }
        }
    };

    // ✅ Mode "nombre de points"
    if (state.localMatch.mode === "points") {
        const onScore = (scorer: "left" | "right") => {
            if (matchEnded || !state.localMatch) return;

            if (scorer === "left") {
                player1Score += 1;
            } else {
                player2Score += 1;
            }

            updateScoreBoard();

            if (player1Score >= state.localMatch.target) {
                endMatch(state.localMatch.player1);
            } else if (player2Score >= state.localMatch.target) {
                endMatch(state.localMatch.player2);
            }
        };
        
        // Initialiser le jeu avec le callback personnalisé pour le score
        startGame(gameCanvas, onScore);
        
        // Réinitialiser les vitesses des raquettes
        resetPaddleSpeeds();
    }

    // ✅ Mode "temps limité"
    if (state.localMatch.mode === "time") {
        let timeLeft = state.localMatch.target;
        
        const timerDisplay: HTMLDivElement = document.createElement("div");
        timerDisplay.className = "text-2xl font-bold mt-6 p-4 rounded-xl bg-black/40 border border-blue-500/30 text-blue-200";
        translateText(" Temps restant: ").then((translated) => {
            timerDisplay.innerText = `⏳ ${translated} ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        })

        container.appendChild(timerDisplay);

        const timerInterval = setInterval(() => {
            if (matchEnded || !state.localMatch) {
                clearInterval(timerInterval);
                return;
            }

            timeLeft--;
            translateText(" Temps restant: ").then((translated) => {
                timerDisplay.innerHTML = `⏳ ${translated} ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
            })

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endMatch(player1Score > player2Score ? state.localMatch.player1 : 
                        player1Score < player2Score ? state.localMatch.player2 : 
                        "Match nul!");
            }
        }, 1000);

        startGame(gameCanvas, (scorer: "left" | "right") => {
            if (matchEnded || !state.localMatch) return;

            if (scorer === "left") {
                player1Score += 1;
            } else if (scorer === "right") {
                player2Score += 1;
            }

            updateScoreBoard();
        });
    }

    setupControls(paddle1, paddle2, gameCanvas.height);

    window.addEventListener("popstate", () => {
        console.log("🔄 Retour arrière détecté. Réinitialisation du jeu.");
        resetGame();
    });

    // ✅ NOUVEAU: Fonction pour sauvegarder l'état du jeu
    function saveGameState() {
        if (matchEnded) return;
        
        // Sauvegarder l'état toutes les 2 secondes
        if (Date.now() - lastStateSave > 2000) {
            localStorage.setItem('gameState', JSON.stringify({
                paddle1: { y: paddle1.y },
                paddle2: { y: paddle2.y },
                ball: { x: ball.x, y: ball.y, speedX: ball.speedX, speedY: ball.speedY },
                timestamp: Date.now()
            }));
            lastStateSave = Date.now();
        }
    }

    // ✅ NOUVEAU: Restaurer l'état du jeu si disponible
    if (localStorage.getItem('gameState')) {
        try {
            const savedState = JSON.parse(localStorage.getItem('gameState')!);
            // Vérifier si l'état est récent (moins de 10 secondes)
            if (Date.now() - savedState.timestamp < 10000) {
                paddle1.y = savedState.paddle1.y;
                paddle2.y = savedState.paddle2.y;
                ball.x = savedState.ball.x;
                ball.y = savedState.ball.y;
                ball.speedX = savedState.ball.speedX;
                ball.speedY = savedState.ball.speedY;
                console.log("✅ État du jeu restauré");
            } else {
                localStorage.removeItem('gameState');
            }
        } catch (error) {
            console.error("❌ Erreur lors de la restauration de l'état du jeu:", error);
        }
    }

    // ✅ NOUVEAU: Hook pour sauvegarder l'état du jeu dans startGame
    const originalStartGame = startGame;
    // @ts-ignore - On étend l'interface window
    window.startGame = (canvas, onScoreCallback) => {
        const result = originalStartGame(canvas, onScoreCallback);
        
        // Ajouter notre sauvegarde d'état à la boucle de jeu
        // @ts-ignore - On étend l'interface window
        const originalGameLoop = window.gameLoop;
        // @ts-ignore - On étend l'interface window
        window.gameLoop = (timestamp) => {
            const result = originalGameLoop(timestamp);
            saveGameState();
            return result;
        };
        
        return result;
    };

    // Mettre à jour l'affichage des scores au démarrage
    updateScoreBoard();

    return Layout(container);
}