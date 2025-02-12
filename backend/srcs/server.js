require('dotenv').config();
const Fastify = require('fastify');

const fastify = Fastify({ logger: true });

fastify.get('/', async (request, reply) => {
  return { message: 'Bienvenue sur Fastify !' };
});

fastify.register(require('./routes/user'));
fastify.register(require('./routes/matches'));

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 Serveur Fastify démarré sur http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

