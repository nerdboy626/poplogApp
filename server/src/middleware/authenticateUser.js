import { ACCESS_TOKEN_SECRET } from "../config/env.js";

export function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res
      .status(401)
      .json({ error: "Sorry, you are unauthorized from accessing this page." });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res
        .send(403)
        .json({ error: "Sorry, your access token is not valid." });
    }

    req.user = user;
    next();
  });
}
