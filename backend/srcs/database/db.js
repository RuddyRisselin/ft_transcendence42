const Database = require("better-sqlite3");
require("dotenv").config();

try {
  const db = new Database("./database/ft_transcendence.db", { verbose: console.log });

  // Création des tables si elles n'existent pas encore
  db.exec(`

      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          anonymize INTEGER NOT NULL CHECK(anonymize IN (0, 1)) DEFAULT 0,
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
      
      CREATE TABLE IF NOT EXISTS tournaments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          players TEXT NOT NULL,
          ranking TEXT
      );
  `);

  const columnExists = db
  .prepare("PRAGMA table_info(users);")
  .all()
  .some(column => column.name === "anonymize");

  if (!columnExists)
    db.exec(`ALTER TABLE users ADD COLUMN anonymize INTEGER NOT NULL CHECK(anonymize IN (0, 1)) DEFAULT 0;`);
  else
    console.log("ℹLa colonne 'anonymize' existe déjà.");

  const is2FAEnabledExists = db
  .prepare("PRAGMA table_info(users);")
  .all()
  .some(column => column.name === "is2FAEnabled");

  if (!is2FAEnabledExists)
    db.exec(`ALTER TABLE users ADD COLUMN is2FAEnabled INTEGER NOT NULL CHECK(is2FAEnabled IN (0, 1)) DEFAULT 0;`);
  else
    console.log("ℹLa colonne 'is2FAEnabled' existe déjà.");

  const twoFASecretExists = db
  .prepare("PRAGMA table_info(users);")
  .all()
  .some(column => column.name === "twoFASecret");

  if (!twoFASecretExists)
    db.exec(`ALTER TABLE users ADD COLUMN twoFASecret TEXT;`);
  else
    console.log("ℹLa colonne 'twoFASecret' existe déjà.");

  console.log("✅ Base de données connectée et initialisée.");
  module.exports = db;
} catch (error) {
  console.error("❌ Erreur lors de la connexion à SQLite:", error);
  process.exit(1);
}
