
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export type GameFile = {
  path: string;
  content: string;
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: varchar("name", {
    length: 100,
  }).notNull(),

  email: varchar("email", {
    length: 255,
  }).notNull().unique(),

  passwordHash: varchar("password_hash", {
    length: 255,
  }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),

  name: varchar("name", {
    length: 100,
  }).notNull(),

  description: text("description"),

  userId: integer("user_id").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generatedGames = pgTable("generated_games", {
  id: serial("id").primaryKey(),

  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  gameName: varchar("game_name", {
    length: 150,
  }).notNull(),

  prompt: text("prompt").notNull(),

  files: jsonb("files").$type<GameFile[]>().notNull(),

  status: varchar("status", {
    length: 20,
  }).notNull().default("ready"),

  version: integer("version").notNull().default(1),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
