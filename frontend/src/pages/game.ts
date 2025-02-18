import Layout from "../components/layout";
import { startGame, setupWebSocket } from "../game/engine";
import { setupControls } from "../game/controls";
import { paddle1, paddle2, canvasHeight } from "../game/objects";

export default function Game() {
    const container = document.createElement("div");
    container.className = "flex flex-col items-center justify-center w-full h-screen bg-gray-900 text-white p-4";

    const title = document.createElement("h1");
    title.className = "text-4xl font-bold mb-6";
    title.innerText = "🏓 Recherche d'un match...";

    const gameContainer = document.createElement("div");
    gameContainer.className = "relative flex flex-col items-center justify-center w-full max-w-4xl h-[600px] bg-gray-800 border-4 border-gray-700 rounded-lg shadow-lg";

    const gameCanvas = document.createElement("canvas");
    gameCanvas.width = 1000;
    gameCanvas.height = 500;
    gameCanvas.className = "w-full h-auto max-w-full border-4 border-white rounded-md";

    gameContainer.appendChild(gameCanvas);
    container.appendChild(title);
    container.appendChild(gameContainer);

    // 🔍 Vérifier si `userId` et `matchId` sont bien stockés
    const userId = localStorage.getItem("userId");
    const matchId = localStorage.getItem("matchId");

    console.log("🔍 Tentative de connexion WebSocket avec :", { userId, matchId });

    if (!userId || !matchId) {
        console.error("❌ userId ou matchId manquant, impossible de rejoindre la partie.");
        return Layout(container);
    }

    // ✅ Gestion de la reconnexion WebSocket
    let reconnectAttempts = 0;
    const maxReconnects = 5;
    let socket: WebSocket | null = null;

    function connectWebSocket() {
        if (reconnectAttempts >= maxReconnects) {
            console.error("❌ Trop de tentatives de connexion WebSocket. Arrêt.");
            return;
        }

        socket = new WebSocket(`ws://localhost:3000/ws?userId=${userId}&matchId=${matchId}`);

        socket.onopen = () => {
            console.log("✅ Connecté au serveur WebSocket en tant que :", userId);
            reconnectAttempts = 0; // Reset des tentatives
        };

        socket.onmessage = (event) => {
            console.log("📥 Message WebSocket reçu :", JSON.parse(event.data));
        };

        socket.onclose = () => {
            console.warn("⚠️ Déconnecté du WebSocket. Tentative de reconnexion...");
            reconnectAttempts++;
            setTimeout(connectWebSocket, 2000); // Réessayer après 2 secondes
        };

        socket.onerror = (error) => {
            console.error("❌ Erreur WebSocket:", error);
        };

        setTimeout(() => {
            if (socket) {  // ✅ Vérifie que socket est bien défini
                startGame(gameCanvas, socket);
                setupControls(paddle1, paddle2, gameCanvas.height, socket);
                setupWebSocket(socket);
            } else {
                console.error("❌ WebSocket non initialisé !");
            }
        }, 500);
    }

    connectWebSocket();

    return Layout(container);
}
