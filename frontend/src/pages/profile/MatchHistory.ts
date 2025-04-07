import { state } from "../../state";
import { translateText } from "../../translate";

export default async function MatchHistory(userId?: number): Promise<HTMLElement> {

        const textsToTranslate: string[] = [
            "Historique",
            "Matchs",
            "Tournoi",
            "Utilisateur non authentifié.",
            "Chargement...",
            "Aucun match trouvé.",
            "Gagnant: toi",
            "Gagnant",
            "Erreur de chargement des matchs.",
            "Aucun tournoi trouvé.",
            "Non classé",
            "ème",
            "du",
            "Erreur de chargement des tournois."

        
        ];
    
        const [
            translatedHistory,
            translatedMatchs,
            translatedTournament,
            translatedUserNotAuthentificate,
            translatedLoading,
            translatedMatchNotFound,
            translatedYouWin,
            translatedWin,
            translatedErrorLoadingMatches,
            translatedTournamentNotFound,
            translateUnclassified,
            translatedPos,
            translatedOf,
            translatedErrorLoadingTournament
        ] = await Promise.all(textsToTranslate.map(text => translateText(text)));

    const container: HTMLDivElement = document.createElement("div");
    container.className = "bg-gray-800 text-white rounded-xl shadow-lg p-6 flex flex-col h-full";

    const title: HTMLHeadingElement = document.createElement("h2");
    title.innerHTML = translatedHistory;
    title.className = "text-2xl font-bold mb-4 text-center";

    let activeTab: "matches" | "tournaments" = "matches";

    const tabsContainer: HTMLDivElement = document.createElement("div");
    tabsContainer.className = "flex space-x-2 mb-4 justify-center";

    const tabMatches: HTMLButtonElement = document.createElement("button");
    tabMatches.innerHTML = translatedMatchs;
    tabMatches.className = "px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold";

    const tabTournaments: HTMLButtonElement = document.createElement("button");
    tabTournaments.innerHTML = translatedTournament;
    tabTournaments.className = "px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold";

    const historyContainer: HTMLDivElement = document.createElement("div");
    historyContainer.className = "flex flex-col gap-2 overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-gray-700";

    const targetUserId = userId || state.user?.id;
    if (!targetUserId) {
        historyContainer.innerHTML = `<p class='text-red-500 text-center py-4'>${translatedUserNotAuthentificate}</p>`;
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
            historyContainer.innerHTML = `<p class='text-white text-center py-2'>${translatedLoading}</p>`;
            const response: Response = await fetch(`/api/matches?userId=${targetUserId}`);
            if (!response.ok) throw new Error("Erreur API");
            const matches = await response.json();

            historyContainer.innerHTML = "";
            if (!Array.isArray(matches) || matches.length === 0) {
                historyContainer.innerHTML = `<p class='text-white text-center py-4'>${translatedMatchNotFound}</p>`;
                return;
            }

            matches.forEach(match => {
                const isWinner: boolean = match.winner_name === (userId ? match.player1_name === userId ? match.player1_name : match.player2_name : state.user.username);
                const matchItem: HTMLDivElement = document.createElement("div");
                matchItem.className = `p-3 rounded-lg flex flex-col ${isWinner ? "bg-blue-600" : "bg-red-600"}`;

                const matchDate: string = new Date(match.played_at).toLocaleDateString();
                
                const matchHeader: HTMLDivElement = document.createElement("div");
                matchHeader.className = "flex justify-between items-center";
                
                const dateSpan: HTMLSpanElement = document.createElement("span");
                dateSpan.innerHTML = matchDate;
                dateSpan.className = "text-xs text-white opacity-80";
                
                const matchResult: HTMLSpanElement = document.createElement("span");
                matchResult.innerHTML = isWinner ? translatedYouWin : `${translatedWin}: ${match.winner_name}`;
                matchResult.className = "text-xs font-semibold";
                
                matchHeader.append(dateSpan, matchResult);
                
                const matchPlayers: HTMLDivElement = document.createElement("div");
                matchPlayers.className = "text-sm font-medium mt-1";
                matchPlayers.innerHTML = `${match.player1_name} VS ${match.player2_name}`;
                
                matchItem.append(matchHeader, matchPlayers);
                historyContainer.appendChild(matchItem);
            });
        } catch (error) {
            historyContainer.innerHTML = `<p class='text-red-500 text-center py-4'>${translatedErrorLoadingMatches}</p>`;
        }
    }

    async function fetchTournamentHistory(): Promise<void> {
        try {
            historyContainer.innerHTML = `<p class='text-white'>${translatedLoading}</p>`;
    
            const response: Response = await fetch(`/api/tournaments?userId=${targetUserId}`);
            if (!response.ok) throw new Error("Erreur API");
    
            const tournaments: { 
                id: number; 
                created_at: string; 
                players: string | number[] | string[]; 
                ranking: string | number[] | string[] | null 
            }[] = await response.json();
    
            historyContainer.innerHTML = "";
            if (!Array.isArray(tournaments) || tournaments.length === 0) {
                historyContainer.innerHTML = `<p class='text-white'>${translatedTournamentNotFound}</p>`;
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
                    const userResponse: Response = await fetch(`/api/users?ids=${Array.from(allPlayerIds).join(",")}`);
                    if (userResponse.ok) {
                        const users: { id: number; username: string }[] = await userResponse.json();
                        users.forEach(user => userMap.set(user.id, user.username));
                    }
                } catch (error) {
                    console.error("Erreur lors de la récupération des noms des joueurs", error);
                }
            }
    
            tournaments.forEach(tournament => {
                const tournamentItem: HTMLDivElement = document.createElement("div");
                tournamentItem.className = "p-3 rounded-lg text-white text-sm flex flex-col bg-gray-900 border border-gray-700 shadow-lg";
    
                const date: string = new Date(tournament.created_at).toLocaleDateString();
    
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
    
                let positionText = translateUnclassified;
                let positionColor = "bg-gray-600";
                
                if (ranking && Array.isArray(ranking)) {
                    const username = userId ? userMap.get(userId) : state.user.username;
                    let userEntry: string | null = null;
                    
                    for (let i = 0; i < ranking.length; i++) {
                        const entry: string = String(ranking[i]);
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
                            const position: number = Math.floor(ranking.indexOf(userEntry) / (players.length / 4)) + 4;
                            positionText = `${position}${translatedPos}`;
                            positionColor = "bg-gray-700";
                        }
                    }
                }
    
                tournamentItem.innerHTML = `
                    <p class="font-bold text-lg text-blue-400">${translatedTournament} n°${tournament.id} ${translatedOf} ${date}</p>
                    <p class="text-sm text-gray-300">Joueurs : ${playerNames.join(", ")}</p>
                    <div class="mt-2 p-2 rounded-lg text-center text-black font-bold ${positionColor}">
                        ${positionText}
                    </div>
                `;
    
                historyContainer.appendChild(tournamentItem);
            });
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des tournois :", error);
            historyContainer.innerHTML = `<p class='text-red-500'>${translatedErrorLoadingTournament}</p>`;
        }
    }

    fetchMatchHistory();

    tabsContainer.append(tabMatches, tabTournaments);
    container.append(title, tabsContainer, historyContainer);

    return container;
}
