import { Express } from "express";
import db from "./db";

export default async function routes(app: Express) {
  app.use("/api", db);

  // show all endpoints
  // npm i express-list-endpoints
  const listEndpoints = require("express-list-endpoints");
  console.table(listEndpoints(app));
}
