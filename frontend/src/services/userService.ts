import { saveAuthData } from "./auth";
import { state } from "../../src/state";
import API_CONFIG from "../config/apiConfig";

interface User {
    id: number;
    username: string;
    email?: string;
    avatar: string | null;
    status: string;
    wins: number;
    anonymize: number;
    [key: string]: any;
}

// Cache pour éviter les requêtes inutiles
let cachedUsers: Map<number, User> = new Map();
let lastFetchTime: number = 0;
const CACHE_DURATION = 5000; // 5 secondes

export async function refreshUserCache() {
    console.log("🔄 Rafraîchissement forcé du cache utilisateurs");
    lastFetchTime = 0;
    cachedUsers.clear();
    return await getUsers();
}

export async function getUsers(): Promise<User[]> {
    const now = Date.now();
    
    // Rafraîchir les données uniquement si le cache est expiré
    if (cachedUsers.size > 0 && now - lastFetchTime < CACHE_DURATION) {
        console.log("🔹 Utilisation du cache pour la liste des utilisateurs");
        return Array.from(cachedUsers.values());
    }

    console.log("🔹 Envoi de la requête GET vers /users/all...");

    try {
        const response = await fetch(`${API_CONFIG.API_BASE_URL}/users/all`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: 'no-cache' // Forcer le rafraîchissement depuis le serveur
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const users: User[] = await response.json();
        
        // Mise à jour du cache
        cachedUsers.clear();
        users.forEach(user => {
            // S'assurer que l'avatar est correctement formaté
            if (user.avatar) {
                user.avatar = user.avatar.startsWith('http') ? user.avatar : `${API_CONFIG.API_BASE_URL}/images/${user.avatar}`;
            } else {
                user.avatar = `${API_CONFIG.API_BASE_URL}/images/default.jpg`;
            }
            // S'assurer que wins est un nombre
            user.wins = parseInt(user.wins as any) || 0;
            cachedUsers.set(user.id, user);
        });
        lastFetchTime = now;

        console.log("✅ Utilisateurs reçus :", users);
        return users;
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
        if (cachedUsers.size > 0) {
            console.log("⚠️ Utilisation des données en cache suite à l'erreur");
            return Array.from(cachedUsers.values());
        }
        return [];
    }
}

// Mise à jour des informations de l'utilisateur
export async function updateUser(token: string | "", username:string, inputUsername: string, inputEmail: string) {
    try {
        const response: Response = await fetch(`${API_CONFIG.API_BASE_URL}/users/username/${username}/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inputUsername, inputEmail }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        saveAuthData(token, data.user);
        console.log(`✅ Utilisateur ${username} mis à jour`);
        return true;
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de l'utilisateur :", error);
        return false;
    }
}

export async function updatePhotoUser(username: string, file: string) {
    try {
        const response = await fetch(`${API_CONFIG.API_BASE_URL}/users/username/${username}/updatephoto`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, file }),
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        
        // Forcer le rafraîchissement immédiat du cache
        await refreshUserCache();
        
        // Si l'utilisateur connecté a mis à jour sa photo, mettre à jour le state
        if (state.user && state.user.username === username) {
            state.user = {
                ...state.user,
                avatar: file
            };
            localStorage.setItem("user", JSON.stringify(state.user));
        }

        console.log(`✅ Photo de l'utilisateur ${username} mise à jour`);
        return true;
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de la photo :", error);
        return false;
    }
}

export async function deleteUser(username: string) {
    console.log(`Envoi de la requête DELETE pour : ${username}`);
    try {
        const response: Response = await fetch(`${API_CONFIG.API_BASE_URL}/users/username/${username}`, {
            method: "DELETE",
        });

        console.log("📡 Réponse du serveur :", response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        console.log(`✅ Utilisateur ${username} supprimé`);
        return true;
    } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'utilisateur :", error);
        return false;
    }
}


export async function anonymizeUser(username: string, token: string | "") {
    console.log(`🛠️ Envoi de la requête PATCH pour anonymiser : ${username}`);

    try {
        const response: Response = await fetch(`${API_CONFIG.API_BASE_URL}/users/username/${username}/anonymize`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur de connexion");
        
        saveAuthData(token, data.user);
        console.log("DATA ANONYMIZE = ", data);
        console.log("📡 Reponse du serveur :", response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        console.log(`✅ Utilisateur ${username} anonymiser`);
        return true;
    } catch (error) {
        console.error("❌ Erreur lors de l'anonymisation de l'utilisateur :", error);
        return false;
    }
}

export async function getAllUsers() {
    const response: Response = await fetch(`${API_CONFIG.API_BASE_URL}/users`);
    return response.json();
}

export async function authenticateUser(username: string, password: string) {
    const response: Response = await fetch(`${API_CONFIG.API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    return response.ok;
}

export async function getQrcode(userId : number, username : string)
{
    return fetch(`${API_CONFIG.API_BASE_URL}/2FA/generate-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({userId, username})
    })
    .then(response => response.json())
    .then(data => data.qrCode)
    .catch(error => console.error("Erreur lors de la récupération du QR Code:", error));    
}


export async function update2FAOff(userId : number, username : string)
{
    return fetch(`${API_CONFIG.API_BASE_URL}/2FA/disable-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({userId, username})
    })
    .then(response => response.json())
    .catch(error => console.error("Erreur lors de la désacivation du 2FA:", error));   
}

export async function getUserById(userId: number): Promise<User | null> {
    // Vérifier d'abord dans le cache
    if (cachedUsers.has(userId)) {
        const cachedUser = cachedUsers.get(userId);
        const cacheAge = Date.now() - lastFetchTime;
        
        // Utiliser le cache si les données sont récentes
        if (cacheAge < CACHE_DURATION) {
            console.log(`🔹 Utilisation du cache pour l'utilisateur ${userId}`);
            return cachedUser || null;
        }
    }

    // Si pas dans le cache ou cache expiré, récupérer tous les utilisateurs
    const users = await getUsers();
    const user = users.find(u => u.id === userId);
    return user || null;
}

export async function updateLanguage(userId : number, language : string)
{
    return fetch(`${API_CONFIG.API_BASE_URL}/users/language`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({userId, language})
    })
    .then(response => response.json())
    .catch(error => console.error("Erreur lors de la mise à jour de la langue:", error));
}

