const db = require('../database/db');

async function matchesRoutes(fastify, options) {
  // Récupérer tous les matchs
  fastify.get('/matches', async (request, reply) => {
    const matches = db.prepare('SELECT * FROM matches').all();
    return matches;
  });

  // Ajouter un match
  fastify.post('/matches', async (request, reply) => {
    const { player1_id, player2_id, winner_id } = request.body;
    try {
      const insert = db.prepare('INSERT INTO matches (player1_id, player2_id, winner_id) VALUES (?, ?, ?)');
      const info = insert.run(player1_id, player2_id, winner_id);
      return { id: info.lastInsertRowid, player1_id, player2_id, winner_id };
    } catch (error) {
      reply.status(400).send({ error: 'Erreur lors de l\'ajout du match' });
    }
  });
}

module.exports = matchesRoutes;
