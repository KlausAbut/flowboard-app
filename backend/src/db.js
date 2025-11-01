import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "flowuser",
  password: process.env.DB_PASS || "flowpass",
  database: process.env.DB_NAME || "flowboard",
});

export async function query(sql, params) {
  const result = await pool.query(sql, params);
  return result.rows;
}
