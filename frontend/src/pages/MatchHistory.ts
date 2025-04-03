// import { state } from "../state";
// import { translateText } from "../translate";

// export default function MatchHistory(): HTMLElement {
//     const history = document.createElement("div");
//     history.className = "col-span-3 bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col";

//     let activeTab: "matches" | "tournaments" = "matches";

//     const tabsContainer = document.createElement("div");
//     tabsContainer.className = "flex space-x-2 mb-4";

//     const tabMatches = document.createElement("button");
//     translateText("Matchs").then((translated) => {
//         tabMatches.innerHTML = translated;
//     })
//     tabMatches.className = "px-4 py-2 text-white bg-blue-600 rounded-lg";

//     const tabTournaments = document.createElement("button");
//     translateText("Tournois").then((translated) => {
//         tabTournaments.innerHTML = translated;
//     })
//     tabTournaments.className = "px-4 py-2 text-white bg-blue-600 rounded-lg";

//     const historyContainer = document.createElement("div");
//     historyContainer.className = "flex flex-col gap-2 overflow-y-scroll max-h-80";

//     if (!state.user || !state.user.id) {
//         translateText("Utilisateur non authentifié.").then((translated) => {
//             historyContainer.innerHTML = `<p class='text-red-500'>${translated}</p>`;
//         })
//         return history;
//     }

//     tabMatches.addEventListener("click", () => {
//         if (activeTab !== "matches") {
//             activeTab = "matches";
//             tabMatches.classList.add("bg-blue-600");
//             tabTournaments.classList.remove("bg-blue-600");
//             historyContainer.innerHTML = "";
//             fetchMatchHistory();
//         }
//     });

//     tabTournaments.addEventListener("click", () => {
//         if (activeTab !== "tournaments") {
//             activeTab = "tournaments";
//             tabTournaments.classList.add("bg-blue-600");
//             tabMatches.classList.remove("bg-blue-600");
//             historyContainer.innerHTML = "";
//             fetchTournamentHistory();
//         }
//     });

//     async function fetchMatchHistory() {
//         try {
//             translateText("Chargement...").then((translated) => {
//                 historyContainer.innerHTML = `<p class='text-white'>${translated}</p>`;
//             })
//             const response = await fetch(`/api/matches?userId=${state.user.id}`);
//             if (!response.ok) throw new Error("Erreur API");
//             const matches = await response.json();

//             historyContainer.innerHTML = "";
//             if (!Array.isArray(matches) || matches.length === 0) {
//                 translateText("Aucun match trouvé.").then((translated) => {
//                     historyContainer.innerHTML = `<p class='text-white'>${translated}</p>`;
//                 })
//                 return;
//             }

//             matches.forEach(match => {
//                 const isWinner = match.winner_name === state.user.username;
//                 const matchItem = document.createElement("div");
//                 matchItem.className = `p-2 rounded-lg text-white text-sm flex items-center space-x-2 ${isWinner ? "bg-blue-600" : "bg-red-600"}`;

//                 matchItem.innerText = `${new Date(match.played_at).toLocaleDateString()} - ${match.player1_name} VS ${match.player2_name} → Winner: ${match.winner_name}`;
//                 historyContainer.appendChild(matchItem);
//             });
//         } catch (error) {
//             translateText("Erreur de chargement des matchs.").then((translated) => {
//                 historyContainer.innerHTML = `<p class='text-red-500'>${translated}</p>`;
//             })
//         }
//     }

//     async function fetchTournamentHistory(): Promise<void> {
//         try {
//             translateText("Chargement...").then((translated) => {
//                 historyContainer.innerHTML = `<p class='text-white'>${translated}</p>`;
//             })
    
//             const response = await fetch(`/api/tournaments?userId=${state.user.id}`);
//             if (!response.ok) throw new Error("Erreur API");
    
