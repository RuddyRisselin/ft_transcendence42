const Fastify = require("fastify");
const cors = require("@fastify/cors");
require("dotenv").config();
const db = require("./database/db");

const fastify = Fastify({ logger: true });

// Configuration de CORS pour permettre la connexion avec le frontend
fastify.register(cors, {
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true,
});

// Route de test pour vérifier la connexion avec le frontend
fastify.get("/test", async (request, reply) => {
  return { message: "Connexion réussie avec le backend!" };
});

// Enregistrement des routes pour les utilisateurs et les matchs
fastify.register(require("./routes/users"));
fastify.register(require("./routes/matches"));

// Démarrer le serveur
fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`🚀 Serveur backend en cours d'exécution sur ${address}`);
});
