const db = require("../database/db");

async function tournamentRoutes(fastify, options) {
    
    // Récupérer les tournois d'un joueur spécifique
    fastify.get('/tournaments', async (request, reply) => {
        const { userId } = request.query;

        if (!userId) {
            return reply.status(400).send({ error: "Missing userId parameter" });
        }

        try {
            const tournaments = db.prepare(`
                SELECT id, created_at, players, ranking 
                FROM tournaments
                WHERE json_extract(players, '$') LIKE ?
                ORDER BY created_at DESC
            `).all(`%${userId}%`);

            console.log(`Tournaments fetched for user ${userId}:`, tournaments);
            
            reply.send(Array.isArray(tournaments) ? tournaments : [tournaments]);
        } catch (error) {
            console.error("Error fetching tournaments:", error);
            reply.status(500).send({ error: "Internal server error" });
        }
    });

    // Ajouter un tournoi
    fastify.post('/tournaments', async (request, reply) => {
        const { players } = request.body;

        if (!players || !Array.isArray(players) || players.length < 2) {
            return reply.status(400).send({ error: "Invalid players list. Must contain at least 2 players." });
        }

        try {
            const insert = db.prepare(`
                INSERT INTO tournaments (players, ranking) 
                VALUES (?, NULL)
            `);
            const info = insert.run(JSON.stringify(players));

            console.log(`New tournament added with ID ${info.lastInsertRowid}:`, players);
            reply.send({ id: info.lastInsertRowid, players, ranking: null });
        } catch (error) {
            console.error("Error inserting tournament:", error);
            reply.status(400).send({ error: "Error adding tournament" });
        }
    });

    // Mettre à jour le classement d'un tournoi
    fastify.put('/tournaments/:id/ranking', async (request, reply) => {
        const { id } = request.params;
        const { ranking } = request.body;

        if (!ranking || !Array.isArray(ranking)) {
            return reply.status(400).send({ error: "Invalid ranking format. Must be an array of player IDs." });
        }

        try {
            const update = db.prepare(`
                UPDATE tournaments
                SET ranking = ?
                WHERE id = ?
            `);
            update.run(JSON.stringify(ranking), id);

            console.log(`Updated ranking for tournament ${id}:`, ranking);
            reply.send({ id, ranking });
        } catch (error) {
            console.error("Error updating ranking:", error);
            reply.status(400).send({ error: "Error updating tournament ranking" });
        }
    });

    // Récupérer tous les tournois
    fastify.get('/tournaments/all', async (request, reply) => {
        try {
            const tournaments = db.prepare(`
                SELECT * FROM tournaments
                ORDER BY created_at DESC
            `).all();

            console.log("Fetched all tournaments:", tournaments);
            reply.send(tournaments);
        } catch (error) {
            console.error("Error fetching tournaments:", error);
            reply.status(500).send({ error: "Internal server error" });
        }
    });
}

module.exports = tournamentRoutes;
