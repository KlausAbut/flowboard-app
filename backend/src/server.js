import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { query } from "./db.js";
import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/board.js";
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser()); // parse les cookies (necessary for httpOnly token)
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// routes d'auth (register / login / logout)
app.use("/auth", authRoutes);

// routes d'API pour modifications (columns/cards)
app.use("/api", boardRoutes);

// simple endpoint santé
// Healthcheck endpoint
app.get("/healthcheck", (req, res) => {
  // Fait par Cl@udiu — endpoint simple pour vérifier que le backend répond
  res.json({ status: "ok", service: "flowboard-backend" });
});

// Récupérer un board complet avec colonnes + cartes
// GET /board/:id — protégé par auth
app.get("/board/:id", authMiddleware, async (req, res) => {
  const boardId = req.params.id;

  try {
    // 1. Récupérer le board
    const boards = await query("SELECT id, name FROM boards WHERE id = $1", [
      boardId,
    ]);

    if (boards.length === 0) {
      return res.status(404).json({ error: "board_not_found" });
    }

    const board = boards[0];

    // 2. Récupérer les colonnes du board
    const columns = await query(
      "SELECT id, title, position FROM columns WHERE board_id = $1 ORDER BY position ASC",
      [boardId]
    );

    // 3. Pour chaque colonne, récupérer ses cartes
    for (const col of columns) {
      const cards = await query(
        "SELECT id, title, description, position FROM cards WHERE column_id = $1 ORDER BY position ASC",
        [col.id]
      );
      col.cards = cards;
    }

    // 4. assembler la réponse finale
    res.json({
      id: board.id,
      name: board.name,
      columns: columns,
    });
  } catch (err) {
    console.error("❌ Error loading board", err);
    res.status(500).json({ error: "server_error" });
  }
});

const httpServer = createServer(app);

// Socket.IO — on authentifie la handshake via cookie 'token' ou token envoyé dans handshake.auth
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

// rendre io accessible aux routes (board.js utilisera req.app.get('io'))
app.set("io", io);

// parser simple de cookies pour handshake
function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((acc, pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return acc;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
}

// Auth sur chaque socket
io.use((socket, next) => {
  try {
    // prioriser token envoyé explicitement dans handshake auth
    const tokenFromAuth = socket.handshake.auth && socket.handshake.auth.token;
    let token = tokenFromAuth;

    if (!token) {
      const cookieHeader =
        socket.handshake.headers && socket.handshake.headers.cookie;
      const cookies = parseCookies(cookieHeader);
      token = cookies && cookies.token;
    }

    if (!token) return next(new Error("unauthorized"));

    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    socket.user = { id: payload.id };
    return next();
  } catch (err) {
    return next(new Error("unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log("🔌 client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`✅ FlowBoard backend running on port ${PORT}`);
});

// Liste des utilisateurs — endpoint protégé
app.get("/users", authMiddleware, async (req, res) => {
  try {
    const rows = await query(
      "SELECT id, email, name FROM users ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "database_failed" });
  }
});
