const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const userSecrets = {}; // Pour stocker temporairement les secrets

async function twoFaRoutes(fastify) {
  // 🔹 Route pour générer le QR Code
  fastify.post('/generate-2fa', async (request, reply) => {
    const userId = request.body.userId;
    const username = request.body.username;

    if (!userId) {
      return reply.status(400).send({ error: 'userId est requis' });
    }

    // Génération du secret
    const secret = speakeasy.generateSecret({
      name: `ft_transcendence (${username})`,
    });

    userSecrets[userId] = secret;

    try {
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
      return reply.send({ qrCode: qrCodeUrl, secret: secret.base32 });
    } catch (error) {
      return reply.status(500).send({ error: 'Erreur lors de la génération du QR Code.' });
    }
  });

  fastify.post('/enable-2fa', async (request, reply) => {
    const { userId } = request.body;
  
    if (!userId) {
      return reply.status(400).send({ error: 'userId est requis' });
    }
  
    // Générer un secret et stocker dans la BDD
    const secret = speakeasy.generateSecret({
      name: `ft_transcendence (${userId})`,
    });
  
    await fastify.pg.query(
      'UPDATE users SET twoFASecret = $1, is2FAEnabled = TRUE WHERE id = $2',
      [secret.base32, userId]
    );
  
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    return reply.send({ qrCode: qrCodeUrl, secret: secret.base32 });
  });

  

  fastify.post('/disable-2fa', async (request, reply) => {
    const { userId } = request.body;
  
    if (!userId) {
      return reply.status(400).send({ error: 'userId est requis' });
    }
  
    await fastify.pg.query(
      'UPDATE users SET twoFASecret = NULL, is2FAEnabled = FALSE WHERE id = $1',
      [userId]
    );
  
    return reply.send({ success: true });
  });
}

module.exports = twoFaRoutes;