//             const tournaments: { 
//                 id: number; 
//                 created_at: string; 
//                 players: string | number[]; 
//                 ranking: string | number[] | null 
//             }[] = await response.json();
    
//             historyContainer.innerHTML = "";
//             if (!Array.isArray(tournaments) || tournaments.length === 0) {
//                 translateText("Aucun tournoi trouvé.").then((translated) => {
//                     historyContainer.innerHTML = `<p class='text-white'>${translated}</p>`;
//                 })
//                 return;
//             }
    
//             const allPlayerIds = new Set<number>();
//             tournaments.forEach(tournament => {
//                 const players = typeof tournament.players === "string" 
//                     ? JSON.parse(tournament.players) 
//                     : tournament.players;
//                 players.forEach(playerId => allPlayerIds.add(playerId));
//             });
    
//             const userResponse = await fetch(`/api/users?ids=${Array.from(allPlayerIds).join(",")}`);
//             if (!userResponse.ok) throw new Error("Erreur lors de la récupération des noms des joueurs");
    
//             const users: { id: number; username: string }[] = await userResponse.json();
//             const userMap = new Map(users.map(user => [user.id, user.username]));
    
//             tournaments.forEach(async tournament => {
//                 const tournamentItem = document.createElement("div");
//                 tournamentItem.className = "p-3 rounded-lg text-white text-sm flex flex-col bg-gray-900 border border-gray-700 shadow-lg";
    
//                 const date = new Date(tournament.created_at).toLocaleDateString();
    
//                 const players = typeof tournament.players === "string"
//                     ? JSON.parse(tournament.players)
//                     : tournament.players;
    
//                 const ranking = tournament.ranking 
//                     ? (typeof tournament.ranking === "string" ? JSON.parse(tournament.ranking) : tournament.ranking)
//                     : null;
    
//                 const playerNames = players.map(playerId => userMap.get(playerId) || "Inconnu");
    
//                 let userPosition = ranking ? ranking.indexOf(state.user.id) + 1 : null;
//                 let positionText = "Non classé";
//                 let positionColor = "bg-gray-600";
    
//                 if (userPosition) {
//                     switch (userPosition) {
//                         case 1:
//                             positionText = "🏆 1er";
//                             positionColor = "bg-yellow-500";
//                             break;
//                         case 2:
//                             positionText = "🥈 2e";
//                             positionColor = "bg-gray-400";
//                             break;
//                         case 3:
//                             positionText = "🥉 3e";
//                             positionColor = "bg-orange-500";
//                             break;
//                         default:
//                             positionText = `${userPosition}ème`;
//                             positionColor = "bg-gray-700";
//                             break;
//                     }
//                 }
//                 ///////***************=====================*****************////////////
//                 const textToTranslate = [
//                     "Tournoi",
//                     "du",
//                     "Joueurs"
//                 ];
//                 const [
//                     translatedTournament,
//                     translatedof,
//                     translatedplayers
//                 ] = await Promise.all(textToTranslate.map(text => translateText(text)));

//                 tournamentItem.innerHTML = `
//                     <p class="font-bold text-lg text-blue-400">${translatedTournament} n°${tournament.id} ${translatedof} ${date}</p>
//                     <p class="text-sm text-gray-300">${translatedplayers} : ${playerNames.join(", ")}</p>
//                     <div class="mt-2 p-2 rounded-lg text-center text-black font-bold ${positionColor}">
//                         ${positionText}
//                     </div>
//                 `;
    
//                 historyContainer.appendChild(tournamentItem);
//             });
//         } catch (error) {
//             console.error("❌ Erreur lors de la récupération des tournois :", error);
//             translateText("Erreur de chargement des tournois.").then((translated) => {
//                 historyContainer.innerHTML = `<p class='text-red-500'>${translated}</p>`;
//             })
//         }
//     }
//     fetchMatchHistory();

//     tabsContainer.append(tabMatches, tabTournaments);
//     history.append(tabsContainer, historyContainer);

//     return history;
// }
