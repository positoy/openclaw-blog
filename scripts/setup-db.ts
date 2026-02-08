import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const schemaPath = path.join(process.cwd(), "schema.sql");

async function setup() {
  if (!process.env.MYSQL_HOST) {
    console.error("MYSQL_HOST is not defined in .env");
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    ssl: {
      rejectUnauthorized: false,
    },
  });

  console.log("Connected to database.");

  const sql = fs.readFileSync(schemaPath, "utf8");
  const statements = sql.split(";").filter((s) => s.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      await connection.query(statement);
      console.log("Executed:", statement.substring(0, 50) + "...");
    }
  }

  console.log("Database setup complete.");
  await connection.end();
}

setup().catch(console.error);
