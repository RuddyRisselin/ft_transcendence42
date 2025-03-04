import { state } from "../../state";

export default function MatchHistory(): HTMLElement {
    const history = document.createElement("div");
    history.className = "col-span-3 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col"; // Conteneur principal

    const historyTitle = document.createElement("h3");
    historyTitle.innerText = "Matches History";
    historyTitle.className = "text-lg font-bold text-white mb-2";

    const historyContainer = document.createElement("div");
    historyContainer.className = "flex flex-col gap-2 overflow-y-scroll max-h-80"; 
    // `max-h-80` = Hauteur fixe équivalente à ~6 matchs (ajuster si besoin)
    // `overflow-y-scroll` = Scroll si plus de 6 matchs

    async function fetchMatchHistory() {
        try {
            const response = await fetch(`/api/matches?userId=${state.user.id}`);
            const matches = await response.json();
            
            if (!Array.isArray(matches) || matches.length === 0) {
                historyContainer.innerHTML = "<p class='text-white'>No matches found.</p>";
                return;
            }

            historyContainer.innerHTML = "";

            matches.forEach(match => {
                const matchItem = document.createElement("div");
                const isWinner = match.winner_name === state.user.username;
                matchItem.className = `p-2 rounded-lg text-white text-sm flex items-center space-x-2 ${isWinner ? "bg-blue-600" : "bg-red-600"}`;

                const player1Avatar = document.createElement("img");
                player1Avatar.src = match.player1_avatar || "default-avatar.png";
                player1Avatar.className = "w-8 h-8 rounded-full border-2 border-white";

                const player2Avatar = document.createElement("img");
                player2Avatar.src = match.player2_avatar || "default-avatar.png";
                player2Avatar.className = "w-8 h-8 rounded-full border-2 border-white";

                const matchText = document.createElement("span");
                matchText.innerText = `${new Date(match.played_at).toLocaleDateString()} - ${match.player1_name} VS ${match.player2_name} → Winner: ${match.winner_name}`;

                matchItem.append(player1Avatar, matchText, player2Avatar);
                historyContainer.appendChild(matchItem);
            });

        } catch (error) {
            console.error("Error fetching match history:", error);
            historyContainer.innerHTML = "<p class='text-red-500'>Error loading matches.</p>";
        }
    }

    fetchMatchHistory();
    history.append(historyTitle, historyContainer);

    return history;
}
