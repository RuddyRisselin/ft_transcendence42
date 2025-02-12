const Fastify = require("fastify"); // ✅ Remplace `import` par `require`
const cors = require("@fastify/cors");

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true,
});

// Route de test
fastify.get("/test", async (request, reply) => {
  return { message: "Connexion réussie avec le backend!" };
});

// Démarrer le serveur
fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Serveur backend en cours d'exécution sur ${address}`);
});
