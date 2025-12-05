import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connection = mysql.createPool({
  host: "obvote.com",
  user: "oceanbre_wasil",
  password: "jR4$45&*jkgsFFf90)",
  database: "oceanbre_wp_czhhn",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(connection, { schema, mode: "default" });
