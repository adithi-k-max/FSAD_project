import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";

// Create SQLite database file inside data folder
const sqlite = new Database("./data/db.sqlite");

// Initialize drizzle with SQLite
export const db = drizzle(sqlite, { schema });