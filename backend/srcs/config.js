const cors = require("@fastify/cors");
const jwt = require("@fastify/jwt");
const bcrypt = require("fastify-bcrypt");
require("dotenv").config();

async function configureServer(fastify) {
  // 🔹 Configuration du CORS pour autoriser le frontend
  fastify.register(cors, {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  });

  // 🔹 Configuration de JSON Web Token (JWT)
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || "supersecretkey", // 🔑 Change cette clé en prod
  });

  // 🔹 Configuration de bcrypt pour le hashage des mots de passe
  fastify.register(bcrypt, {
    saltWorkFactor: 10, // Nombre d'itérations pour sécuriser le hash
  });
}

module.exports = configureServer;
