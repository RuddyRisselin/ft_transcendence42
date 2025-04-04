import { state } from "../../state";
import { translateText } from "../../translate";
import { getUsers, refreshUserCache } from "../../services/userService";

// Variables pour les traductions
let translatedTDS: string = "Classement";
let translatedWin: string = "Victoires";
let translatedError: string = "Erreur lors du chargement du classement";

export default async function Leaderboard(): Promise<HTMLElement> {
    // Initialiser les traductions
    [translatedTDS, translatedWin, translatedError] = await Promise.all([
        translateText("Classement"),
        translateText("Victoires"),
        translateText("Erreur lors du chargement du classement")
    ]);

    const container: HTMLDivElement = document.createElement("div");
    container.className = "bg-gray-800 text-white rounded-xl shadow-lg p-6 flex flex-col items-center w-full h-full";

    const title: HTMLHeadingElement = document.createElement("h2");
    title.innerText = translatedTDS;
    title.className = "text-2xl font-bold mb-8 text-center";

    const podiumContainer: HTMLDivElement = document.createElement("div");
    podiumContainer.className = "relative flex justify-center items-end mb-10 w-full h-64";

    const leadersContainer: HTMLDivElement = document.createElement("div");
    leadersContainer.className = "w-full max-w-lg mb-4";

    async function fetchLeaderboard() {
        try {
            // Vider les conteneurs avant de recharger
            podiumContainer.innerHTML = '';
            leadersContainer.innerHTML = '';

            // Récupérer tous les utilisateurs
            const users = await getUsers();
            
            // Trier les utilisateurs par nombre de victoires
            const leaderboardData = users
                .sort((a, b) => b.wins - a.wins)
                .slice(0, 6); // Prendre les 6 premiers

            // Afficher le podium (top 3)
            if (leaderboardData.length >= 3) {
                // Créer les podiums
                const podiumSteps = document.createElement("div");
                podiumSteps.className = "absolute bottom-0 left-0 right-0 flex justify-center items-end h-32";
                
                const step1 = document.createElement("div");
                step1.className = "w-32 h-32 bg-yellow-500/20 rounded-t-lg mx-2";
                
                const step2 = document.createElement("div");
                step2.className = "w-32 h-24 bg-gray-400/20 rounded-t-lg mx-2";
                
                const step3 = document.createElement("div");
                step3.className = "w-32 h-20 bg-orange-500/20 rounded-t-lg mx-2";
                
                podiumSteps.append(step2, step1, step3);

                // Position #1 (au milieu)
                const winner = leaderboardData[0];
                const winnerElement = createPodiumPlayer(winner, 1, "absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2", "120px");
                
                // Position #2 (à gauche)
                const second = leaderboardData[1];
                const secondElement = createPodiumPlayer(second, 2, "absolute left-1/4 transform -translate-x-1/2 translate-y-4", "100px");
                
                // Position #3 (à droite)
                const third = leaderboardData[2];
                const thirdElement = createPodiumPlayer(third, 3, "absolute right-1/4 transform translate-x-1/2 translate-y-8", "90px");
                
                podiumContainer.append(podiumSteps, winnerElement, secondElement, thirdElement);
            }

            // Afficher les joueurs #4-6 sous forme de liste
            leaderboardData.slice(3, 6).forEach((player, index) => {
                const rank = index + 4;
                const listItem = document.createElement("div");
                listItem.className = "flex items-center justify-between py-3 px-4 bg-gray-700/50 rounded-lg mb-2 hover:bg-gray-700 transition-colors";
                
                const leftSection = document.createElement("div");
                leftSection.className = "flex items-center gap-3";
                
                const rankElement = document.createElement("span");
                rankElement.innerText = `#${rank}`;
                rankElement.className = "text-gray-400 font-medium";
                
                const playerAvatar = document.createElement("img");
                playerAvatar.src = player.avatar || "http://localhost:3000/images/default.jpg";
                playerAvatar.className = "w-8 h-8 rounded-full border border-gray-600 object-cover";
                playerAvatar.onerror = () => {
                    playerAvatar.src = "http://localhost:3000/images/default.jpg";
                };
                
                const username = document.createElement("span");
                username.innerText = player.username;
                username.className = "text-white";
                
                leftSection.append(rankElement, playerAvatar, username);
                
                const wins = document.createElement("span");
                wins.innerText = `${player.wins} ${translatedWin}`;
                wins.className = "text-green-400 font-medium";
                
                listItem.append(leftSection, wins);
                leadersContainer.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            podiumContainer.innerHTML = `<p class='text-red-500'>${translatedError}</p>`;
        }
    }

    function createPodiumPlayer(player: any, position: number, positionClass: string, size: string): HTMLDivElement {
        const playerElement = document.createElement("div");
        playerElement.className = `flex flex-col items-center ${positionClass}`;
        
        // Conteneur de l'avatar avec bordure
        const avatarContainer = document.createElement("div");
        avatarContainer.className = `relative rounded-full border-4 
            ${position === 1 ? 'border-yellow-500' : position === 2 ? 'border-gray-400' : 'border-orange-500'}
            ${position === 1 ? 'bg-yellow-500/10' : position === 2 ? 'bg-gray-400/10' : 'bg-orange-500/10'}
            flex items-center justify-center`;
        avatarContainer.style.width = size;
        avatarContainer.style.height = size;
        
        // Badge de position (#1, #2, #3)
        const rankBadge = document.createElement("div");
        rankBadge.className = `absolute -top-2 -right-2 z-10 
            ${position === 1 ? 'bg-yellow-500' : position === 2 ? 'bg-gray-400' : 'bg-orange-500'} 
            rounded-full w-8 h-8 flex items-center justify-center text-gray-900 font-bold text-sm
            border-2 border-gray-800`;
        rankBadge.innerText = `#${position}`;
        
        // Avatar
        const avatar = document.createElement("img");
        avatar.src = player.avatar || "http://localhost:3000/images/default.jpg";
        avatar.className = "rounded-full object-cover";
        avatar.style.width = `calc(${size} - 16px)`;
        avatar.style.height = `calc(${size} - 16px)`;
        avatar.onerror = () => {
            avatar.src = "http://localhost:3000/images/default.jpg";
        };
        
        avatarContainer.append(avatar, rankBadge);
        
        // Nom d'utilisateur
        const username = document.createElement("span");
        username.innerText = player.username;
        username.className = "text-white font-semibold mt-2 text-center";
        
        // Nombre de victoires
        const winsCount = document.createElement("span");
        winsCount.innerText = `${player.wins} ${translatedWin}`;
        winsCount.className = "text-green-400 text-sm";
        
        playerElement.append(avatarContainer, username, winsCount);
        return playerElement;
    }

    // Rafraîchir le leaderboard toutes les 10 secondes
    const refreshInterval = setInterval(async () => {
        await refreshUserCache();
        await fetchLeaderboard();
    }, 10000);

    // Nettoyer l'intervalle quand le composant est démonté
    window.addEventListener('beforeunload', () => {
        clearInterval(refreshInterval);
    });

    // Charger le leaderboard initial
    await fetchLeaderboard();

    container.append(title, podiumContainer, leadersContainer);
    return container;
}
