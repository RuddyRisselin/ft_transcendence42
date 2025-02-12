async function matchesRoutes(fastify, options) {
    fastify.get('/matches', async (request, reply) => {
      return [
        { id: 1, player1: 'Alice', player2: 'Bob', winner: 'Alice' },
        { id: 2, player1: 'Charlie', player2: 'David', winner: 'David' }
      ];
    });
  }
  
  module.exports = matchesRoutes;
  