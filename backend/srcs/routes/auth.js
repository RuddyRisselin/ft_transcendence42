const db = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function authRoutes(fastify) {
  // 🔹 Route d'inscription
  fastify.post("/register", async (request, reply) => {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
      return reply.status(400).send({ error: "Tous les champs sont obligatoires." });
    }

    // Vérifie si l'utilisateur existe déjà
    const existingUser = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(username, email);
    if (existingUser) {
      return reply.status(400).send({ error: "Utilisateur déjà existant." });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const insert = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
      const info = insert.run(username, email, hashedPassword);

      // Génération d'un token JWT
      const token = jwt.sign({ id: info.lastInsertRowid, username }, process.env.JWT_SECRET || "supersecretkey");

      return reply.send({ message: "Utilisateur inscrit avec succès!", token, user: { id: info.lastInsertRowid, username, email } });
    } catch (error) {
      return reply.status(400).send({ error: "Erreur lors de l'inscription." });
    }
  });

  // 🔹 Route de connexion
  fastify.post("/login", async (request, reply) => {
    const { username, password } = request.body;

    // Recherche de l'utilisateur
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) {
      return reply.status(401).send({ error: "Utilisateur introuvable." });
    }

    // Vérification du mot de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return reply.status(401).send({ error: "Mot de passe incorrect." });
    }

    // Vérification si le 2FA est activé
    if (user.is2FAEnabled) {
      return reply.send({ requires2FA: true, userId: user.id });
    }

    // Génération du token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || "supersecretkey");
    // db.prepare("UPDATE users SET is2FAEnabled = 1 WHERE username = ?").run(username);
    return reply.send({ message: "Connexion réussie!", token, user });
  });

  // 🔹 Route pour valider le 2FA et générer le JWT
  fastify.post("/validate-2fa", async (request, reply) => {
    const { userId, token } = request.body;

    // Recherche de l'utilisateur
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user || !user.twoFASecret) {
      return reply.status(400).send({ error: "Utilisateur introuvable ou 2FA non activé." });
    }

    // Vérification du code OTP
    const isValid = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token,
    });

    if (!isValid) {
      return reply.status(400).send({ error: "Code OTP invalide." });
    }

    // Génération du JWT après validation du 2FA
    const authToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || "supersecretkey");

    return reply.send({ message: "Connexion réussie avec 2FA!", token: authToken, user });
  });

  fastify.post("/logout", async (request, reply) => {
      try {
          const { userId } = request.body;

          if (!userId) {
              return reply.status(400).send({ error: "L'ID utilisateur est requis." });
          }

          // ✅ Mettre à jour la base de données pour signaler que l'utilisateur est hors ligne
          db.prepare("UPDATE users SET status = 'offline' WHERE id = ?").run(userId);

          return reply.send({ message: "Utilisateur déconnecté avec succès." });
      } catch (error) {
          return reply.status(500).send({ error: "Erreur lors de la déconnexion." });
      }
  });
}

module.exports = authRoutes; 


// fastify.post("/login", async (request, reply) => {
  //   const { username, password } = request.body;

  //   // Recherche de l'utilisateur
  //   const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  //   if (!user) {
  //     return reply.status(401).send({ error: "Utilisateur introuvable." });
  //   }

  //   // Vérification du mot de passe
  //   const isValid = await bcrypt.compare(password, user.password);
  //   if (!isValid) {
  //     return reply.status(401).send({ error: "Mot de passe incorrect." });
  //   }

  //   // Génération du token JWT
  //   const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || "supersecretkey");

  //   return reply.send({ message: "Connexion réussie!", token, user });
  // });
