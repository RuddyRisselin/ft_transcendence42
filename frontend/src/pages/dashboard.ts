import { state } from "../state";
import { connectToWebSocket } from "../services/auth";
import { navigateTo } from "../router";
import Sidebar from "../components/sidebar";

export default function Dashboard(): HTMLElement {
    if (!state.user) {
        console.log("❌ Utilisateur non connecté. Redirection...");
        setTimeout(() => {
            if (!state.user) {
                navigateTo(new Event("click"), "/login");
            }
        }, 200);
        return document.createElement("div");
    }

    const container = document.createElement("div");
    container.className = "flex flex-col items-center min-h-screen bg-black text-white relative overflow-hidden";
    
    container.innerHTML = `
    <div class="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
    <div class="absolute inset-0 bg-stars animate-twinkling"></div>
    `;

    if (state.user) {
        document.body.appendChild(Sidebar());
    }

    const mainSection = document.createElement("div");
    mainSection.className = "relative z-10 flex w-full h-screen pl-[250px]";

    // Section centrale (modes de jeu)
    const gameSection = document.createElement("div");
    gameSection.className = "flex-1 p-8 overflow-y-auto custom-scrollbar";

    const gameSectionTitle = document.createElement("h2");
    gameSectionTitle.className = "text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-12";
    gameSectionTitle.innerText = "🎮 Modes de Jeu";

    // Conteneur pour les cartes de jeu
    const gameCardsContainer = document.createElement("div");
    gameCardsContainer.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto";

    // Mode Local 1v1
    const localGameCard = document.createElement("div");
    localGameCard.className = "game-card bg-gray-800/50 p-8 rounded-xl shadow-lg backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/50 transition-all transform hover:scale-105 group";
    
    localGameCard.innerHTML = `
        <div class="flex flex-col h-full text-center">
            <h3 class="text-3xl font-semibold text-blue-300 mb-6 group-hover:text-blue-200 transition-colors">
                <span class="game-icon">🎮</span> Local 1v1
            </h3>
            <p class="text-gray-300 mb-8 text-lg game-card-text">Affrontez un ami en local sur le même écran dans un duel épique de Pong !</p>
            <button class="game-button w-full bg-blue-600 hover:bg-blue-500 text-white text-xl font-semibold py-6 px-8 rounded-lg transition-all transform hover:scale-105 hover:shadow-xl">
                Jouer maintenant
            </button>
        </div>
    `;

    // Mode Local vs IA
    const localAICard = document.createElement("div");
    localAICard.className = "game-card bg-gray-800/50 p-8 rounded-xl shadow-lg backdrop-blur-sm border border-green-500/20 hover:border-green-500/50 transition-all transform hover:scale-105 group";
    localAICard.setAttribute("data-mode", "ai");
    
    localAICard.innerHTML = `
        <div class="flex flex-col h-full text-center">
            <h3 class="text-3xl font-semibold text-green-300 mb-6 group-hover:text-green-200 transition-colors">
                <span class="game-icon">🤖</span> Local vs IA
            </h3>
            <p class="text-gray-300 mb-8 text-lg game-card-text">Défiez notre IA dans un match de Pong et testez vos compétences !</p>
            <button class="game-button w-full bg-green-600 hover:bg-green-500 text-white text-xl font-semibold py-6 px-8 rounded-lg transition-all transform hover:scale-105 hover:shadow-xl">
                Jouer contre l'IA
            </button>
        </div>
    `;

    // Mode Tournoi
    const tournamentCard = document.createElement("div");
    tournamentCard.className = "game-card bg-gray-800/50 p-8 rounded-xl shadow-lg backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/50 transition-all transform hover:scale-105 group";
    
    tournamentCard.innerHTML = `
        <div class="flex flex-col h-full text-center">
            <h3 class="text-3xl font-semibold text-purple-300 mb-6 group-hover:text-purple-200 transition-colors">
                <span class="game-icon">🏆</span> Tournoi
            </h3>
            <p class="text-gray-300 mb-8 text-lg game-card-text">Participez à un tournoi épique et prouvez que vous êtes le meilleur joueur de Pong !</p>
            <button class="game-button w-full bg-purple-600 hover:bg-purple-500 text-white text-xl font-semibold py-6 px-8 rounded-lg transition-all transform hover:scale-105 hover:shadow-xl">
                Rejoindre un tournoi
            </button>
        </div>
    `;

    gameCardsContainer.append(localGameCard, localAICard, tournamentCard);
    gameSection.append(gameSectionTitle, gameCardsContainer);
    mainSection.appendChild(gameSection);
    container.appendChild(mainSection);

    // Gestionnaires de clic pour les boutons
    const localPlayButton = localGameCard.querySelector('button');
    if (localPlayButton) {
        localPlayButton.onclick = (e) => navigateTo(e, "/local-match");
    }

    const localAIButton = localAICard.querySelector('button');
    if (localAIButton) {
        localAIButton.onclick = (e) => navigateTo(e, "/local-ai-match");
    }

    const tournamentButton = tournamentCard.querySelector('button');
    if (tournamentButton) {
        tournamentButton.onclick = (e) => navigateTo(e, "/tournament");
    }

    return container;
}
