import { Client } from "pg";
import { DATABASE_URL } from "../config/env.js";

const seedTables = `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
    username VARCHAR ( 32 ) UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT,
    google_id TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    external_id TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv', 'books', 'games')),
    title TEXT,
    summary TEXT,
    release_year INT,
    image_url TEXT,
    UNIQUE (external_id, media_type)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 0 AND rating <= 10),
    favorite BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, media_id)
);

CREATE TABLE password_reset_tokens (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);`;

async function main() {
  const client = new Client({
    connectionString: `${DATABASE_URL}`,
  });
  await client.connect();
  await client.query(seedTables);
  await client.end();
}

main();
