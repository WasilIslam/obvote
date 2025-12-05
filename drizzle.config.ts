import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: "obvote.com",
    user: "oceanbre_wasil",
    password: "jR4$45&*jkgsFFf90)",
    database: "oceanbre_wp_czhhn",
    port: 3306,
  },
});
