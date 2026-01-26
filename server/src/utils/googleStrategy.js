import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "../database/pool.js";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config/env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase();
        const googleId = profile.id;
        const username = profile.displayName.replace(/\s+/g, "").toLowerCase();

        const { rows } = await pool.query(
          `
          SELECT * FROM users
          WHERE google_id = $1 OR email = $2
          `,
          [googleId, email],
        );

        let user;

        if (rows.length === 0) {
          const result = await pool.query(
            `
            INSERT INTO users (username, email, google_id)
            VALUES ($1, $2, $3)
            RETURNING id, username
            `,
            [username, email, googleId],
          );
          user = result.rows[0];
        } else {
          user = rows[0];

          // link google_id if email user exists
          if (!user.google_id) {
            await pool.query(`UPDATE users SET google_id = $1 WHERE id = $2`, [
              googleId,
              user.id,
            ]);
          }
        }

        done(null, { id: user.id, username: user.username });
      } catch (err) {
        done(err);
      }
    },
  ),
);
