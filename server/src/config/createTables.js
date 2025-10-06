import { Client } from "pg";
import { DATABASE_URL } from "./env.js";

const seedTables = `CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
username VARCHAR ( 32 ) UNIQUE NOT NULL,
email TEXT UNIQUE NOT NULL,
hashed_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
user_id INTEGER NOT NULL REFERENCES users(id),
type TEXT NOT NULL CHECK (type IN ('movie', 'tv', 'book')),
title TEXT NOT NULL,
creator TEXT,
genre TEXT,
year INTEGER,
rating INTEGER CHECK (rating BETWEEN 1 AND 10),
notes TEXT,
image_url TEXT
);

INSERT INTO users (username, email, hashed_password) 
VALUES
    ('Jane', 'movielover@gmail.com', 'password1'),
    ('Joe', 'tvlover@gmail.com', 'password2'),
    ('Jerry', 'booklover@gmail.com', 'password3');
`;

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
