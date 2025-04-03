import Layout from "../components/layout";
import { state } from "../state";
import { navigateTo } from "../router";
import { startGame, resetGame } from "../game/engine";
import { setupControls, removeAllControls } from "../game/controls";
import { paddle1, paddle2 } from "../game/objects";
import { drawBracket } from "./tournamentBracket";
import { translateText } from "../translate";

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

    await fetch("http://localhost:3000/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    console.log("✅ Tournoi enregistré avec classement :", finalRanking);
}


export default function GameTournament() {
    if (!state.tournament || !state.tournament.currentMatch) {
        navigateTo(new Event("click"), "/tournament-bracket");
        return document.createElement("div");
    }

    resetGame();

    let player1Score = 0;
    let player2Score = 0;
    let matchEnded = false;

    const match = state.tournament.currentMatch;
    const player1: string = match.player1;
    const player2: string = match.player2 ?? "IA"; // Si pas de joueur2, afficher IA (ou laisser vide)

    const container: HTMLDivElement = document.createElement("div");
    container.className = "flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-900 text-white";

    const title: HTMLHeadingElement = document.createElement("h1");
    title.className = "text-4xl font-bold mb-4 text-purple-400 animate-pulse";
    title.innerHTML = `🏓 ${player1} vs ${player2}`;

    const gameCanvas: HTMLCanvasElement = document.createElement("canvas");
    gameCanvas.width = 1000;
    gameCanvas.height = 500;
    gameCanvas.className = "border-4 border-white rounded-lg shadow-lg";

    const scoreBoard: HTMLDivElement = document.createElement("div");
    scoreBoard.className = "text-3xl font-bold mt-4 p-4 rounded bg-gray-800 shadow-md";
    scoreBoard.innerHTML = `<span class="text-green-400">${player1}</span> 0 - 0 <span class="text-red-400">${player2}</span>`;

    const endMessage: HTMLDivElement = document.createElement("div");
    endMessage.className = "text-3xl text-green-400 mt-6 hidden transition-opacity duration-500";

    container.append(title, gameCanvas, scoreBoard, endMessage);

    function updateScoreBoard() {
        scoreBoard.innerHTML = `<span class="text-green-400">${player1}</span> ${player1Score} - ${player2Score} <span class="text-red-400">${player2}</span>`;
    }

    function endMatch(winner: string) {
        if (matchEnded) return;
        matchEnded = true;

        removeAllControls(); // ✅ Désactive proprement les touches après la partie
        translateText(" a gagné la partie").then((translated) => {
            endMessage.innerHTML = `🎉 ${winner} ` + " " + translated;
        })
        endMessage.classList.remove("hidden");
        endMessage.classList.add("animate-bounce");

        finishMatch(winner);
    }

    // ✅ Mode "nombre de points"
    if (state.tournament.mode === "points") {
        startGame(gameCanvas, (scorer: "left" | "right") => {
            if (matchEnded) return;

            if (scorer === "left") {
                player1Score += 1;
            } else {
                player2Score += 1;
            }

            updateScoreBoard();

            if (!state.tournament) return; // 🔥 Empêche l'erreur en s'assurant que tournament existe

            if (player1Score >= state.tournament.target) {
                endMatch(player1);
            } else if (player2Score >= state.tournament.target) {
                endMatch(player2);
            }

        });
    }

    setupControls(paddle1, paddle2, gameCanvas.height);

    return Layout(container);
}

// ✅ Fonction qui met à jour le bracket et redirige après un match
async function finishMatch(winner: string) {
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

                // ✅ Vérifier si c'est **le dernier match du tournoi**
                if (state.tournament.bracket.length === roundIndex + 1 && round.matchups.length === 1) {
                    console.log("🏆 TOURNOI TERMINÉ - Gagnant :", winner);
                    state.tournament.winner = winner;
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

                    navigateTo(new Event("click"), "/tournament-bracket");
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
                navigateTo(new Event("click"), "/tournament-bracket");
                return;
            }
        }
    }

    console.warn("⚠ Aucun match à mettre à jour !");
}


