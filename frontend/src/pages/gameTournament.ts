import Layout from "../components/layout";
import { state } from "../state";
import { navigateTo } from "../router";
import { startGame, resetGame, stopGame } from "../game/engine";
import { setupControls, cleanupControls } from "../game/controls";
import { paddle1, paddle2, resetPaddleSpeeds, PLAYER_PADDLE_SPEED, getScores, ball } from "../game/objects";
import { drawBracket } from "./tournamentBracket";
import { translateText } from "../translate";
import { GameMode, GameOptions, startGameWithOptions } from "../game/multiplayers";
import { tournamentTheme, setTheme } from "../game/objects";
import { finishMatch as finishTournamentMatch } from "../game/multiplayers";
import API_CONFIG from "../config/apiConfig";

// Variable globale pour éviter les doubles redirections
let redirectionInProgress = false;

async function saveTournamentToHistory() {

    if (!state.tournament || !state.tournament.winner) return;

    const { bracket, winner, players } = state.tournament;

    // Étape 1 - Initialisation des rangs
    const eliminatedInRound: Record<string, number> = {};

    bracket.forEach((round, roundIndex) => {
        for (const match of round.matchups) {
            if (match.player1 && match.player1 !== match.winner) {
                eliminatedInRound[match.player1] = roundIndex;
            }
            if (match.player2 && match.player2 !== match.winner) {
                eliminatedInRound[match.player2] = roundIndex;
            }
        }
    });

    // Étape 2 - Le gagnant n'a pas été éliminé, donc on lui attribue le round max + 1
    const maxRound: number = bracket.length;
    eliminatedInRound[winner] = maxRound;

    // Étape 3 - Grouper les joueurs par round d'élimination
    const roundGroups: Record<number, string[]> = {};
    for (const [player, round] of Object.entries(eliminatedInRound)) {
        if (!roundGroups[round]) {
            roundGroups[round] = [];
        }
        roundGroups[round].push(player);
    }

    // Étape 4 - Attribuer un classement égal aux joueurs éliminés au même round
    const sortedRounds: number[] = Object.keys(roundGroups)
        .map(Number)
        .sort((a, b) => b - a); // Du gagnant (plus haut round) au premier éliminé

    const finalRanking: string[] = [];

    for (let i = 0; i < sortedRounds.length; i++) {
        const round: number = sortedRounds[i];
        const playersInRound: string[] = roundGroups[round];
        for (const player of playersInRound) {
            if (i === 0) finalRanking.push(`🏆 ${player}`);
            else if (i === 1) finalRanking.push(`🥈 ${player}`);
            else if (i === 2) finalRanking.push(`🥉 ${player}`);
            else finalRanking.push(player);
        }
    }

    // Étape 5 - Envoi à l'API
    const body = {
        players,
        ranking: finalRanking
    };

    await fetch(`${API_CONFIG.API_BASE_URL}/tournaments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    console.log("✅ Tournoi enregistré avec classement :", finalRanking);
}


export default async function GameTournament() {
    const textToTranslate: string[] = [
        "Match de Tournoi",
        " a gagné la partie",
        "Mise à jour du bracket..."
    ];

    const [
        translatedTournamentMatch,
        translatedWinParty,
        translatedUpdateBracket
    ] = await Promise.all(textToTranslate.map(text => translateText(text)));
    // ✅ NOUVEAU: Vérifier et restaurer les données du tournoi si nécessaire
    if (!state.tournament && localStorage.getItem('tournamentData')) {
        try {
            state.tournament = JSON.parse(localStorage.getItem('tournamentData')!);
            console.log("✅ Données de tournoi restaurées depuis localStorage");
        } catch (error) {
            console.error("❌ Erreur lors de la restauration des données de tournoi:", error);
        }
    }
    
    // ✅ NOUVEAU: Vérifier et restaurer les données du match actuel
    if (state.tournament && !state.tournament.currentMatch && localStorage.getItem('currentMatchData')) {
        try {
            state.tournament.currentMatch = JSON.parse(localStorage.getItem('currentMatchData')!);
            console.log("✅ Données du match actuel restaurées depuis localStorage");
        } catch (error) {
            console.error("❌ Erreur lors de la restauration des données du match:", error);
        }
    }

    if (!state.tournament || !state.tournament.currentMatch) {
        navigateTo(new Event("click"), "/tournament-bracket");
        return document.createElement("div");
    }
    
    // ✅ NOUVEAU: Stocker l'état actuel dans localStorage
    localStorage.setItem('currentPage', 'tournament-game');
    localStorage.setItem('tournamentData', JSON.stringify(state.tournament));
    localStorage.setItem('currentMatchData', JSON.stringify(state.tournament.currentMatch));

    // Réinitialiser le statut de redirection entre chaque match
    redirectionInProgress = false;

    resetGame();
    // Appliquer le thème du tournoi
    setTheme(tournamentTheme);
    
    // S'assurer que les raquettes des joueurs ont la bonne vitesse
    resetPaddleSpeeds();
    // Définir explicitement les vitesses pour éviter toute accumulation entre les parties
    paddle1.speed = PLAYER_PADDLE_SPEED;
    paddle2.speed = PLAYER_PADDLE_SPEED; // Garantir que paddle2 a la même vitesse que paddle1

    let player1Score = 0;
    let player2Score = 0;
    let matchEnded = false;
    let lastStateSave = Date.now();

    // ✅ NOUVEAU: Restaurer les scores depuis localStorage s'ils existent
    if (localStorage.getItem('tournamentGameScores')) {
        try {
            const savedScores = JSON.parse(localStorage.getItem('tournamentGameScores')!);
            // Vérifier si les scores sont récents (moins de 3 minutes)
            if (Date.now() - savedScores.timestamp < 180000) {
                player1Score = savedScores.player1;
                player2Score = savedScores.player2;
                console.log("✅ Scores du tournoi restaurés:", player1Score, "-", player2Score);
            } else {
                // Scores trop anciens, les supprimer
                localStorage.removeItem('tournamentGameScores');
            }
        } catch (error) {
            console.error("❌ Erreur lors de la restauration des scores du tournoi:", error);
        }
    }
    
    // ✅ NOUVEAU: Ajouter un événement pour détecter les rechargements de page
    window.addEventListener('beforeunload', (event) => {
        // Empêcher la perte des scores pendant le rechargement
        localStorage.setItem('tournamentGameScores', JSON.stringify({
            player1: player1Score,
            player2: player2Score,
            timestamp: Date.now()
        }));

        // Sauvegarder l'état des raquettes et de la balle
        localStorage.setItem('tournamentGameState', JSON.stringify({
            paddle1: { y: paddle1.y },
            paddle2: { y: paddle2.y },
            ball: { x: ball.x, y: ball.y, speedX: ball.speedX, speedY: ball.speedY },
            timestamp: Date.now()
        }));
    });

    const match = state.tournament.currentMatch;
    const player1: string = match.player1;
    const player2: string = match.player2 ?? "IA"; // Si pas de joueur2, afficher IA (ou laisser vide)

    const container = document.createElement("div");
    container.className = "absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-950 text-white";

    const header = document.createElement("div");
    header.className = "w-full max-w-3xl bg-black bg-opacity-40 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-purple-500/30 mb-8";
    
    const title = document.createElement("h1");
    title.className = "text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-center";
    title.innerHTML = `🏓 ${translatedTournamentMatch}`;
    


    // Sous-titre avec les noms des joueurs
    const subtitle = document.createElement("div");
    subtitle.className = "mt-2 text-2xl text-center";
    
    const player1Span = document.createElement("span");
    player1Span.className = "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold";
    player1Span.innerHTML = player1;
    
    const vsSpan = document.createElement("span");
    vsSpan.className = "text-purple-300 mx-3";
    vsSpan.innerHTML = "vs";
    
    const player2Span = document.createElement("span");
    player2Span.className = "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold";
    player2Span.innerHTML = player2;
    
    subtitle.append(player1Span, vsSpan, player2Span);
    header.append(title, subtitle);

    // Conteneur du jeu avec effet glassmorphism
    const gameContainer = document.createElement("div");
    gameContainer.className = "bg-black bg-opacity-30 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-indigo-500/30";

    const gameCanvas: HTMLCanvasElement = document.createElement("canvas");
    gameCanvas.width = 1000;
    gameCanvas.height = 500;
    gameCanvas.className = "border-4 border-indigo-500/30 rounded-xl shadow-lg";

    // Créer un conteneur pour le canvas qui permettra un positionnement relatif
    const canvasContainer = document.createElement("div");
    canvasContainer.className = "relative";
    canvasContainer.appendChild(gameCanvas);
    
    // Message de victoire (placé dans le conteneur du canvas)
    const endMessage = document.createElement("div");
    endMessage.className = "hidden absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl z-10";
    
    // Contenu du message de victoire
    const victoryContent = document.createElement("div");
    victoryContent.className = "bg-black/60 p-8 rounded-xl border border-indigo-500/50 shadow-2xl text-center";
    endMessage.appendChild(victoryContent);
    canvasContainer.appendChild(endMessage);

    // Tableau de scores stylisé
    const scoreBoard = document.createElement("div");
    scoreBoard.className = "text-3xl font-bold mt-6 p-6 rounded-xl bg-gradient-to-r from-indigo-900/80 to-purple-900/80 shadow-lg border border-indigo-500/30 flex justify-center items-center space-x-8";
    
    const player1Container = document.createElement("div");
    player1Container.className = "flex flex-col items-center";
    
    const player1Name = document.createElement("div");
    player1Name.className = "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 font-medium mb-2";
    player1Name.innerHTML = player1;
    
    const player1ScoreDisplay = document.createElement("div");
    player1ScoreDisplay.className = "text-4xl font-bold bg-black/50 w-16 h-16 flex items-center justify-center rounded-xl border border-indigo-500/30";
    player1ScoreDisplay.innerHTML = "0";
    
    player1Container.append(player1Name, player1ScoreDisplay);
    
    const versus = document.createElement("div");
    versus.className = "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold";
    versus.innerHTML = "VS";
    
    const player2Container = document.createElement("div");
    player2Container.className = "flex flex-col items-center";
    
    const player2Name = document.createElement("div");
    player2Name.className = "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 font-medium mb-2";
    player2Name.innerHTML = player2;
    
    const player2ScoreDisplay = document.createElement("div");
    player2ScoreDisplay.className = "text-4xl font-bold bg-black/50 w-16 h-16 flex items-center justify-center rounded-xl border border-indigo-500/30";
    player2ScoreDisplay.innerHTML = "0";
    
    player2Container.append(player2Name, player2ScoreDisplay);
    
    scoreBoard.append(player1Container, versus, player2Container);

    gameContainer.append(canvasContainer, scoreBoard);
    container.append(header, gameContainer);

    function updateScoreBoard() {
        player1ScoreDisplay.innerHTML = String(player1Score);
        player2ScoreDisplay.innerHTML = String(player2Score);

        // ✅ NOUVEAU: Sauvegarder les scores dans localStorage
        localStorage.setItem('tournamentGameScores', JSON.stringify({
            player1: player1Score,
            player2: player2Score,
            timestamp: Date.now()
        }));
    }

    function endMatch(winner: string) {
        if (matchEnded || redirectionInProgress) return;
        matchEnded = true;

        // Arrêter immédiatement le jeu pour éviter les accumulations de vitesse
        stopGame();
        cleanupControls(); // ✅ Désactive proprement les touches après la partie
        
        // ✅ NOUVEAU: Nettoyer les données du match terminé et les scores
        setTimeout(() => {
            localStorage.removeItem('tournamentGameScores');
            localStorage.removeItem('tournamentGameState');
        }, 1000); // Nettoyage avant la redirection

        // Création d'un message de victoire animé
        victoryContent.innerHTML = `
            <div class="text-7xl mb-6">🏆</div>
            <h2 class="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">${winner}</h2>
            <p class="text-xl text-white/90 mb-2"> ${translatedWinParty}</p>
            <div class="mt-6 text-indigo-300/80 text-sm">${translatedUpdateBracket}</div>
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

        // Appel à finishMatch avec un petit délai pour garantir que l'interface est mise à jour d'abord
        setTimeout(() => {
            finishMatch(winner);
        }, 100);
    }

    // Utilisation du nouveau système de jeu avec thèmes
    const gameOptions: GameOptions = {
        mode: GameMode.TOURNAMENT,
        scoreLimit: state.tournament.target,
        theme: tournamentTheme,
        callback: (winner: string) => {
            if (matchEnded) return;
            
            console.log(`🎯 Score limite atteint! Gagnant: ${winner === "left" ? player1 : player2}`);
            
            if (winner === "left") {
                endMatch(player1);
            } else {
                endMatch(player2);
            }
        }
    };

    // ✅ Mode "nombre de points"
    if (state.tournament.mode === "points") {
        // Pour capturer les scores à chaque point marqué
        startGame(gameCanvas, (scorer: "left" | "right") => {
            if (matchEnded) return;
            
            // Mettre à jour les scores locaux
            if (scorer === "left") {
                player1Score += 1;
            } else {
                player2Score += 1;
            }
            
            // Mettre à jour l'affichage
            updateScoreBoard();
            
            // Vérifier si un joueur a gagné
            if (!state.tournament) return; // Vérification pour éviter l'erreur
            
            if (player1Score >= state.tournament.target) {
                endMatch(player1);
            } else if (player2Score >= state.tournament.target) {
                endMatch(player2);
            }
        });
        
        // Réinitialiser les vitesses des raquettes
        resetPaddleSpeeds();
        paddle1.speed = PLAYER_PADDLE_SPEED;
        paddle2.speed = PLAYER_PADDLE_SPEED;
    }

    // ✅ NOUVEAU: Fonction pour sauvegarder l'état du jeu
    function saveGameState() {
        if (matchEnded) return;
        
        // Sauvegarder l'état toutes les 2 secondes
        if (Date.now() - lastStateSave > 2000) {
            localStorage.setItem('tournamentGameState', JSON.stringify({
                paddle1: { y: paddle1.y },
                paddle2: { y: paddle2.y },
                ball: { x: ball.x, y: ball.y, speedX: ball.speedX, speedY: ball.speedY },
                timestamp: Date.now()
            }));
            lastStateSave = Date.now();
        }
    }

    // ✅ NOUVEAU: Restaurer l'état du jeu si disponible
    if (localStorage.getItem('tournamentGameState')) {
        try {
            const savedState = JSON.parse(localStorage.getItem('tournamentGameState')!);
            // Vérifier si l'état est récent (moins de 10 secondes)
            if (Date.now() - savedState.timestamp < 10000) {
                paddle1.y = savedState.paddle1.y;
                paddle2.y = savedState.paddle2.y;
                ball.x = savedState.ball.x;
                ball.y = savedState.ball.y;
                ball.speedX = savedState.ball.speedX;
                ball.speedY = savedState.ball.speedY;
                console.log("✅ État du jeu de tournoi restauré");
            } else {
                localStorage.removeItem('tournamentGameState');
            }
        } catch (error) {
            console.error("❌ Erreur lors de la restauration de l'état du jeu de tournoi:", error);
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

    // Mettre à jour l'affichage des scores au démarrage pour refléter les scores restaurés
    updateScoreBoard();

    setupControls(paddle1, paddle2, gameCanvas.height);

    return Layout(container);
}

// ✅ Fonction qui met à jour le bracket et redirige après un match
async function finishMatch(winner: string) {
    // Éviter les doubles redirections
    if (redirectionInProgress) return;
    redirectionInProgress = true;
    
    console.log(`🏆 Bouton cliqué - Gagnant: ${winner}`);

    if (!state.tournament) {
        console.error("❌ state.tournament est indéfini !");
        return;
    }

    for (let roundIndex = 0; roundIndex < state.tournament.bracket.length; roundIndex++) {
        const round = state.tournament.bracket[roundIndex];

        for (let match of round.matchups) {
            if (!match.winner && match.player2) {
                match.winner = winner;
                console.log("✅ Gagnant enregistré dans le bracket :", state.tournament.bracket);
                
                // ✅ NOUVEAU: Mettre à jour le localStorage après modification du bracket
                localStorage.setItem('tournamentData', JSON.stringify(state.tournament));
                localStorage.removeItem('currentMatchData'); // Effacer le match actuel

                // ✅ Vérifier si c'est **le dernier match du tournoi**
                if (state.tournament.bracket.length === roundIndex + 1 && round.matchups.length === 1) {
                    console.log("🏆 TOURNOI TERMINÉ - Gagnant :", winner);
                    state.tournament.winner = winner;
                    // Mettre à jour encore une fois le localStorage
                    localStorage.setItem('tournamentData', JSON.stringify(state.tournament));
                    
                    // ✅ Enregistrement du tournoi dans l'historique
                    saveTournamentToHistory();

                    
                    // ✅ Redirection et mise à jour finale du bracket
                    setTimeout(() => {
                        const canvas = document.querySelector("canvas");
                        if (canvas) {
                            const ctx = canvas.getContext("2d");
                            if (ctx) {
                                drawBracket(ctx, canvas.width, canvas.height);
                            } else {
                                console.error("❌ Erreur : Impossible d'obtenir le contexte 2D du canvas.");
                            }
                        } else {
                            console.error("❌ Erreur : Canvas non trouvé dans le DOM.");
                        }
                    }, 500);

                    setTimeout(() => {
                        navigateTo(new Event("click"), "/tournament-bracket");
                    }, 5000);
                    return;
                }

                // ✅ Ajout du vainqueur au tour suivant
                if (roundIndex + 1 < state.tournament.bracket.length) {
                    let nextRound = state.tournament.bracket[roundIndex + 1];

                    let foundSpot = false;
                    for (let nextMatch of nextRound.matchups) {
                        if (!nextMatch.player1) {
                            nextMatch.player1 = winner;
                            foundSpot = true;
                            break;
                        } else if (!nextMatch.player2) {
                            nextMatch.player2 = winner;
                            foundSpot = true;
                            break;
                        }
                    }

                    // ✅ ✅ ✅ CORRECTION : Si le prochain tour n'existe pas encore, on le crée !
                    if (!foundSpot) {
                        nextRound.matchups.push({ player1: winner, player2: null });
                    }
                } else {
                    // ✅ ✅ ✅ DERNIER TOUR : Si c'est la finale, on crée le dernier match
                    state.tournament.bracket.push({
                        round: roundIndex + 2,
                        matchups: [{ player1: winner, player2: null }]
                    });
                }

                // ✅ Mise à jour de l'affichage
                setTimeout(() => {
                    const canvas = document.querySelector("canvas");
                    if (canvas) {
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                            drawBracket(ctx, canvas.width, canvas.height);
                        } else {
                            console.error("❌ Erreur : Impossible d'obtenir le contexte 2D du canvas.");
                        }
                    } else {
                        console.error("❌ Erreur : Canvas non trouvé dans le DOM.");
                    }
                }, 500);

                console.log("🔄 Redirection vers /tournament-bracket...");
                setTimeout(() => {
                    navigateTo(new Event("click"), "/tournament-bracket");
                }, 5000);
                return;
            }
        }
    }

    console.warn("⚠ Aucun match à mettre à jour !");
}


