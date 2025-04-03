import { state } from "../state";
import { navigateTo } from "../router";
import { translateText } from "../translate";

// 🔥 **Générer un bracket de tournoi en arbre binaire**
async function generateBracket() {
    if (!state.tournament)
        return;

    let players = [...state.tournament.players];
    shuffleArray(players);

    let bracket: { round: number; matchups: { player1: string; player2: string | null; winner?: string }[] }[] = [];
    let roundNumber = 1;

    while (players.length > 1) {
        let matchups: { player1: string; player2: string | null }[] = [];

        while (players.length >= 2) {
            let player1 = players.shift()!;
            let player2 = players.shift()!;
            matchups.push({ player1, player2 });
        }

        // Si un joueur reste seul, il est qualifié automatiquement
        if (players.length === 1) {
            matchups.push({ player1: players.shift()!, player2: null });
        }

        bracket.push({ round: roundNumber, matchups });
        roundNumber++;
    }

    state.tournament.bracket = bracket;
}

function getNextMatch() {
    if (!state.tournament) return null;

	if (state.tournament.winner) {
        return null;
    }

    for (let round of state.tournament.bracket) {
        for (let match of round.matchups) {
            if (!match.winner && match.player2) {
                return match;
            }
        }
    }

    // ✅ ✅ ✅ Correction : S'il y a encore un match à jouer, le récupérer
    const lastRound = state.tournament.bracket[state.tournament.bracket.length - 1];
    if (lastRound.matchups.length === 1 && !lastRound.matchups[0].winner) {
        return lastRound.matchups[0];
    }

    return null;
}


// 🔥 **Mélanger aléatoirement un tableau (Fisher-Yates)**
function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


export default async function TournamentBracket(): Promise<HTMLElement> {

     /*          TRANSLATE TAB          */
     const textToTranslate = [
        "Vainqueur du Tournoi :"
    ];
    const [
        translatedWinner
    ] = await Promise.all(textToTranslate.map(text => translateText(text)));

    if (!state.tournament || !state.tournament.players.length) {
        navigateTo(new Event("click"), "/tournament-settings");
        return document.createElement("div");
    }

    const container = document.createElement("div");
    container.className = "flex flex-col items-center min-h-screen bg-black text-white p-8";

    const title = document.createElement("h1");
    translateText("Bracket du Tournoi").then((translated) => {
        title.innerHTML = "🏆 " + translated;
    })
    title.className = "text-4xl font-bold text-yellow-400 mb-6";

    if (!state.tournament.bracket.length) {
        generateBracket();
    }

    // 📌 Détermination dynamique de la taille du canvas
    const rounds = state.tournament.bracket.length;
    const totalPlayers = state.tournament.players.length;
    const matchHeight = 50;
    const verticalSpacing = 40;
    const horizontalSpacing = 200;

    const canvasWidth = rounds * horizontalSpacing + 200;
    const canvasHeight = Math.max(400, totalPlayers * (matchHeight + verticalSpacing));

    // Création du Canvas
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.className = "border border-gray-500 bg-gray-900 rounded-lg";

    const ctx = canvas.getContext("2d");

    if (ctx) {
        drawBracket(ctx, canvas.width, canvas.height);
    }
	if (state.tournament.winner) {
        const winnerText = document.createElement("h2");
        winnerText.innerText = `🏆 ${translatedWinner} ${state.tournament.winner}`;
        winnerText.className = "text-2xl text-yellow-400 font-bold mt-6";
        container.append(winnerText);
    } else {
		// ✅ Bouton pour lancer le match
		const startNextMatchButton = document.createElement("button");
        translateText("Lancer le prochain match").then((translated) => {
            startNextMatchButton.innerHTML = "🚀 " + translated;
        })
		startNextMatchButton.className = "mt-6 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg transition-all transform hover:scale-105";

		startNextMatchButton.onclick = () => {
			const nextMatch = getNextMatch();
			if (nextMatch) {
				state.tournament!.currentMatch = nextMatch;
				navigateTo(new Event("click"), "/tournament-game");
			} else {
                translateText("Tournoi terminé !").then((translated) => {
                    alert("🏆 " + translated);
                })
			}
		};

		container.append(startNextMatchButton);
	}
	container.append(title, canvas);
    return container;
}

