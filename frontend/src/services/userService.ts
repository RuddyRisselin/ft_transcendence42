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
export async function updateUser(username: string, email: string) {
    try {
        const response = await fetch("/api/users/update", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email }),
        });

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

