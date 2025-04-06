import { state } from "../state";
import { navigateTo } from "../router";
import API_CONFIG from "../config/apiConfig";

// Sauvegarde le token et l'utilisateur
export function saveAuthData(token: string, user: any) {
    state.token = token;
    state.user = user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("language", user.language);
}

// Récupère les données d'authentification
export function loadAuthData() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);

        console.log("🔓 Données utilisateur restaurées :", state.user);

        // Connexion WebSocket
        connectToWebSocket(state.user.id, (message) => {
            console.log("📩 Message WebSocket reçu :", message);
        });
    } else {
        console.log("❌ Aucun utilisateur trouvé, redirection vers login.");
        logout();
    }
}

// Vérifie si un utilisateur est authentifié
export function isAuthenticated(): boolean {
    return !!state.token;
}

export async function logout() {
    console.log("🔴 Déconnexion en cours...");

    try {
        // ✅ Vérifier si l'utilisateur est bien connecté avant d'envoyer une requête
        if (!state.user) {
            console.warn("⚠️ Aucun utilisateur connecté.");
            return;
        }

        // ✅ Mettre à jour le statut utilisateur en "offline"
        await fetch(`${API_CONFIG.API_BASE_URL}/users/${state.user.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "offline" }),
        });

        console.log("✅ Serveur mis à jour : utilisateur offline.");

        // ✅ Envoyer immédiatement un message WebSocket aux autres utilisateurs
        if (state.socket) {
            state.socket.send(JSON.stringify({ type: "user_status", userId: state.user.id, status: "offline" }));
        }
        window.location.reload();
    } catch (error) {
        console.error("❌ Erreur lors de la déconnexion :", error);
    }

    // ✅ Fermer WebSocket proprement
    if (state.socket) {
        console.log("🔌 Fermeture du WebSocket...");
        state.socket.close();
        state.socket = null;
    }

    // ✅ Suppression des infos utilisateur localement
    state.user = null;
    state.token = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    console.log("✅ Déconnexion réussie.");

    // ✅ Empêcher la redirection infinie en vérifiant si on est déjà sur /login
    if (window.location.pathname !== "/login") {
        navigateTo(new Event("click"), "/login");
    }
}

// Gère la connexion utilisateur
export async function login(username: string, password: string, redirection: boolean, language : string) {
    try {
        const response: Response = await fetch(`${API_CONFIG.API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, language}),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur de connexion");

        // Sauvegarde les informations utilisateur
        if (data.requires2FA)
        {
            const codeOTP: string | null = prompt("Code 2FA :");
            const response: Response = await fetch(`${API_CONFIG.API_BASE_URL}/validate-2fa`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, codeOTP }),
            });
            const data = await response.json();
            if (data.error)
            {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
            if (!response.ok) throw new Error(data.error || "Erreur de connexion");
            saveAuthData(data.token, data.user);
            connectToWebSocket(data.user.id, (message) => {
                console.log("📩 Message WebSocket reçu :", message);
            });
            if (redirection)
                window.location.href = "/matches";
            return ;
        }
        saveAuthData(data.token, data.user);
        connectToWebSocket(data.user.id, (message) => {
            console.log("📩 Message WebSocket reçu :", message);
        });
        if (redirection)
            window.location.href = "/matches";
    } catch (error) {
        console.error("❌ Échec de la connexion :", error);
        throw error;
    }
}

// Inscription d'un utilisateur
export async function register(username: string, email: string, password: string) {
    try {
        const response: Response = await fetch(`${API_CONFIG.API_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur d'inscription");
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Échec de l'inscription :", error);
        throw error;
    }
}

export async function loginWithoutSession(username: string, password: string) {
    const response: Response = await fetch(`${API_CONFIG.API_BASE_URL}/login`, { 
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
        return await response.json(); // ✅ Retourne juste les infos du user sans modifier `state.user`
    } else {
        throw new Error("Login failed");
    }
}


// Connexion WebSocket avec reconnexion automatique
export function connectToWebSocket(userId: string, onMessage: (message: any) => void) {
    if (!userId) return;

    // Utiliser WSS via la configuration
    let socket = new WebSocket(`${API_CONFIG.WS_URL}/?userId=${userId}`);

    socket.onopen = () => {
        console.log("✅ Connecté au WebSocket Sécurisé en tant que", userId);
    };

    socket.onclose = () => {
        console.log("❌ Déconnecté du WebSocket. Reconnexion...");
        //setTimeout(() => connectToWebSocket(userId, onMessage), 3000); // Essaye de se reconnecter après 3s
    };

    socket.onerror = (error) => {
        console.error("⚠️ Erreur WebSocket :", error);
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("📩 Message WebSocket reçu :", message);
        onMessage(message);
    };
}
