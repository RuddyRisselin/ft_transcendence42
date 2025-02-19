export const state = {
    user: JSON.parse(localStorage.getItem("user") || "null"),
    token: localStorage.getItem("token") || null,
    socket: null as WebSocket | null,
    localMatch: null as {
        player1: string;
        player2: string;
        player2Auth: null,
        mode: "time" | "points"; // ✅ Ajout du mode de jeu
        target: number; // ✅ Objectif (durée en secondes ou points)
    } | null,
};
