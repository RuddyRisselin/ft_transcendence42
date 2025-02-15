const Fastify = require("fastify");
const configureServer = require("./config");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const matchRoutes = require("./routes/matches");


const fastify = Fastify({ logger: true });

// Configuration CORS, JWT, Bcrypt
configureServer(fastify);

// Routes
fastify.register(authRoutes);
fastify.register(userRoutes);
fastify.register(matchRoutes);

// ✅ Démarrer le serveur
fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`🚀 Serveur backend en cours d'exécution sur ${address}`);
});
