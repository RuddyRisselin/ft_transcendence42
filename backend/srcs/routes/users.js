const db = require("../database/db");

async function userRoutes(fastify) {
  // 🔹 Récupérer tous les utilisateurs
  fastify.get("/users", async (request, reply) => {
    const users = db.prepare("SELECT id, username, email, avatar, status, created_at FROM users").all();
    return users;
  });

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

  fastify.get("/users/all", async (request, reply) => {
    try {
      const users = db.prepare("SELECT id, username, status, anonymize FROM users ORDER BY status DESC").all();
      return users;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
      return reply.status(500).send({ error: "Erreur serveur." });
    }
  });

  // 🔹 Mettre à jour le statut d'un utilisateur
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

  // 🔹 Update un utilisateur
  fastify.patch("/users/username/:username/update", async (request, reply) => {
    const { username } = request.params;
    const { username: inputUsername, email: inputEmail } = request.body;
    console.log ("UPDATE Username = " + inputUsername);
    console.log ("UPDATE Email = " + inputEmail);
    try
    {
      const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
      if (!user)
      {
        console.log("❌ Utilisateur introuvable");
        return reply.status(404).send({ error: "Utilisateur non trouvé." });
      }
      // db.prepare("DELETE FROM matches WHERE player1_id = ? OR player2_id = ?").run(user.id, user.id)
      // db.prepare("DELETE FROM users WHERE username = ?").run(username);
      console.log("✅ Utilisateur mis a jour avec succès");
      return { message: "Utilisateur mis a jour avec succès!" };
    }
    catch (error)
    {
      console.error("Erreur lors de la mis a jour de l'utilisateur :", error);
      return reply.status(500).send({ error: "Erreur serveur." });
    }
  });

  // 🔹 Supprimer un utilisateur
  fastify.delete("/users/username/:username", async (request, reply) => {
    const { username } = request.params;
    console.log("🔹 Suppression de l'utilisateur :", username);
    try
    {
      const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
      if (!user)
      {
        console.log("❌ Utilisateur introuvable");
        return reply.status(404).send({ error: "Utilisateur non trouvé." });
      }
      db.prepare("DELETE FROM matches WHERE player1_id = ? OR player2_id = ?").run(user.id, user.id)
      db.prepare("DELETE FROM users WHERE username = ?").run(username);
      console.log("✅ Utilisateur supprimé avec succès");
      return { message: "Utilisateur supprimé avec succès!" };
    }
    catch (error)
    {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
      return reply.status(500).send({ error: "Erreur serveur." });
    }
  });

  // Anonymisation d'un utilisateur
  fastify.patch('/users/username/:username/anonymize', async (request, reply) => {
    const { username } = request.params;
    try
    {
      const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
      if (!user)
        return reply.status(404).send({ error: "Utilisateur non trouver" });
      
      if (user.anonymize === 1)
        {
            db.prepare("UPDATE users SET anonymize = 0, username = ?, email = ? WHERE username = ?")
            .run(username.split("_")[1], user.email.split("_")[1], username);
            user.username = username.split("_")[1];
            user.email = user.email.split("_")[1];
        }
        else
        {
          db.prepare("UPDATE users SET anonymize = 1 WHERE username = ?")
          .run(username);
          const anonymizeUsername = "anonymize_" + username;
          const anonymizeEmail = "anonymize_" + user.email;
          db.prepare("UPDATE users SET username = ?, email = ? WHERE username = ?")
          .run(anonymizeUsername, anonymizeEmail, username);
          user.username = anonymizeUsername;
          user.email = anonymizeEmail;
        }
        const newAnonymize = user.anonymize === 1 ? 0 : 1;
        user.anonymize = newAnonymize;
      reply.send({ message: "Utilisateur anonymiser avec succes", user });
    }
    catch (error)
    {
      console.error("Erreur lors de l'anonymisation de l'utilisateur", error);
      reply.status(500).send({ error: "Erreur serveur" });
    }
  });
}

module.exports = userRoutes;
