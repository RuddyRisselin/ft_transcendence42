import { state } from "../../state";
import { translateText } from "../../translate";
import { getUserById } from "../../services/userService";

export default async function Leaderboard(): Promise<HTMLElement> {

    const textToTranslate: string[] = [
    "Classement",
    "Victoires",
    "Erreur lors du chargement du classement"
    ];
    const [
        translatedTDS,
        translatedWin,
        translatedError
    ] = await Promise.all(textToTranslate.map(text => translateText(text)));


    const container: HTMLDivElement = document.createElement("div");
    container.className = "bg-gray-800 text-white rounded-xl shadow-lg p-6 flex flex-col items-center w-full h-full";

    const title: HTMLHeadingElement = document.createElement("h2");
    title.innerHTML = `${translatedTDS}`;
    title.className = "text-2xl font-bold mb-8 text-center";

    // const podiumContainer = document.createElement("div");
    // podiumContainer.className = "relative flex justify-center items-end mb-10 w-full h-64";
    const podiumContainer: HTMLDivElement = document.createElement("div");
    podiumContainer.className = "relative flex justify-center items-end mb-10 w-full h-48";

    const leadersContainer: HTMLDivElement = document.createElement("div");
    leadersContainer.className = "w-full max-w-lg mb-4";

    async function fetchLeaderboard() {
        try {
            const response = await fetch("http://localhost:3000/leaderboard");
            let leaderboardData = await response.json();

            // Récupérer les détails complets de chaque utilisateur
            const userPromises = leaderboardData.map(async (player: any) => {
                const userDetails = await getUserById(player.id);
                return {
                    ...player,
                    avatar: userDetails?.avatar || null
                };
            });

            leaderboardData = await Promise.all(userPromises);

            // Afficher le podium (top 3)
            if (leaderboardData.length >= 3) {
                // Position #1 (au milieu)
                const winner = leaderboardData[0];
                const winnerElement = createPodiumPlayer(winner, 1, "absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2", "120px");
                
                // Position #2 (à gauche)
                const second = leaderboardData[1];
                const secondElement = createPodiumPlayer(second, 2, "absolute left-1/4 transform -translate-x-1/2 translate-y-4", "100px");
                
                // Position #3 (à droite)
                const third = leaderboardData[2];
                const thirdElement = createPodiumPlayer(third, 3, "absolute right-1/4 transform translate-x-1/2 translate-y-8", "90px");
                
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
                podiumContainer.append(podiumSteps, winnerElement, secondElement, thirdElement);
            }

            // Afficher les joueurs #4-6 sous forme de liste
            leaderboardData.slice(3, 6).forEach((player, index) => {
                const rank = index + 4;
                const listItem = document.createElement("div");
                listItem.className = "flex items-center justify-between py-3 px-4 bg-gray-700/50 rounded-lg mb-2 hover:bg-gray-700 transition-colors";
                
                const leftSection = document.createElement("div");
                leftSection.className = "flex items-center gap-3";
                
                const rankElement: HTMLSpanElement = document.createElement("span");
                rankElement.innerHTML = `#${rank}`;
                rankElement.className = "text-gray-400 font-medium";
                
                const playerAvatar = document.createElement("img");
                playerAvatar.src = player.avatar ? `http://localhost:3000/images/${player.avatar}` : "http://localhost:3000/images/default.jpg";
                playerAvatar.className = "w-8 h-8 rounded-full border border-gray-600";
                
                const username: HTMLSpanElement = document.createElement("span");
                username.innerHTML = player.username;
                username.className = "text-white";
                
                leftSection.append(rankElement, playerAvatar, username);
                
                const wins: HTMLSpanElement = document.createElement("span");
                wins.innerHTML = `${player.wins} ${translatedWin}`;
                wins.className = "text-green-400 font-medium";
                
                listItem.append(leftSection, wins);
                leadersContainer.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            podiumContainer.innerHTML = `<p class='text-red-500'>${translatedError}</p>`;
        }
    }

    function createPodiumPlayer(player, position, positionClass, size) {
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
        rankBadge.innerHTML = `#${position}`;
        
        // Avatar
        const avatar = document.createElement("img");
        avatar.src = player.avatar ? `http://localhost:3000/images/${player.avatar}` : "http://localhost:3000/images/default.jpg";
        avatar.className = "rounded-full object-cover";
        avatar.style.width = `calc(${size} - 16px)`;
        avatar.style.height = `calc(${size} - 16px)`;
        
        avatarContainer.append(avatar, rankBadge);
        
        const username: HTMLSpanElement = document.createElement("span");
        username.innerHTML = player.username;
        username.className = "text-white font-semibold mt-2 text-center";
        
        const winsCount: HTMLSpanElement = document.createElement("span");
        winsCount.innerHTML = `${player.wins} ${translatedWin}`;
        winsCount.className = "text-green-400 text-sm";
        
        playerElement.append(avatarContainer, username, winsCount);
        return playerElement;
    }

    fetchLeaderboard();

    container.append(title, podiumContainer, leadersContainer);
    return container;
}
