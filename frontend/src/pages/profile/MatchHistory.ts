import { state } from "../../state";

export default function MatchHistory(): HTMLElement {
    const container = document.createElement("div");
    container.className = "bg-gray-800 text-white rounded-xl shadow-lg p-6 flex flex-col h-full";

    const title = document.createElement("h2");
    title.innerText = "History";
    title.className = "text-2xl font-bold mb-4 text-center";

    let activeTab: "matches" | "tournaments" = "matches";

    const tabsContainer = document.createElement("div");
    tabsContainer.className = "flex space-x-2 mb-4 justify-center";

    const tabMatches = document.createElement("button");
    tabMatches.innerText = "Matchs";
    tabMatches.className = "px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold";

    const tabTournaments = document.createElement("button");
    tabTournaments.innerText = "Tournois";
    tabTournaments.className = "px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold";

    const historyContainer = document.createElement("div");
    historyContainer.className = "flex flex-col gap-2 overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-gray-700";

    if (!state.user || !state.user.id) {
        historyContainer.innerHTML = "<p class='text-red-500 text-center py-4'>Utilisateur non authentifié.</p>";
        return container;
    }

    tabMatches.addEventListener("click", () => {
        if (activeTab !== "matches") {
            activeTab = "matches";
            tabMatches.classList.remove("bg-gray-700");
            tabMatches.classList.add("bg-blue-600");
            tabTournaments.classList.remove("bg-blue-600");
            tabTournaments.classList.add("bg-gray-700");
            historyContainer.innerHTML = "";
            fetchMatchHistory();
        }
    });

    tabTournaments.addEventListener("click", () => {
        if (activeTab !== "tournaments") {
            activeTab = "tournaments";
            tabTournaments.classList.remove("bg-gray-700");
            tabTournaments.classList.add("bg-blue-600");
            tabMatches.classList.remove("bg-blue-600");
            tabMatches.classList.add("bg-gray-700");
            historyContainer.innerHTML = "";
            fetchTournamentHistory();
        }
    });

    async function fetchMatchHistory() {
        try {
            historyContainer.innerHTML = "<p class='text-white text-center py-2'>Chargement...</p>";
            const response = await fetch(`/api/matches?userId=${state.user.id}`);
            if (!response.ok) throw new Error("Erreur API");
            const matches = await response.json();

            historyContainer.innerHTML = "";
            if (!Array.isArray(matches) || matches.length === 0) {
                historyContainer.innerHTML = "<p class='text-white text-center py-4'>Aucun match trouvé.</p>";
                return;
            }

            matches.forEach(match => {
                const isWinner = match.winner_name === state.user.username;
                const matchItem = document.createElement("div");
                matchItem.className = `p-3 rounded-lg flex flex-col ${isWinner ? "bg-blue-600" : "bg-red-600"}`;

                const matchDate = new Date(match.played_at).toLocaleDateString();
                
                const matchHeader = document.createElement("div");
                matchHeader.className = "flex justify-between items-center";
                
                const dateSpan = document.createElement("span");
                dateSpan.innerText = matchDate;
                dateSpan.className = "text-xs text-white opacity-80";
                
                const matchResult = document.createElement("span");
                matchResult.innerText = isWinner ? "Winner: you" : `Winner: ${match.winner_name}`;
                matchResult.className = "text-xs font-semibold";
                
                matchHeader.append(dateSpan, matchResult);
                
                const matchPlayers = document.createElement("div");
                matchPlayers.className = "text-sm font-medium mt-1";
                matchPlayers.innerText = `${match.player1_name} VS ${match.player2_name}`;
                
                matchItem.append(matchHeader, matchPlayers);
                historyContainer.appendChild(matchItem);
            });
        } catch (error) {
            historyContainer.innerHTML = "<p class='text-red-500 text-center py-4'>Erreur de chargement des matchs.</p>";
        }
    }

    async function fetchTournamentHistory(): Promise<void> {
        try {
            historyContainer.innerHTML = "<p class='text-white'>Chargement...</p>";
    
            const response = await fetch(`/api/tournaments?userId=${state.user.id}`);
            if (!response.ok) throw new Error("Erreur API");
    
            const tournaments: { 
                id: number; 
                created_at: string; 
                players: string | number[] | string[]; 
                ranking: string | number[] | string[] | null 
            }[] = await response.json();
    
            historyContainer.innerHTML = "";
            if (!Array.isArray(tournaments) || tournaments.length === 0) {
                historyContainer.innerHTML = "<p class='text-white'>Aucun tournoi trouvé.</p>";
                return;
            }
    
            const allPlayerIds = new Set<number>();
            tournaments.forEach(tournament => {
                const players = typeof tournament.players === "string" 
                    ? JSON.parse(tournament.players) 
                    : tournament.players;
                
                players.forEach(player => {
                    if (typeof player === "number") {
                        allPlayerIds.add(player);
                    }
                });
            });
    
            const userMap = new Map<number, string>();
            
            if (allPlayerIds.size > 0) {
                try {
                    const userResponse = await fetch(`/api/users?ids=${Array.from(allPlayerIds).join(",")}`);
                    if (userResponse.ok) {
                        const users: { id: number; username: string }[] = await userResponse.json();
                        users.forEach(user => userMap.set(user.id, user.username));
                    }
                } catch (error) {
                    console.error("Erreur lors de la récupération des noms des joueurs", error);
                }
            }
    
            tournaments.forEach(tournament => {
                const tournamentItem = document.createElement("div");
                tournamentItem.className = "p-3 rounded-lg text-white text-sm flex flex-col bg-gray-900 border border-gray-700 shadow-lg";
    
                const date = new Date(tournament.created_at).toLocaleDateString();
    
                const players = typeof tournament.players === "string"
                    ? JSON.parse(tournament.players)
                    : tournament.players;
    
                const ranking = tournament.ranking 
                    ? (typeof tournament.ranking === "string" ? JSON.parse(tournament.ranking) : tournament.ranking)
                    : null;
    
                const playerNames = players.map(player => {
                    if (typeof player === "number") {
                        return userMap.get(player) || "Inconnu";
                    } else {
                        return player;
                    }
                });
    
                let positionText = "Non classé";
                let positionColor = "bg-gray-600";
                
                if (ranking && Array.isArray(ranking)) {
                    const username = state.user.username;
                    let userEntry: string | null = null;
                    
                    for (let i = 0; i < ranking.length; i++) {
                        const entry = String(ranking[i]);
                        if (entry === username || entry.indexOf(` ${username}`) >= 0 || entry.endsWith(username)) {
                            userEntry = entry;
                            break;
                        }
                    }
                    
                    if (userEntry) {
                        if (userEntry.indexOf("🏆") >= 0) {
                            positionText = "🏆 1er";
                            positionColor = "bg-yellow-500";
                        } else if (userEntry.indexOf("🥈") >= 0) {
                            positionText = "🥈 2e";
                            positionColor = "bg-gray-400";
                        } else if (userEntry.indexOf("🥉") >= 0) {
                            positionText = "🥉 3e";
                            positionColor = "bg-orange-500";
                        } else {
                            const position = Math.floor(ranking.indexOf(userEntry) / (players.length / 4)) + 4;
                            positionText = `${position}ème`;
                            positionColor = "bg-gray-700";
                        }
                    }
                }
    
                tournamentItem.innerHTML = `
                    <p class="font-bold text-lg text-blue-400">Tournoi n°${tournament.id} du ${date}</p>
                    <p class="text-sm text-gray-300">Joueurs : ${playerNames.join(", ")}</p>
                    <div class="mt-2 p-2 rounded-lg text-center text-black font-bold ${positionColor}">
                        ${positionText}
                    </div>
                `;
    
                historyContainer.appendChild(tournamentItem);
            });
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des tournois :", error);
            historyContainer.innerHTML = "<p class='text-red-500'>Erreur de chargement des tournois.</p>";
        }
    }
    fetchMatchHistory();

    tabsContainer.append(tabMatches, tabTournaments);
    container.append(title, tabsContainer, historyContainer);

    return container;
}
