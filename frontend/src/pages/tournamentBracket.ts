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
        const j: number = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


export default async function TournamentBracket(): Promise<HTMLElement> {


const textToTranslate: string[] = [
    "Champion du tournoi",
    "Bracket du Tournoi",
    "Format",
    "joueurs",
    "Mode",
    "Matchs",
    "Terminé",
    "restant",
    "Lancer le prochain match",
    "Tournoi terminé",
    "minutes",
    "points"
];

const [
    translatedWinnerOfTournament,
    translatedBracketOfTournament,
    translatedFormat,
    translatedPlayers,
    translatedMode,
    translatedMatchs,
    translatedFinish,
    translatedRest,
    translatedStartNextMatch,
    translatedTournamentFinished,
    translatedMinutes,
    translatedPoints
] = await Promise.all(textToTranslate.map(text => translateText(text)));

    // ✅ NOUVEAU: Vérifier et restaurer les données du tournoi si nécessaire
    if (!state.tournament && localStorage.getItem('tournamentData')) {
        try {
            state.tournament = JSON.parse(localStorage.getItem('tournamentData')!);
            console.log("✅ Données de tournoi restaurées depuis localStorage");
        } catch (error) {
            console.error("❌ Erreur lors de la restauration des données:", error);
        }
    }

    if (!state.tournament || !state.tournament.players.length) {
        navigateTo(new Event("click"), "/tournament-settings");
        return document.createElement("div");
    }
    
    // ✅ NOUVEAU: Stocker l'état actuel dans localStorage
    localStorage.setItem('currentPage', 'tournament-bracket');
    localStorage.setItem('tournamentData', JSON.stringify(state.tournament));

    // Conteneur principal sans défilement vertical
    const container = document.createElement("div");
    container.className = "absolute inset-0 flex flex-col items-center bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-950 text-white";

    const header = document.createElement("div");
    header.className = "w-full max-w-3xl bg-black bg-opacity-40 backdrop-blur-sm p-5 rounded-2xl shadow-2xl border border-purple-500/30 mt-6 mb-4 mx-auto";
    
    // Créer une structure pour le header qui peut inclure le gagnant
    const headerContent = document.createElement("div");
    headerContent.className = "flex flex-col items-center";
    
    // Message du gagnant en haut (compact mais lisible)
    if (state.tournament.winner) {
        const winnerBadge = document.createElement("div");
        winnerBadge.className = "flex items-center justify-center mb-3 bg-gradient-to-r from-yellow-900/40 to-amber-800/40 rounded-lg border border-yellow-500/40 py-3 px-5";
        
        const trophyIcon = document.createElement("span");
        trophyIcon.innerHTML = "🏆";
        trophyIcon.className = "text-2xl mr-3";
        
        const winnerHTML = document.createElement("div");
        winnerHTML.className = "flex flex-col";
        
        const winnerLabel = document.createElement("span");
        winnerLabel.innerHTML = translatedWinnerOfTournament;
        winnerLabel.className = "text-sm text-yellow-300";
        
        const winnerName = document.createElement("span");
        winnerName.innerHTML = state.tournament.winner;
        winnerName.className = "text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500";
        
        winnerHTML.append(winnerLabel, winnerName);
        winnerBadge.append(trophyIcon, winnerHTML);
        headerContent.appendChild(winnerBadge);
    }
    
    const title = document.createElement("h1");
    title.innerHTML = `🏆 ${translatedBracketOfTournament}`;
    title.className = "text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 text-center";

    headerContent.appendChild(title);
    header.appendChild(headerContent);

    if (!state.tournament.bracket.length) {
        generateBracket();
    }

    // 📌 Détermination dynamique de la taille du canvas
    const rounds = state.tournament.bracket.length;
    const totalPlayers = state.tournament.players.length;
    
    // Calculer les dimensions optimales en fonction du nombre de joueurs et de l'écran
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adapter la taille globale en fonction de la hauteur disponible
    const headerHeight = 120; // Estimation de l'espace pris par le header
    const infoHeight = 150;   // Estimation de l'espace pris par les infos
    const availableHeight = viewportHeight - headerHeight - infoHeight - 60; // 60px pour les marges
    
    // Définir des proportions qui s'adaptent à différentes tailles d'écran
    const maxCanvasWidth = Math.min(viewportWidth * 0.92 - 32, 1400);
    
    // Calculer l'espacement optimal en fonction des dimensions et du nombre de tours
    let horizontalSpacing, matchWidth;
    
    // Adapter pour les différentes tailles d'écran et nombre de rounds
    if (rounds <= 2) {
        horizontalSpacing = Math.min(220, maxCanvasWidth / 3);
        matchWidth = Math.min(170, horizontalSpacing * 0.75);
    } else if (rounds === 3) {
        horizontalSpacing = Math.min(200, maxCanvasWidth / 4);
        matchWidth = Math.min(160, horizontalSpacing * 0.75);
    } else {
        horizontalSpacing = Math.min(180, maxCanvasWidth / (rounds + 1));
        matchWidth = Math.min(150, horizontalSpacing * 0.75);
    }
    
    // Ajuster la taille des matchs en fonction du nombre de joueurs et de l'espace vertical
    let matchHeight, verticalSpacing;
    const maxMatchesInRound = Math.pow(2, rounds - 1);
    
    // Réglage spécifique basé sur le nombre de joueurs
    if (totalPlayers >= 16) {
        // Grand tournoi (16 joueurs)
        matchHeight = 36;
        verticalSpacing = 24;
    } else if (totalPlayers >= 9) {
        // Tournoi moyen-grand (9-15 joueurs)
        matchHeight = 38;
        verticalSpacing = 28;
    } else if (totalPlayers > 4) {
        // Tournoi moyen (5-8 joueurs)
        matchHeight = 46;
        verticalSpacing = 36;
    } else {
        // Petit tournoi (4 joueurs ou moins)
        matchHeight = 54;
        verticalSpacing = 45;
    }
    
    // Calculer la taille du canvas en fonction des paramètres optimisés
    const canvasWidth = Math.min(rounds * horizontalSpacing + matchWidth + 140, maxCanvasWidth);
    
    // Pour les grands tournois, calculer la hauteur minimale nécessaire (avec une marge de sécurité)
    const matchesInFirstRound = state.tournament.bracket[0] ? state.tournament.bracket[0].matchups.length : 0;
    const minHeightNeeded = (matchesInFirstRound * matchHeight) + ((matchesInFirstRound - 1) * verticalSpacing) + 80;
    
    // Augmenter la hauteur disponible pour les tournois plus grands
    let adjustedAvailableHeight = availableHeight;
    if (totalPlayers > 8) {
        adjustedAvailableHeight = Math.max(availableHeight, Math.min(minHeightNeeded, viewportHeight * 0.8));
    }
    
    // Limiter la hauteur en fonction de l'espace disponible, mais garder une taille minimum
    const minCanvasHeight = Math.min(400, adjustedAvailableHeight);
    const canvasHeight = Math.max(minHeightNeeded, minCanvasHeight);

    // Création du Canvas avec les dimensions optimisées
    const canvasContainer = document.createElement("div");
    canvasContainer.className = "bg-black bg-opacity-30 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-xl border border-indigo-500/30 flex justify-center items-center overflow-hidden";
    // Limiter la largeur du conteneur pour éviter les débordements horizontaux
    canvasContainer.style.maxWidth = "calc(100vw - 24px)";
    
    // Activer le défilement vertical basé sur le nombre de joueurs
    if (totalPlayers > 8) {
        canvasContainer.style.overflowY = "auto";
        canvasContainer.style.maxHeight = `${Math.min(viewportHeight * 0.75, 850)}px`;
        canvasContainer.style.overflowX = "hidden"; // Éviter le défilement horizontal
    } else {
        canvasContainer.style.minHeight = "400px";
        canvasContainer.style.maxHeight = `${canvasHeight + 40}px`;
    }
    
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.className = "rounded-lg shadow-xl";

    // S'assurer que le canvas est responsive
    canvas.style.maxWidth = "100%";
    canvas.style.height = "auto";
    canvas.style.objectFit = "contain";

    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

    if (ctx) {
        drawBracket(ctx, canvas.width, canvas.height);
    }
    
    canvasContainer.appendChild(canvas);
    
    // Section avec les informations sur le tournoi
    const infoContainer = document.createElement("div");
    infoContainer.className = "mt-4 bg-black bg-opacity-30 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-xl border border-indigo-500/30 w-full max-w-3xl flex flex-wrap justify-between gap-4 mx-auto";
    
    // Format du tournoi
    const formatInfo = document.createElement("div");
    formatInfo.className = "flex flex-col items-center";
    
    const formatIcon = document.createElement("div");
    formatIcon.className = "text-2xl mb-2 text-purple-300";
    formatIcon.innerHTML = "🏠";
    
    const formatTitle = document.createElement("div");
    formatTitle.className = "text-sm text-indigo-300 mb-1";
    formatTitle.innerHTML = translatedFormat;
    const formatValue = document.createElement("div");
    formatValue.className = "text-lg font-medium text-white";
    formatValue.innerHTML = `${state.tournament.players.length} ${translatedPlayers}`;
    
    formatInfo.append(formatIcon, formatTitle, formatValue);
    
    // Mode de jeu
    const modeInfo = document.createElement("div");
    modeInfo.className = "flex flex-col items-center";
    
    const modeIcon = document.createElement("div");
    modeIcon.className = "text-2xl mb-2 text-purple-300";
    modeIcon.innerHTML = "🎯";
    
    const modeTitle = document.createElement("div");
    modeTitle.className = "text-sm text-indigo-300 mb-1";
    modeTitle.innerHTML = translatedMode;
    
    const modeValue = document.createElement("div");
    modeValue.className = "text-lg font-medium text-white";
    modeValue.innerHTML = `${state.tournament.target} ${translatedPoints}`;
    
    modeInfo.append(modeIcon, modeTitle, modeValue);
    
    // Matchs restants
    const matchesInfo = document.createElement("div");
    matchesInfo.className = "flex flex-col items-center";
    
    const matchesIcon = document.createElement("div");
    matchesIcon.className = "text-2xl mb-2 text-purple-300";
    matchesIcon.innerHTML = "🎮";
    
    const matchesTitle = document.createElement("div");
    matchesTitle.className = "text-sm text-indigo-300 mb-1";
    matchesTitle.innerHTML = translatedMatchs;
    // Calculer le nombre de matchs restants
    let matchesRemaining = 0;
    state.tournament.bracket.forEach(round => {
        round.matchups.forEach(match => {
            if (!match.winner && match.player1 && match.player2) {
                matchesRemaining++;
            }
        });
    });
    
    const matchesValue = document.createElement("div");
    matchesValue.className = "text-lg font-medium text-white";
    matchesValue.innerHTML = state.tournament.winner 
        ? translatedFinish
        : `${matchesRemaining} ${translatedRest}${matchesRemaining > 1 ? 's' : ''}`;

    matchesInfo.append(matchesIcon, matchesTitle, matchesValue);
    
    infoContainer.append(formatInfo, modeInfo, matchesInfo);
    
    // Bouton pour lancer le match (seulement si le tournoi n'est pas terminé)
    if (!state.tournament.winner) {
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "w-full flex justify-center mt-4 mb-6";
        
        const playNextMatchButton = document.createElement("button");
        playNextMatchButton.className = "px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-xl shadow-xl transition-all font-medium flex items-center";
        playNextMatchButton.innerHTML = `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        ${translatedStartNextMatch}`;

        playNextMatchButton.onclick = () => {
            const nextMatch = getNextMatch();
            if (nextMatch) {
                state.tournament!.currentMatch = nextMatch;
                
                // ✅ NOUVEAU: Stocker le match actuel dans localStorage
                localStorage.setItem('currentMatchData', JSON.stringify(nextMatch));
                
                navigateTo(new Event("click"), "/tournament-game");
            } else {
                alert(`🏆 ${translatedTournamentFinished}`);
            }
        };
        buttonContainer.appendChild(playNextMatchButton);
        container.appendChild(buttonContainer);
    }
    
    container.append(header, canvasContainer, infoContainer);
    
    // Ajuster les dimensions quand la fenêtre change de taille
    window.addEventListener('resize', () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                drawBracket(ctx, canvas.width, canvas.height);
            }
        }
    });
    
    return container;
}

