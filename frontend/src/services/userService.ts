// import { log } from "console";
import { saveAuthData } from "./auth";

// Cache pour éviter les requêtes inutiles
let cachedUsers: any[] = [];
let lastFetchTime: number = 0;

export async function getUsers() {
    const now = Date.now();
    
    // Rafraîchir les données uniquement toutes les 10 secondes
    if (cachedUsers.length > 0 && now - lastFetchTime < 10000) {
        console.log("🔹 Utilisation du cache pour la liste des utilisateurs");
        return cachedUsers;
    }

    console.log("🔹 Envoi de la requête GET vers /users/all...");

    try {
        const response = await fetch("http://localhost:3000/users/all", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const users = await response.json();
        cachedUsers = users;  // Mise en cache des utilisateurs
        lastFetchTime = now;

        console.log("✅ Utilisateurs reçus :", users);
        return users;
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
        return [];
    }
}

// Mise à jour des informations de l'utilisateur
export async function updateUser(token: string | "", username:string, inputUsername: string, inputEmail: string) {
    try {
        // const response = await fetch("/api/users/update", {
        const response = await fetch(`http://localhost:3000/users/username/${username}/update`, {
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

export async function updatePhotoUser(username:string, file: string) {
    try {
        // const response = await fetch("/api/users/update", {
        const response = await fetch(`http://localhost:3000/users/username/${username}/updatephoto`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, file }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        console.log(`✅ Utilisateur ${username} mis à jour`);
        return true;
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de l'utilisateur :", error);
        return false;
    }
}

export async function deleteUser(username: string) {
    console.log(`Envoi de la requête DELETE pour : ${username}`);
    try {
        // const response = await fetch(`/api/users/username/${username}`, {
            const response = await fetch(`http://localhost:3000/users/username/${username}`, {
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
        // const response = await fetch(`/api/users/username/${username}/anonymize`, {
        const response = await fetch(`http://localhost:3000/users/username/${username}/anonymize`, {
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
    const response = await fetch("/api/users");
    return response.json();
}

export async function authenticateUser(username: string, password: string) {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    return response.ok;
}

