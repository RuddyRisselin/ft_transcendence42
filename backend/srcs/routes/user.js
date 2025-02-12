async function userRoutes(fastify, options) {
    fastify.get('/users', async (request, reply) => {
      return [
        { id: 1, username: 'Ruddy' },
        { id: 2, username: 'Dev2' }
      ];
    });
  }
  
  module.exports = userRoutes;
  