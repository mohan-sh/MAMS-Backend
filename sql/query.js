import fs from "fs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

console.log("DB_NAME from env:", process.env.DB_NAME);

const runSQLFile = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
  });

  // ✅ Check if DB is connected
  const [rows] = await connection.query("SELECT DATABASE();");
  console.log("Connected to DB:", rows[0]);

  // ✅ Execute your schema.sql
  const sql = fs.readFileSync("./seed.sql", "utf8");
  await connection.query(sql);
  console.log("SQL file executed successfully ✅");

  await connection.end();
};

runSQLFile().catch(err => console.error(err));