// 🔥 **Dessiner le bracket en `Canvas`**
export async function drawBracket(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!state.tournament) return;

    /*          TRANSLATE TAB          */
    const textToTranslate = [
        "En attente..."
    ];
    const [
        translatedWaiting
    ] = await Promise.all(textToTranslate.map(text => translateText(text)));
    ctx.clearRect(0, 0, width, height);

    const bracket = state.tournament.bracket;
    const rounds = bracket.length;
    const matchHeight = 50;
    const matchWidth = 150;
    const verticalSpacing = 40;
    const horizontalSpacing = 200;

    let positions: { x: number; y: number }[][] = [];

    for (let roundIndex = 0; roundIndex < rounds; roundIndex++) {
        const round = bracket[roundIndex];
        const matchesInRound = round.matchups.length;

        positions[roundIndex] = [];

        for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex++) {
            const match = round.matchups[matchIndex];

            let x = roundIndex * horizontalSpacing + 50;
            let y = 50 + matchIndex * (matchHeight + verticalSpacing) * (roundIndex === 0 ? 1 : 2);

            if (roundIndex > 0) {
                const prev1 = positions[roundIndex - 1][matchIndex * 2];
                const prev2 = positions[roundIndex - 1][matchIndex * 2 + 1];

                if (prev1 && prev2) {
                    y = (prev1.y + prev2.y) / 2;
                }
            }

            positions[roundIndex].push({ x, y });

            ctx.fillStyle = "#222";
            ctx.fillRect(x, y, matchWidth, matchHeight);
            ctx.strokeStyle = "#fff";
            ctx.strokeRect(x, y, matchWidth, matchHeight);

            ctx.fillStyle = "#fff";
            ctx.font = "14px Arial";
            ctx.fillText(match.player1 || translatedWaiting, x + 10, y + 20);
            ctx.fillText(match.player2 || translatedWaiting, x + 10, y + 40);

            // ✅ ✅ ✅ Correction de l'affichage du gagnant
            if (match.winner) {
                ctx.fillStyle = "#ffcc00";
                ctx.fillText(`🏆 ${match.winner}`, x + 10, y - 10);  // 🔥 Affichage au-dessus du match
            }

            if (roundIndex > 0) {
                const prev1 = positions[roundIndex - 1][matchIndex * 2];
                const prev2 = positions[roundIndex - 1][matchIndex * 2 + 1];

                if (prev1 && prev2) {
                    ctx.strokeStyle = "#ffcc00";
                    ctx.beginPath();
                    ctx.moveTo(prev1.x + matchWidth, prev1.y + matchHeight / 2);
                    ctx.lineTo(x, y + matchHeight / 2);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(prev2.x + matchWidth, prev2.y + matchHeight / 2);
                    ctx.lineTo(x, y + matchHeight / 2);
                    ctx.stroke();
                }
            }
        }
    }
}

// 🔥 **Met à jour le bracket après un match**
function updateBracket(winner: string) {
    if (!state.tournament) return;

    for (let roundIndex = 0; roundIndex < state.tournament.bracket.length; roundIndex++) {
        const round = state.tournament.bracket[roundIndex];

        for (let match of round.matchups) {
            if (!match.winner && match.player2) {
                match.winner = winner;

                if (roundIndex + 1 < state.tournament.bracket.length) {
                    let nextRound = state.tournament.bracket[roundIndex + 1];

                    for (let nextMatch of nextRound.matchups) {
                        if (!nextMatch.player1) {
                            nextMatch.player1 = winner;
                            break;
                        } else if (!nextMatch.player2) {
                            nextMatch.player2 = winner;
                            break;
                        }
                    }
                }

                drawBracket(document.querySelector("canvas")!.getContext("2d")!,
                            document.querySelector("canvas")!.width,
                            document.querySelector("canvas")!.height);
                return;
            }
        }
    }
}