// 🔥 **Dessiner le bracket en `Canvas`**
export async function drawBracket(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!state.tournament) return;

    /*          TRANSLATE TAB          */
    const textToTranslate: string[] = [
        "En attente..."
    ];
    const [
        translatedWaiting
    ] = await Promise.all(textToTranslate.map(text => translateText(text)));
    ctx.clearRect(0, 0, width, height);
    
    // Fond élégant avec motif subtil
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#1e1b4b20"); // indigo-950 avec transparence
    gradient.addColorStop(0.5, "#581c8720"); // purple-900 avec transparence
    gradient.addColorStop(1, "#1e1b4b20"); // indigo-950 avec transparence
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Ajouter un motif de points subtil - Optimiser pour ne pas ralentir les petits appareils
    const pointSpacing = width > 800 ? 20 : 40; // Points plus espacés sur petits écrans
    ctx.fillStyle = "#8b5cf610"; // purple-500 très transparent
    for (let x = 0; x < width; x += pointSpacing) {
        for (let y = 0; y < height; y += pointSpacing) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const bracket = state.tournament.bracket;
    const rounds = bracket.length;
    const totalPlayers = state.tournament.players.length;
    
    // Calculer dynamiquement les dimensions en fonction de la taille du canvas et du nombre de joueurs
    let matchHeight, matchWidth;
    
    // Ajuster les dimensions des matchs en fonction du nombre de joueurs
    if (totalPlayers >= 16) {
        matchHeight = 36;
        matchWidth = width / (rounds + 2) * 0.8;
    } else if (totalPlayers >= 9) {
        matchHeight = 38;
        matchWidth = width / (rounds + 2) * 0.8;
    } else {
        matchHeight = height / Math.max(totalPlayers, 4) * 0.7;
        matchWidth = width / (rounds + 2) * 0.8;
    }
    
    const horizontalSpacing = width / (rounds + 1);
    
    // Centre vertical du canvas - ajusté pour grands tournois
    const centerY = totalPlayers > 8 
        ? matchHeight * totalPlayers / 4 // Centre visuel pour les grands tournois
        : height / 2;                    // Centre pour les petits tournois

    // Adapter la taille du texte en fonction de la taille du canvas et du nombre de joueurs
    const fontSize = totalPlayers >= 12
        ? Math.max(12, Math.min(13, matchHeight / 3))
        : Math.max(13, Math.min(15, matchHeight / 3));

    // Dessiner les titres des rounds
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    
    // Dégradé pour les titres
    const titleGradient = ctx.createLinearGradient(0, 0, width, 0);
    titleGradient.addColorStop(0, "#a5b4fc"); // indigo-300
    titleGradient.addColorStop(1, "#c4b5fd"); // purple-300
    ctx.fillStyle = titleGradient;
    
    for (let i = 0; i < rounds; i++) {
        const roundTitle = i === rounds - 1 ? "Finale" : 
                         i === rounds - 2 ? "Demi-finales" : 
                         i === rounds - 3 ? "Quarts de finale" : 
                         `Tour ${i + 1}`;
        const x = i * horizontalSpacing + 70 + matchWidth/2;
        ctx.fillText(roundTitle, x, 25);
    }
    
    ctx.textAlign = "left"; // Réinitialiser l'alignement du texte

    let positions: { x: number; y: number }[][] = [];

    // Calculer le nombre total de matchs dans le premier tour pour espacer verticalement
    const firstRoundMatches = bracket[0] ? bracket[0].matchups.length : 0;
    
    // Pour les tournois plus grands, il faut ajuster l'espacement vertical
    let verticalSpacing;
    if (totalPlayers >= 16) {
        verticalSpacing = 24;
    } else if (totalPlayers >= 9) {
        verticalSpacing = 28;
    } else if (totalPlayers > 4) {
        verticalSpacing = 36;
    } else {
        verticalSpacing = 45;
    }
    
    const totalHeight = firstRoundMatches * matchHeight + (firstRoundMatches - 1) * verticalSpacing;
    let startY = centerY - totalHeight / 2;
    
    // Ajuster le point de départ pour les grands tournois
    if (totalPlayers > 8) {
        startY = 40; // Commencer plus haut pour les grands tournois
    }

    for (let roundIndex = 0; roundIndex < rounds; roundIndex++) {
        const round = bracket[roundIndex];
        const matchesInRound: number = round.matchups.length;

        positions[roundIndex] = [];
        
        // Ajuster l'espacement vertical en fonction du nombre de matchs dans ce tour
        const roundTotalHeight = matchesInRound * matchHeight + (matchesInRound - 1) * verticalSpacing;
        let roundStartY = centerY - roundTotalHeight / 2;
        
        // Ajuster pour les grands tournois
        if (totalPlayers > 8) {
            roundStartY = startY + (roundIndex === 0 ? 0 : 20); // Un peu plus bas pour les tours suivants
        }

        for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex++) {
            const match = round.matchups[matchIndex];

            // Ajout d'une marge horizontale aux extrémités du bracket (70px sur chaque côté)
            let x = roundIndex * horizontalSpacing + 70;
            let y = roundStartY + matchIndex * (matchHeight + verticalSpacing);

            // Ajustement pour les tours suivants basé sur les positions précédentes
            if (roundIndex > 0) {
                const prevRoundMatchCount = positions[roundIndex - 1].length;
                // Calculer combien de matchs du tour précédent correspondent à ce match
                const matchesPerCurrentMatch = prevRoundMatchCount / matchesInRound;
                
                if (matchesPerCurrentMatch >= 2) {
                    const startIdx = matchIndex * matchesPerCurrentMatch;
                    const endIdx = startIdx + matchesPerCurrentMatch - 1;
                    
                    if (positions[roundIndex - 1][startIdx] && positions[roundIndex - 1][endIdx]) {
                        const prevY1 = positions[roundIndex - 1][startIdx].y;
                        const prevY2 = positions[roundIndex - 1][endIdx].y;
                        y = (prevY1 + prevY2 + matchHeight) / 2 - matchHeight/2;
                    }
                }
            }

            positions[roundIndex].push({ x, y });

            // Dessiner l'arrière-plan des matchs avec un dégradé et effet de glassmorphism
            const matchGradient = ctx.createLinearGradient(x, y, x + matchWidth, y + matchHeight);
            matchGradient.addColorStop(0, "#1e293b99"); // slate-800 semi-transparent
            matchGradient.addColorStop(1, "#0f172a99"); // slate-900 semi-transparent
            
            ctx.fillStyle = matchGradient;
            ctx.beginPath();
            ctx.roundRect(x, y, matchWidth, matchHeight, 8); // Coins arrondis
            ctx.fill();
            
            // Ajout d'une ombre légère
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Bordure dégradée avec animation
            const now = Date.now() / 1000;
            const borderGradient = ctx.createLinearGradient(x, y, x + matchWidth, y + matchHeight);
            
            if (match.winner) {
                // Bordure dorée animée pour les matchs terminés
                const shiftAmount = (Math.sin(now) + 1) / 2; // Valeur entre 0 et 1
                borderGradient.addColorStop(0, "#fbbf24"); // amber-400
                borderGradient.addColorStop(shiftAmount, "#f59e0b"); // amber-500
                borderGradient.addColorStop(1, "#d97706"); // amber-600
            } else {
                borderGradient.addColorStop(0, "#6366f1"); // indigo-500
                borderGradient.addColorStop(1, "#8b5cf6"); // purple-500
            }
            
            ctx.strokeStyle = borderGradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x, y, matchWidth, matchHeight, 8); // Coins arrondis
            ctx.stroke();
            
            // Réinitialiser l'ombre pour le texte
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Dessiner une séparation entre les joueurs
            ctx.beginPath();
            ctx.moveTo(x, y + matchHeight/2);
            ctx.lineTo(x + matchWidth, y + matchHeight/2);
            ctx.strokeStyle = "#6366f140"; // indigo-500 très transparent
            ctx.stroke();

            // Noms des joueurs
            ctx.font = `bold ${fontSize}px Arial`;
            
            // Joueur 1 - avec possibilité de mise en évidence
            if (match.player1 === match.winner) {
                // Fond pour le joueur gagnant (partie supérieure)
                const winnerGradient = ctx.createLinearGradient(x, y, x + matchWidth, y + matchHeight/2);
                winnerGradient.addColorStop(0, "rgba(251, 191, 36, 0.3)"); // amber-400 avec transparence
                winnerGradient.addColorStop(1, "rgba(245, 158, 11, 0.3)"); // amber-500 avec transparence
                
                ctx.fillStyle = winnerGradient;
                ctx.beginPath();
                ctx.roundRect(x, y, matchWidth, matchHeight/2, [8, 8, 0, 0]); // Coins arrondis seulement en haut
                ctx.fill();
                
                // Texte en couleur dorée pour le gagnant
                ctx.fillStyle = "#fcd34d"; // amber-300
            } else {
                ctx.fillStyle = "#e0e7ff"; // indigo-100
            }
            
            // Centrer verticalement le texte dans sa moitié
            const player1Text = match.player1 || "En attente...";
            const player1Y = y + matchHeight/4 + 6;
            ctx.fillText(player1Text, x + 14, player1Y);
            
            // Joueur 2 - avec possibilité de mise en évidence
            if (match.player2 === match.winner) {
                // Fond pour le joueur gagnant (partie inférieure)
                const winnerGradient = ctx.createLinearGradient(x, y + matchHeight/2, x + matchWidth, y + matchHeight);
                winnerGradient.addColorStop(0, "rgba(251, 191, 36, 0.3)"); // amber-400 avec transparence
                winnerGradient.addColorStop(1, "rgba(245, 158, 11, 0.3)"); // amber-500 avec transparence
                
                ctx.fillStyle = winnerGradient;
                ctx.beginPath();
                ctx.roundRect(x, y + matchHeight/2, matchWidth, matchHeight/2, [0, 0, 8, 8]); // Coins arrondis seulement en bas
                ctx.fill();
                
                // Texte en couleur dorée pour le gagnant
                ctx.fillStyle = "#fcd34d"; // amber-300
            } else {
                ctx.fillStyle = "#e0e7ff"; // indigo-100
            }
            
            const player2Text = match.player2 || "En attente...";
            const player2Y = y + 3*matchHeight/4 + 6;
            ctx.fillText(player2Text, x + 14, player2Y);

            // Ajout d'une bordure lumineuse autour de la partie du joueur gagnant
            if (match.winner) {
                if (match.player1 === match.winner) {
                    // Bordure lumineuse pour la partie supérieure
                    ctx.beginPath();
                    ctx.roundRect(x, y, matchWidth, matchHeight/2, [8, 8, 0, 0]);
                    ctx.strokeStyle = "#fbbf24"; // amber-400
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                } else if (match.player2 === match.winner) {
                    // Bordure lumineuse pour la partie inférieure
                    ctx.beginPath();
                    ctx.roundRect(x, y + matchHeight/2, matchWidth, matchHeight/2, [0, 0, 8, 8]);
                    ctx.strokeStyle = "#fbbf24"; // amber-400
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            }

            // Dessin des connexions
            if (roundIndex > 0) {
                const matchesPerCurrentMatch = positions[roundIndex - 1].length / matchesInRound;
                const startIdx = matchIndex * matchesPerCurrentMatch;
                const endIdx = startIdx + matchesPerCurrentMatch - 1;
                
                if (positions[roundIndex - 1][startIdx] && positions[roundIndex - 1][endIdx]) {
                    const prev1 = positions[roundIndex - 1][startIdx];
                    const prev2 = positions[roundIndex - 1][endIdx];
                    
                    // Créer un dégradé pour les lignes
                    const lineGradient = ctx.createLinearGradient(
                        prev1.x + matchWidth, prev1.y + matchHeight / 2,
                        x, y + matchHeight / 2
                    );
                    
                    if (match.winner) {
                        lineGradient.addColorStop(0, "#fbbf2480"); // amber-400 semi-transparent
                        lineGradient.addColorStop(1, "#f59e0b80"); // amber-500 semi-transparent
                    } else {
                        lineGradient.addColorStop(0, "#6366f180"); // indigo-500 semi-transparent
                        lineGradient.addColorStop(1, "#8b5cf680"); // purple-500 semi-transparent
                    }
                    
                    ctx.strokeStyle = lineGradient;
                    ctx.lineWidth = 2;
                    
                    // Point de jonction des lignes (au milieu entre les deux matchs précédents)
                    const junctionX = prev1.x + matchWidth + 30;
                    const junctionY = (prev1.y + prev2.y + matchHeight) / 2;
                    
                    // Ligne horizontale depuis le premier match précédent
                    ctx.beginPath();
                    ctx.moveTo(prev1.x + matchWidth, prev1.y + matchHeight / 2);
                    ctx.lineTo(junctionX, prev1.y + matchHeight / 2);
                    ctx.stroke();
                    
                    // Ligne verticale depuis le premier match précédent
                    ctx.beginPath();
                    ctx.moveTo(junctionX, prev1.y + matchHeight / 2);
                    ctx.lineTo(junctionX, junctionY);
                    ctx.stroke();
                    
                    // Ligne horizontale depuis le second match précédent
                    ctx.beginPath();
                    ctx.moveTo(prev2.x + matchWidth, prev2.y + matchHeight / 2);
                    ctx.lineTo(junctionX, prev2.y + matchHeight / 2);
                    ctx.stroke();
                    
                    // Ligne verticale depuis le second match précédent
                    ctx.beginPath();
                    ctx.moveTo(junctionX, prev2.y + matchHeight / 2);
                    ctx.lineTo(junctionX, junctionY);
                    ctx.stroke();
                    
                    // Ligne horizontale vers le match actuel
                    ctx.beginPath();
                    ctx.moveTo(junctionX, junctionY);
                    ctx.lineTo(x, y + matchHeight / 2);
                    ctx.stroke();
                    
                    // Cercle de jonction
                    ctx.beginPath();
                    ctx.arc(junctionX, junctionY, 4, 0, Math.PI * 2);
                    ctx.fillStyle = lineGradient;
                    ctx.fill();
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
