import { state } from "../../state";
import { translateText } from "../../translate";

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

    const podiumContainer: HTMLDivElement = document.createElement("div");
    podiumContainer.className = "relative flex justify-center items-end mb-10 w-full h-48";

    const leadersContainer: HTMLDivElement = document.createElement("div");
    leadersContainer.className = "w-full max-w-lg mb-4";

    async function fetchLeaderboard() {
        try {
            const response: Response = await fetch("/api/leaderboard");
            const leaderboardData = await response.json();

            // Afficher le podium (top 3)
            if (leaderboardData.length >= 3) {
                // Position #1 (au milieu)
                const winner = leaderboardData[0];
                const winnerElement: HTMLDivElement = createPodiumPlayer(winner, 1, "absolute top-0 left-1/2 transform -translate-x-1/2", "w-24 h-24");
                
                // Position #2 (à gauche)
                const second = leaderboardData[1];
                const secondElement: HTMLDivElement = createPodiumPlayer(second, 2, "absolute top-10 left-1/4 transform -translate-x-1/2", "w-20 h-20");
                
                // Position #3 (à droite)
                const third = leaderboardData[2];
                const thirdElement: HTMLDivElement = createPodiumPlayer(third, 3, "absolute top-12 right-1/4 transform translate-x-1/2", "w-18 h-18");
                
                podiumContainer.append(winnerElement, secondElement, thirdElement);
            }

            // Afficher les joueurs #4-6 sous forme de liste
            leaderboardData.slice(3, 6).forEach((player, index) => {
                const rank = index + 4;
                const listItem: HTMLDivElement = document.createElement("div");
                listItem.className = "flex items-center justify-between py-3 px-4 bg-gray-700 rounded-lg mb-2";
                
                const rankElement: HTMLSpanElement = document.createElement("span");
                rankElement.innerHTML = `#${rank}`;
                rankElement.className = "text-gray-400";
                
                const username: HTMLSpanElement = document.createElement("span");
                username.innerHTML = player.username;
                username.className = "flex-grow mx-4";
                
                const wins: HTMLSpanElement = document.createElement("span");
                wins.innerHTML = `${player.wins} ${translatedWin}`;
                wins.className = "text-green-400";
                
                listItem.append(rankElement, username, wins);
                leadersContainer.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            podiumContainer.innerHTML = `<p class='text-red-500'>${translatedError}</p>`;
        }
    }

    function createPodiumPlayer(player, position, positionClass, imgSize)
    {
        const playerElement: HTMLDivElement = document.createElement("div");
        playerElement.className = `flex flex-col items-center ${positionClass}`;
        
        const rankBadge: HTMLDivElement = document.createElement("div");
        rankBadge.className = `absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 
            ${position === 1 ? 'bg-yellow-500' : position === 2 ? 'bg-gray-400' : 'bg-orange-500'} 
            rounded-full w-8 h-8 flex items-center justify-center text-gray-900 font-bold text-xs`;
        rankBadge.innerHTML = `#${position}`;
        
        const avatar: HTMLImageElement = document.createElement("img");
        avatar.src = player.avatar ? "http://localhost:3000/images/" + player.avatar : "http://localhost:3000/images/default.jpg";
        avatar.className = `${imgSize} rounded-full border-2 
            ${position === 1 ? 'border-yellow-500' : position === 2 ? 'border-gray-400' : 'border-orange-500'}`;
        
        const username: HTMLSpanElement = document.createElement("span");
        username.innerHTML = player.username;
        username.className = "text-sm mt-2 font-semibold";
        
        const winsCount: HTMLSpanElement = document.createElement("span");
        winsCount.innerHTML = `${player.wins} ${translatedWin}`;
        winsCount.className = "text-xs text-green-400";
        
        playerElement.append(rankBadge, avatar, username, winsCount);
        return playerElement;
    }

    fetchLeaderboard();

    container.append(title, podiumContainer, leadersContainer);
    return container;
}
