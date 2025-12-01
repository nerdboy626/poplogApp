import { Client } from "pg";
import { DATABASE_URL } from "../config/env.js";

const seedTables = `CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
username VARCHAR ( 32 ) UNIQUE NOT NULL,
email TEXT UNIQUE NOT NULL,
hashed_password TEXT NOT NULL
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
);`;

// INSERT INTO users (username, email, hashed_password)
// VALUES
//     ('Jane', 'movielover@gmail.com', 'password1'),
//     ('Joe', 'tvlover@gmail.com', 'password2'),
//     ('Jerry', 'booklover@gmail.com', 'password3');
// `;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: `${DATABASE_URL}`,
  });
  await client.connect();
  await client.query(seedTables);
  await client.end();
  console.log("done");
}

main();
