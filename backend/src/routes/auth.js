// Routes d'authentification (register / login / logout)
// Fait par Cl@udiu — flux complet avec cookie HttpOnly
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

const router = express.Router();

// helper pour signer token
function signToken(payload) {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

// POST /auth/register
router.post("/register", async (req, res) => {
  const { email, name, password } = req.body || {};
  if (!email || !name || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    // Vérifier si l'utilisateur existe
    const existing = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "user_exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const rows = await query(
      "INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, name, hash]
    );

    const user = rows[0];

    // signer token et le placer en cookie httpOnly
    const token = signToken({ id: user.id });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ user });
  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "missing" });

  try {
    const rows = await query(
      "SELECT id, email, name, password FROM users WHERE email = $1",
      [email]
    );
    if (rows.length === 0) return res.status(401).json({ error: "invalid" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) return res.status(401).json({ error: "invalid" });

    const token = signToken({ id: user.id });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ne pas renvoyer le mot de passe
    const safe = { id: user.id, email: user.email, name: user.name };
    return res.json({ user: safe });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  return res.json({ ok: true });
});

export default router;
