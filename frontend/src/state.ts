export const state = {
    user: JSON.parse(localStorage.getItem("user") || "null"),
    token: localStorage.getItem("token") || null,
    socket: null as WebSocket | null,

    // ✅ Match local classique (1v1 hors tournoi)
    localMatch: null as {
        player1: string;
        player2: string;
        player2Auth: null;
        mode: "time" | "points"; // ✅ Mode de jeu (temps ou points)
        target: number; // ✅ Objectif (temps ou points)
    } | null,

    // ✅ Match contre IA
    aiGame: null as {
        level: string; // Niveau de difficulté de l'IA
        mode?: "time" | "points"; // Mode de jeu (temps ou points)
        target?: number; // Objectif (temps ou points)
    } | null,
    
    // ✅ AJOUT: Structure pour le match contre l'IA actif
    aiMatch: null as {
        player: string;
        level: string; // Niveau de difficulté de l'IA (easy, medium, hard)
        mode: "time" | "points"; // Mode de jeu (temps ou points)
        target: number; // Objectif (temps ou points)
        scoreHuman: number; // Score du joueur humain
        scoreAI: number; // Score de l'IA
    } | null,

    // ✅ Tournoi avec gestion des joueurs et du bracket
    tournament: null as {
        players: string[]; // ✅ Liste des joueurs du tournoi
        matchs: number;
        mode: "time" | "points"; // ✅ Mode du tournoi
        target: number; // ✅ Objectif (temps ou points)
        bracket: { 
            round: number; 
            matchups: { 
                player1: string; 
                player2: string | null; 
                winner?: string; // ✅ Ajout d'un champ winner
            }[] 
        }[]; // ✅ Bracket du tournoi sous forme d'un arbre

        currentMatch?: { 
            player1: string; 
            player2: string | null; 
            winner?: string; // ✅ Ajout du gagnant du match en cours
        }; 

        lastWinner?: string; // ✅ Stocke le dernier gagnant avant mise à jour du bracket
        winner?: string; // ✅ Gagnant final du tournoi (défini à la fin du bracket)
    } | null,
};
