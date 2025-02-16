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
}

module.exports = matchesRoutes;
