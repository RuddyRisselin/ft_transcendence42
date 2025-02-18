const Fastify = require("fastify");
const websocket = require("@fastify/websocket");
const configureServer = require("./config");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const matchRoutes = require("./routes/matches");
const gameWsRoutes = require("./websockets/gameWs");

async function startServer() {
  const fastify = Fastify({ logger: true });

  // ✅ Attendre que Fastify soit bien configuré
  await configureServer(fastify);

  // 🔹 Ajouter les WebSockets
  await fastify.register(websocket);

  // 🔹 Ajouter les routes API
  await fastify.register(authRoutes);
  await fastify.register(userRoutes);
  await fastify.register(matchRoutes);
  await fastify.register(gameWsRoutes);

  // ✅ Démarrer le serveur après configuration complète
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    fastify.log.info("🚀 Serveur backend en cours d'exécution sur http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// 🔹 Lancer le serveur Fastify
startServer();
