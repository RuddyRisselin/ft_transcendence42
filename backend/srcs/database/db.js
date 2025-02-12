const Database = require('better-sqlite3');
require('dotenv').config();

const db = new Database('./database/ft_transcendence.db', { verbose: console.log });

// Création des tables si elles n'existent pas encore
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT DEFAULT 'default.png',
        status TEXT CHECK( status IN ('online', 'offline', 'in-game') ) DEFAULT 'offline',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1_id INTEGER NOT NULL,
        player2_id INTEGER NOT NULL,
        winner_id INTEGER NOT NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player1_id) REFERENCES users(id),
        FOREIGN KEY (player2_id) REFERENCES users(id),
        FOREIGN KEY (winner_id) REFERENCES users(id)
    );
`);

module.exports = db;
