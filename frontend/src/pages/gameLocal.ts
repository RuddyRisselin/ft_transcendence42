import Layout from "../components/layout";
import { state } from "../state";
import { navigateTo } from "../router";
import { startGame, resetGame } from "../game/engine"; 
import { setupControls } from "../game/controls";
import { paddle1, paddle2 } from "../game/objects";
import { removeAllControls } from "../game/controls";
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
    if (!state.localMatch) {
        navigateTo(new Event("click"), "/matches");
        return document.createElement("div");
    }

    resetGame();

    let player1Score = 0;
    let player2Score = 0;
    let matchEnded = false;

    const container: HTMLDivElement = document.createElement("div");
    container.className = "flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-900 text-white overflow-hidden";

    const title: HTMLHeadingElement = document.createElement("h1");
    title.className = "text-4xl font-bold mb-4 text-purple-400 animate-pulse";
    title.innerHTML = `🏓 ${state.localMatch.player1} vs ${state.localMatch.player2}`;

    const gameCanvas: HTMLCanvasElement = document.createElement("canvas");
    gameCanvas.width = 1000;
    gameCanvas.height = 500;
    gameCanvas.className = "border-4 border-white rounded-lg shadow-lg";

    const scoreBoard: HTMLDivElement = document.createElement("div");
    scoreBoard.className = "text-3xl font-bold mt-4 p-4 rounded bg-gray-800 shadow-md";
    scoreBoard.innerHTML = `<span class="text-green-400">${state.localMatch.player1}</span> 0 - 0 <span class="text-red-400">${state.localMatch.player2}</span>`;

    const endMessage: HTMLDivElement = document.createElement("div");
    endMessage.className = "text-3xl text-green-400 mt-6 hidden transition-opacity duration-500";

    container.append(title, gameCanvas, scoreBoard, endMessage);

    function updateScoreBoard() {
        if (!state.localMatch) return;
        scoreBoard.innerHTML = `<span class="text-green-400">${state.localMatch.player1}</span> ${player1Score} - ${player2Score} <span class="text-red-400">${state.localMatch.player2}</span>`;
    }

function endMatch(winner: string) {
    if (matchEnded) return;
    matchEnded = true;

    removeAllControls(); // ✅ Désactive proprement les touches après la partie
    saveMatch(winner);

    translateText(" a gagné la partie").then((translated) => {
        endMessage.innerHTML = winner + " " + translated;
    })
    endMessage.classList.remove("hidden");
    endMessage.classList.add("animate-bounce");

    setTimeout(() => navigateTo(new Event("click"), "/matches"), 5000);
}


    // ✅ Mode "nombre de points"
    if (state.localMatch.mode === "points") {
        startGame(gameCanvas, (scorer: "left" | "right") => {
            if (matchEnded || !state.localMatch) return;

            if (scorer === "left") {
                player1Score += 1;
            } else if (scorer === "right") {
                player2Score += 1;
            }

            updateScoreBoard();

            if (player1Score >= state.localMatch.target) {
                endMatch(state.localMatch.player1);
            } else if (player2Score >= state.localMatch.target) {
                endMatch(state.localMatch.player2);
            }
        });
    }

    // ✅ Mode "temps limité"
    if (state.localMatch.mode === "time") {
        let timeLeft = state.localMatch.target;
        const timerDisplay: HTMLDivElement = document.createElement("div");
        timerDisplay.className = "text-2xl text-yellow-400 mt-4 p-2 bg-gray-700 rounded-lg shadow-md";
        translateText(" Temps restant: ").then((translated) => {
            timerDisplay.innerHTML = `⏳ ${translated} ${timeLeft} sec`;
        })
        container.appendChild(timerDisplay);

        const timerInterval = setInterval(() => {
            if (matchEnded || !state.localMatch) {
                clearInterval(timerInterval);
                return;
            }

            timeLeft--;
            translateText(" Temps restant: ").then((translated) => {
                timerDisplay.innerHTML = `⏳ ${translated} ${timeLeft} sec`;
            })

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endMatch(player1Score > player2Score ? state.localMatch.player1 : state.localMatch.player2);
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

    return Layout(container);
}
