const db = require("../database/db"); // 🔹 Importer la base de données
const usersOnline = new Map();

module.exports = function (fastify, opts, done) {
    fastify.get("/ws", { websocket: true }, (connection, req) => {
        console.log("🔍 Connexion WebSocket détectée, URL:", req.url);

        // ✅ Extraire userId de l'URL
        const url = new URL(req.url, `http://${req.headers.host}`);
        const userId = url.searchParams.get("userId");

        if (!userId) {
            console.error("❌ userId manquant dans la connexion WebSocket.");
            connection.close();
            return;
        }

        console.log(`✅ Utilisateur ${userId} connecté via WebSocket.`);
        usersOnline.set(userId, connection);
        
        // 🔹 Mettre à jour le statut de l'utilisateur en ligne
        updateUserStatus(userId, "online");
        broadcastMessage({ type: "user_status", userId, status: "online" });

        // ✅ Vérification régulière via `ping`
        const pingInterval = setInterval(() => {
            if (connection.readyState === 1) { // Si WebSocket est ouvert
                console.log(`📡 Ping envoyé à ${userId}`);
                try {
                    connection.ping(); // Envoyer un ping au client
                } catch (err) {
                    console.error(`⚠️ Erreur lors du ping de ${userId}:`, err);
                }
            } else {
                clearInterval(pingInterval);
            }
        }, 5000); // Ping toutes les 5 secondes

        // 🔹 Gérer le `pong` reçu du client
        connection.on("pong", () => {
            console.log(`✅ Réponse au ping de ${userId}`);
        });

        // 🔹 Gérer la fermeture de connexion
        connection.on("close", () => {
            console.log(`❌ Utilisateur ${userId} déconnecté.`);
            usersOnline.delete(userId);
            clearInterval(pingInterval); // Arrêter le ping

            // 🔹 Mettre à jour le statut de l'utilisateur hors ligne
            // Attendre un court délai pour les rafraîchissements de page
            // afin d'éviter les changements d'état incorrects
            setTimeout(() => {
                // Vérifier si l'utilisateur s'est reconnecté entre-temps
                if (!usersOnline.has(userId)) {
                    console.log(`⏱ Délai écoulé, utilisateur ${userId} toujours déconnecté.`);
                    updateUserStatus(userId, "offline");
                    broadcastMessage({ type: "user_status", userId, status: "offline" });
                } else {
                    console.log(`✅ L'utilisateur ${userId} s'est reconnecté rapidement, statut maintenu.`);
                }
            }, 2000); // Délai de 2 secondes avant de considérer l'utilisateur comme réellement déconnecté
        });

        // 🔹 Gérer les messages reçus
        connection.on("message", (message) => {
            try {
                const data = JSON.parse(message.toString());
                console.log(`📩 Message reçu de ${userId}:`, data);
                
                // Traiter les messages user_status spécialement
                if (data.type === "user_status") {
                    console.log(`📢 Mise à jour du statut utilisateur ${data.userId} → ${data.status}`);
                    updateUserStatus(data.userId, data.status);
                    
                    // Diffuser le statut à tous les utilisateurs connectés
                    if (data.isRefresh) {
                        console.log(`🔄 Message de rafraîchissement, mise à jour du statut sans broadcast`);
                    } else {
                        broadcastMessage(data);
                    }
                }
                
                // Autres types de messages peuvent être traités ici
                
            } catch (err) {
                console.error(`❌ Erreur lors du traitement du message:`, err);
            }
        });
    });

    done();
};

// 🔹 Fonction pour mettre à jour le statut de l'utilisateur uniquement si nécessaire
function updateUserStatus(userId, status) {
    const currentStatus = db.prepare("SELECT status FROM users WHERE id = ?").get(userId)?.status;
    if (currentStatus !== status) {
        db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, userId);
    }
}

// 🔹 Fonction pour envoyer un message à tous les utilisateurs connectés
function broadcastMessage(message) {
    for (const [userId, connection] of usersOnline) {
        try {
            connection.send(JSON.stringify(message));
        } catch (err) {
            console.error(`❌ Erreur en envoyant un message à ${userId}:`, err);
        }
    }
}

// 🔹 Vérification périodique des connexions WebSocket via ping
setInterval(() => {
    for (const [userId, connection] of usersOnline) {
        if (connection.readyState === 1) { // WebSocket ouvert
            try {
                connection.ping(); // Vérifier si la connexion est toujours active
            } catch (err) {
                console.error(`⚠️ Erreur lors du ping de ${userId}:`, err);
            }
        } else {
            console.log(`❌ Déconnexion détectée pour ${userId}`);
            usersOnline.delete(userId);
            
            // Même logique de délai pour les déconnexions détectées par ping
            setTimeout(() => {
                if (!usersOnline.has(userId)) {
                    updateUserStatus(userId, "offline");
                    broadcastMessage({ type: "user_status", userId, status: "offline" });
                }
            }, 2000);
        }
    }
}, 5000);

