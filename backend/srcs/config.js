const cors = require("@fastify/cors");
const jwt = require("@fastify/jwt");
const bcrypt = require("fastify-bcrypt");
require("dotenv").config();

async function configureServer(fastify) {
    await fastify.register(require("@fastify/cors"), {
      origin: ["http://localhost:5173", "https://localhost"],  // 🔒 Autorise uniquement le frontend
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true, 
      preflightContinue: true  // 🔥 Essaye de ne pas bloquer les préflight requests
  });

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET,
  });

  await fastify.register(bcrypt, {
    saltWorkFactor: 10,
  });

  return fastify;
}

module.exports = configureServer;
