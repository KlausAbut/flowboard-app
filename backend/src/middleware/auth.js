// middleware d'authentification JWT
// Fait par Cl@udiu — authentifie via cookie httpOnly 'token' ou header Authorization
import jwt from "jsonwebtoken";
import { query } from "../db.js";

export async function authMiddleware(req, res, next) {
  try {
    // on accepte le token soit dans le cookie 'token' (httpOnly) soit en header Authorization
    const cookieToken = req.cookies && req.cookies.token;
    const header = req.headers.authorization || "";
    const headerToken = header.startsWith("Bearer ")
      ? header.split(" ")[1]
      : null;
    const token = cookieToken || headerToken;

    if (!token) return res.status(401).json({ error: "unauthenticated" });

    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");

    // récupérer l'utilisateur depuis la BDD (sans le mot de passe)
    const rows = await query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [payload.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: "user_not_found" });
    }

    // attacher user à la requête
    req.user = rows[0];
    return next();
  } catch (err) {
    console.error("auth middleware error", err);
    return res.status(401).json({ error: "invalid_token" });
  }
}

export default authMiddleware;
