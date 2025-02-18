const db = require('../database/db');

async function matchesRoutes(fastify, options) {
    // Récupérer les matchs d'un utilisateur avec les noms des joueurs
    fastify.get('/matches', async (request, reply) => {
        const { userId } = request.query;
    
        if (!userId) {
            return reply.status(400).send({ error: "Missing userId parameter" });
        }
    
        try {
            const matches = db.prepare(`
                SELECT 
                    matches.id,
                    matches.player1_id,
                    matches.player2_id,
                    matches.winner_id,
                    matches.played_at,
                    p1.username AS player1_name, 
                    p2.username AS player2_name, 
                    w.username AS winner_name
                FROM matches
                JOIN users p1 ON matches.player1_id = p1.id
                JOIN users p2 ON matches.player2_id = p2.id
                JOIN users w ON matches.winner_id = w.id
                WHERE matches.player1_id = ? OR matches.player2_id = ?
                ORDER BY matches.played_at DESC
            `).all(userId, userId);
    
            console.log(`Matches fetched for user ${userId}:`, matches); // Vérification
    
            // Vérifier si la réponse est bien un tableau, sinon la convertir en tableau
            const result = Array.isArray(matches) ? matches : [matches];
    
            console.log(`Final matches array sent to frontend:`, result); // Vérification finale
            reply.send(result);
        } catch (error) {
            console.error("Error fetching matches:", error);
            reply.status(500).send({ error: "Internal server error" });
        }
      });
    
      fastify.get('/leaderboard', async (request, reply) => {
        try {
            const leaderboard = db.prepare(`
                SELECT 
                    users.id, 
                    users.username, 
                    users.avatar, 
                    COUNT(matches.winner_id) AS wins
                FROM users
                LEFT JOIN matches ON users.id = matches.winner_id
                GROUP BY users.id
                ORDER BY wins DESC
            `).all();
    
            console.log("Leaderboard data:", leaderboard); // Debugging
            reply.send(leaderboard);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            reply.status(500).send({ error: "Internal server error" });
        }
    });
    
      // Ajouter un match
      fastify.post('/matches', async (request, reply) => {
        const { player1_id, player2_id, winner_id } = request.body;
        
        if (!player1_id || !player2_id || !winner_id) {
            return reply.status(400).send({ error: "Missing required parameters" });
        }
    
        try {
          const insert = db.prepare(`
            INSERT INTO matches (player1_id, player2_id, winner_id, played_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          `);
          const info = insert.run(player1_id, player2_id, winner_id);
    
          console.log(`New match added:`, { id: info.lastInsertRowid, player1_id, player2_id, winner_id });
    
          reply.send({ id: info.lastInsertRowid, player1_id, player2_id, winner_id });
        } catch (error) {
          console.error("Error inserting match:", error);
          reply.status(400).send({ error: "Erreur lors de l'ajout du match" });
        }
      });

    // File d'attente pour matchmaking
    const waitingQueue = [];
    const activeMatches = new Map();

    fastify.post('/matches/join', async (request, reply) => {
        const { userId } = request.body;

        if (!userId) {
            return reply.status(400).send({ error: "User ID requis" });
        }

        if (waitingQueue.includes(userId)) {
            return reply.status(400).send({ error: "Déjà en attente" });
        }

        waitingQueue.push(userId);
        console.log(`✅ Joueur ${userId} en attente de match (${waitingQueue.length} en file)`);

        if (waitingQueue.length >= 2) {
            const player1 = waitingQueue.shift();
            const player2 = waitingQueue.shift();

            console.log(`🎮 Match trouvé entre ${player1} et ${player2}`);

            const matchId = `${player1}-${player2}`;
            activeMatches.set(matchId, { player1, player2 });

            // Envoi du match trouvé aux joueurs via WebSocket
            fastify.websocketServer.clients.forEach(client => {
                try {
                    client.send(JSON.stringify({
                        type: "match_found",
                        match: {
                            matchId,
                            player1,
                            player2
                        }
                    }));
                } catch (err) {
                    console.error(`❌ Erreur en envoyant le match à un joueur:`, err);
                }
            });

            return reply.send({ message: "Match trouvé", match: { matchId, player1, player2 } });
        } else {
            return reply.send({ message: "Ajouté à la file d'attente", queue: waitingQueue });
        }
    });
}

module.exports = matchesRoutes;
