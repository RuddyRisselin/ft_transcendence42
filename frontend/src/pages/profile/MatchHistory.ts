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
            historyContainer.innerHTML = "<p class='text-white text-center py-2'>Chargement...</p>";
    
            const response = await fetch(`/api/tournaments?userId=${state.user.id}`);
            if (!response.ok) throw new Error("Erreur API");
    
            const tournaments: { 
                id: number; 
                created_at: string; 
                players: string | number[]; 
                ranking: string | number[] | null 
            }[] = await response.json();
    
            historyContainer.innerHTML = "";
            if (!Array.isArray(tournaments) || tournaments.length === 0) {
                historyContainer.innerHTML = "<p class='text-white text-center py-4'>Aucun tournoi trouvé.</p>";
                return;
            }
    
            const allPlayerIds = new Set<number>();
            tournaments.forEach(tournament => {
                const players = typeof tournament.players === "string" 
                    ? JSON.parse(tournament.players) 
                    : tournament.players;
                players.forEach(playerId => allPlayerIds.add(playerId));
            });
    
            const userResponse = await fetch(`/api/users?ids=${Array.from(allPlayerIds).join(",")}`);
            if (!userResponse.ok) throw new Error("Erreur lors de la récupération des noms des joueurs");
    
            const users: { id: number; username: string }[] = await userResponse.json();
            const userMap = new Map(users.map(user => [user.id, user.username]));
    
            tournaments.forEach(tournament => {
                const tournamentItem = document.createElement("div");
                tournamentItem.className = "p-3 rounded-lg text-white flex flex-col bg-gray-700 border border-gray-600 shadow-md";
    
                const date = new Date(tournament.created_at).toLocaleDateString();
    
                const players = typeof tournament.players === "string"
                    ? JSON.parse(tournament.players)
                    : tournament.players;
    
                const ranking = tournament.ranking 
                    ? (typeof tournament.ranking === "string" ? JSON.parse(tournament.ranking) : tournament.ranking)
                    : null;
    
                const playerNames = players.map(playerId => userMap.get(playerId) || "Inconnu");
    
                let userPosition = ranking ? ranking.indexOf(state.user.id) + 1 : null;
                let positionText = "Non classé";
                let positionColor = "bg-gray-600";
    
                if (userPosition) {
                    switch (userPosition) {
                        case 1:
                            positionText = "🏆 1er";
                            positionColor = "bg-yellow-500";
                            break;
                        case 2:
                            positionText = "🥈 2e";
                            positionColor = "bg-gray-400";
                            break;
                        case 3:
                            positionText = "🥉 3e";
                            positionColor = "bg-orange-500";
                            break;
                        default:
                            positionText = `${userPosition}ème`;
                            positionColor = "bg-gray-700";
                            break;
                    }
                }
    
                const tournamentHeader = document.createElement("div");
                tournamentHeader.className = "flex justify-between items-center mb-2";
                
                const tournamentTitle = document.createElement("span");
                tournamentTitle.innerHTML = `Tournoi n°${tournament.id}`;
                tournamentTitle.className = "font-bold text-blue-400";
                
                const tournamentDate = document.createElement("span");
                tournamentDate.innerText = date;
                tournamentDate.className = "text-xs text-gray-300";
                
                tournamentHeader.append(tournamentTitle, tournamentDate);
                
                const playersList = document.createElement("div");
                playersList.className = "text-xs text-gray-300 mb-2";
                playersList.innerText = `Joueurs : ${playerNames.join(", ")}`;
                
                const positionBadge = document.createElement("div");
                positionBadge.className = `mt-1 p-1 rounded-lg text-center text-xs font-bold ${positionColor}`;
                positionBadge.innerText = positionText;
                
                tournamentItem.append(tournamentHeader, playersList, positionBadge);
                historyContainer.appendChild(tournamentItem);
            });
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des tournois :", error);
            historyContainer.innerHTML = "<p class='text-red-500 text-center py-4'>Erreur de chargement des tournois.</p>";
        }
    }
    
    fetchMatchHistory();

    tabsContainer.append(tabMatches, tabTournaments);
    container.append(title, tabsContainer, historyContainer);

    return container;
}
