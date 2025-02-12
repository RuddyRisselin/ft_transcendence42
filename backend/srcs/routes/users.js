const db = require("../database/db");
const bcrypt = require("bcrypt");

async function userRoutes(fastify, options) {
  fastify.get("/users", async (request, reply) => {
    const users = db.prepare("SELECT id, username, email, avatar, status, created_at FROM users").all();
    return users;
  });

  fastify.post("/users", async (request, reply) => {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
      return reply.status(400).send({ error: "Tous les champs sont obligatoires." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const insert = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
      const info = insert.run(username, email, hashedPassword);
      return { id: info.lastInsertRowid, username, email };
    } catch (error) {
      return reply.status(400).send({ error: "Utilisateur déjà existant." });
    }
  });
}

module.exports = userRoutes;
