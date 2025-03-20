const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const userSecrets = {}; // Pour stocker temporairement les secrets

async function twoFaRoutes(fastify) {
  // 🔹 Route pour générer le QR Code
  fastify.post('/generate-2fa', async (request, reply) => {
    const { userId } = request.body;

    if (!userId) {
      return reply.status(400).send({ error: 'userId est requis' });
    }

    // Génération du secret
    const secret = speakeasy.generateSecret({
      name: `ft_transcendence (${userId})`,
    });

    userSecrets[userId] = secret;

    try {
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
      return reply.send({ qrCode: qrCodeUrl, secret: secret.base32 });
    } catch (error) {
      return reply.status(500).send({ error: 'Erreur lors de la génération du QR Code.' });
    }
  });
}

module.exports = twoFaRoutes;
