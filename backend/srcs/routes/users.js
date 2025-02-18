const db = require("../database/db");

async function userRoutes(fastify) {
  // Récupérer tous les utilisateurs
  fastify.get("/users", async (request, reply) => {
    const users = db.prepare("SELECT id, username, email, avatar, status, created_at FROM users").all();
    return users;
  });

  // Mettre à jour le statut d'un utilisateur
  fastify.patch("/users/:id/status", async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;

    const validStatus = ["online", "offline", "in-game"];
    if (!validStatus.includes(status)) {
      return reply.status(400).send({ error: "Statut invalide." });
    }

    try {
      db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, id);
      return { message: "Statut mis à jour!" };
    } catch (error) {
      return reply.status(400).send({ error: "Erreur lors de la mise à jour du statut." });
    }
  });

  // Récupérer les statistiques d'un utilisateur
fastify.get("/user/stats", async (request, reply) => {
  const { userId } = request.query;

  if (!userId) {
      return reply.status(400).send({ error: "Missing userId parameter" });
  }

  try {
      const stats = db.prepare(`
          SELECT 
              (SELECT COUNT(*) FROM matches WHERE player1_id = ? OR player2_id = ?) AS totalGames,
              (SELECT COUNT(*) FROM matches WHERE winner_id = ?) AS wins,
              ((SELECT COUNT(*) FROM matches WHERE player1_id = ? OR player2_id = ?) - 
              (SELECT COUNT(*) FROM matches WHERE winner_id = ?)) AS losses
      `).get(userId, userId, userId, userId, userId, userId);

      if (!stats) {
          return reply.status(404).send({ error: "No stats found for this user" });
      }

      reply.send(stats);
  } catch (error) {
      console.error("Error fetching user stats:", error);
      reply.status(500).send({ error: "Internal server error" });
  }

});

}

module.exports = userRoutes;
