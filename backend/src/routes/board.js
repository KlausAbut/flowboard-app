// Routes pour opérations CRUD du board (columns / cards)
// Fait par Cl@udiu — endpoints simples pour prototype
import express from "express";
import { query } from "../db.js";

const router = express.Router();

// POST /api/columns -> créer une colonne
router.post("/columns", async (req, res) => {
  const { boardId, title } = req.body || {};
  if (!boardId || !title) return res.status(400).json({ error: "missing" });

  try {
    // position = max(position)+1
    const rowsPos = await query(
      "SELECT COALESCE(MAX(position), -1) as maxpos FROM columns WHERE board_id = $1",
      [boardId]
    );
    const pos =
      rowsPos[0] && rowsPos[0].maxpos >= 0 ? rowsPos[0].maxpos + 1 : 0;
    const rows = await query(
      "INSERT INTO columns (board_id, title, position) VALUES ($1, $2, $3) RETURNING id, title, position",
      [boardId, title, pos]
    );

    // notifier via socket
    const io = req.app.get("io");
    io && io.emit("board:updated", { boardId });

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("create column error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/cards -> créer une carte
router.post("/cards", async (req, res) => {
  const { columnId, title, description } = req.body || {};
  if (!columnId || !title) return res.status(400).json({ error: "missing" });

  try {
    const rowsPos = await query(
      "SELECT COALESCE(MAX(position), -1) as maxpos FROM cards WHERE column_id = $1",
      [columnId]
    );
    const pos =
      rowsPos[0] && rowsPos[0].maxpos >= 0 ? rowsPos[0].maxpos + 1 : 0;
    const rows = await query(
      "INSERT INTO cards (column_id, title, description, position) VALUES ($1, $2, $3, $4) RETURNING id, title, description, position",
      [columnId, title, description || null, pos]
    );

    // notify
    // find board_id for this column
    const col = await query("SELECT board_id FROM columns WHERE id = $1", [
      columnId,
    ]);
    const boardId = col && col[0] && col[0].board_id;
    const io = req.app.get("io");
    io && io.emit("board:updated", { boardId });

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("create card error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

// POST /api/cards/move -> déplacer une carte vers une colonne
router.post("/cards/move", async (req, res) => {
  const { cardId, toColumnId } = req.body || {};
  if (!cardId || !toColumnId) return res.status(400).json({ error: "missing" });

  try {
    // new position = max(position) + 1 in target column
    const rowsPos = await query(
      "SELECT COALESCE(MAX(position), -1) as maxpos FROM cards WHERE column_id = $1",
      [toColumnId]
    );
    const pos =
      rowsPos[0] && rowsPos[0].maxpos >= 0 ? rowsPos[0].maxpos + 1 : 0;
    await query(
      "UPDATE cards SET column_id = $1, position = $2 WHERE id = $3",
      [toColumnId, pos, cardId]
    );

    // find board id
    const col = await query("SELECT board_id FROM columns WHERE id = $1", [
      toColumnId,
    ]);
    const boardId = col && col[0] && col[0].board_id;
    const io = req.app.get("io");
    io && io.emit("board:updated", { boardId });

    return res.json({ ok: true });
  } catch (err) {
    console.error("move card error", err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
