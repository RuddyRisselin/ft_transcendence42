import { state } from "../state";

// Sauvegarde le token et l'utilisateur
export function saveAuthData(token: string, user: any) {
    state.token = token;
    state.user = user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

export function loadAuthData() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);
    }
}

// Vérifie si un utilisateur est authentifié
export function isAuthenticated(): boolean {
    return !!state.token;
}

export function logout() {
    state.user = null;
    state.token = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
}

export async function login(username: string, password: string) {
    const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erreur de connexion");

    // Sauvegarde les infos utilisateur
    state.user = data.user;
    state.token = data.token;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "/dashboard";
}
// Inscription d'un utilisateur
export async function register(username: string, email: string, password: string) {
    const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erreur d'inscription");

    saveAuthData(data.token, data.user);
    window.location.href = "/profile";
}
