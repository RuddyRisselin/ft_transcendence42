import { state } from "../state";
import { navigateTo } from "../router";
// Sauvegarde le token et l'utilisateur
export function saveAuthData(token: string, user: any) {
    state.token = token;
    state.user = user;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
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
        await fetch(`http://localhost:3000/users/${state.user.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "offline" }),
        });

        console.log("✅ Serveur mis à jour : utilisateur offline.");

        // ✅ Envoyer immédiatement un message WebSocket aux autres utilisateurs
        if (state.socket) {
            state.socket.send(JSON.stringify({ type: "user_status", userId: state.user.id, status: "offline" }));
        }

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
export async function login(username: string, password: string, redirection: boolean) {
    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur de connexion");

        // Sauvegarde les informations utilisateur
        saveAuthData(data.token, data.user);

        // Connexion WebSocket après login
        connectToWebSocket(data.user.id, (message) => {
            console.log("📩 Message WebSocket reçu :", message);
        });
        if (redirection)
            window.location.href = "/dashboard";
    } catch (error) {
        console.error("❌ Échec de la connexion :", error);
        throw error;
    }
}

// Inscription d'un utilisateur
export async function register(username: string, email: string, password: string) {
    try {
        const response = await fetch("http://localhost:3000/register", {
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
    const response = await fetch("http://localhost:3000/login", { 
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

    let socket = new WebSocket(`ws://localhost:3000/ws?userId=${userId}`);

    socket.onopen = () => {
        console.log("✅ Connecté au WebSocket en tant que", userId);
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
