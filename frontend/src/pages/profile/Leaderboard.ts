import { state } from "../../state";

export default function Leaderboard(): HTMLElement {
    const container = document.createElement("div");
    container.className = "bg-gray-900 text-white rounded-xl shadow-lg p-6 flex flex-col items-center w-full max-w-3xl mx-auto";

    const title = document.createElement("h2");
    title.innerText = "Leaderboard";
    title.className = "text-2xl font-bold mb-4";

    // Conteneur du podium
    const podiumContainer = document.createElement("div");
    podiumContainer.className = "relative flex justify-center items-end mb-6 w-full h-48";

    // Liste des joueurs sous le podium
    const leaderboardList = document.createElement("div");
    leaderboardList.className = "w-full flex flex-col space-y-2";

    async function fetchLeaderboard() {
        try {
            const response = await fetch("/api/leaderboard");
            const leaderboardData = await response.json();

            leaderboardList.innerHTML = "";

            // Positions du podium (ajustées pour mieux aligner)
            const podiumPositions = [
                "absolute top-4 left-1/2 transform -translate-x-1/2",  // 1er place
                "absolute top-12 left-1/3",  // 2e place
                "absolute top-16 right-1/3"  // 3e place
            ];
            const podiumWidths = ["w-20", "w-16", "w-16"];

            leaderboardData.slice(0, 3).forEach((player, index) => {
                const playerItem = document.createElement("div");
                playerItem.className = `flex flex-col items-center ${podiumPositions[index]}`;

                const avatar = document.createElement("img");
                avatar.src = player.avatar || "default-avatar.png";
                avatar.className = `rounded-full border-2 border-yellow-400 ${podiumWidths[index]}`;

                const rank = document.createElement("span");
                rank.innerText = `#${index + 1}`;
                rank.className = "text-lg font-bold mt-2";

                const username = document.createElement("span");
                username.innerText = player.username;
                username.className = "text-sm";

                const score = document.createElement("span");
                score.innerText = `${player.wins} Wins`;
                score.className = "text-sm";

                playerItem.append(avatar, rank, username, score);
                podiumContainer.appendChild(playerItem);
            });

            leaderboardData.slice(3, 6).forEach((player, index) => {
                const playerRow = document.createElement("div");
                playerRow.className = "flex items-center justify-between bg-gray-700 p-2 rounded-lg";

                const rank = document.createElement("span");
                rank.innerText = `#${index + 4}`;

                const username = document.createElement("span");
                username.innerText = player.username;

                const score = document.createElement("span");
                score.innerText = `${player.wins} Wins`;

                playerRow.append(rank, username, score);
                leaderboardList.appendChild(playerRow);
            });
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        }
    }

    fetchLeaderboard();

    container.append(title, podiumContainer, leaderboardList);
    return container;
}
