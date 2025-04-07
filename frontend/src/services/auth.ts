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

        // ✅ Mettre à jour le statut utilisateur en "offline" uniquement sur déconnexion explicite
        // On vérifie s'il s'agit d'une déconnexion réelle ou d'un rafraîchissement
        const isRealLogout = !sessionStorage.getItem('refreshing');
        
        if (isRealLogout) {
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
        } else {
            console.log("⚠️ Rafraîchissement détecté, statut en ligne maintenu.");
        }
        
        if (isRealLogout) {
            window.location.reload();
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

    // ✅ Suppression des infos utilisateur localement pour une déconnexion réelle
    if (!sessionStorage.getItem('refreshing')) {
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
    if (!userId) {
        console.error("❌ Impossible de connecter le WebSocket: userId manquant");
        return;
    }

    // Note importante: format de l'URL corrigé pour correspondre exactement à ce que le backend attend
    const wsUrl = `${API_CONFIG.WS_URL}?userId=${userId}`;
    console.log("🔄 Tentative de connexion WebSocket à:", wsUrl);

    try {
        // Si c'est un rafraîchissement de page, mettre à jour immédiatement le statut
        const wasRefreshing = sessionStorage.getItem('refreshing');
        if (wasRefreshing) {
            console.log("📡 Reconnexion rapide après rafraîchissement");
        }

        // Utiliser WSS via la configuration
        let socket = new WebSocket(wsUrl);
        
        // Stocker la référence du socket dans l'état global
        state.socket = socket;

        socket.onopen = () => {
            console.log("✅ Connecté au WebSocket en tant que", userId);
            
            // Après un rafraîchissement, envoyer immédiatement un signal "online"
            // pour s'assurer que le statut reste cohérent
            if (sessionStorage.getItem('refreshing')) {
                try {
                    socket.send(JSON.stringify({ 
                        type: "user_status", 
                        userId: userId, 
                        status: "online",
                        isRefresh: true 
                    }));
                    console.log("🔄 Statut 'online' restauré après rafraîchissement");
                } catch (error) {
                    console.error("❌ Erreur lors de la restauration du statut:", error);
                }
            } else {
                // Message de test normal pour les nouvelles connexions
                try {
                    socket.send(JSON.stringify({ type: "ping", userId }));
                    console.log("📤 Message de test envoyé");
                } catch (error) {
                    console.error("❌ Erreur lors de l'envoi du message de test:", error);
                }
            }
        };

        socket.onclose = (event) => {
            // Ne pas se reconnecter si la fermeture est due à une navigation
            const isNavigating = !document.hasFocus();
            
            console.log(`❌ Déconnecté du WebSocket. Code: ${event.code}, Raison: ${event.reason || 'Non spécifiée'}.`, 
                isNavigating ? "Navigation détectée." : "Reconnexion...");
            
            state.socket = null;
            
            // Ne tenter la reconnexion que si nous sommes toujours sur la page
            if (!isNavigating) {
                setTimeout(() => connectToWebSocket(userId, onMessage), 3000);
            }
        };

        socket.onerror = (error) => {
            console.error("⚠️ Erreur WebSocket:", error);
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log("📩 Message WebSocket reçu:", message);
                onMessage(message);
            } catch (error) {
                console.error("❌ Erreur lors du traitement du message WebSocket:", error, "Message brut:", event.data);
            }
        };
    } catch (error) {
        console.error("❌ Erreur lors de la création du WebSocket:", error);
        setTimeout(() => connectToWebSocket(userId, onMessage), 3000); // Essaye de se reconnecter après 3s
    }
}
