import { Express } from "express";
import db from "./db";

export default async function routes(app: Express) {
  app.use("/api", db);

  const listEndpoints = require("express-list-endpoints"); // npm i express-list-endpoints
  console.log(listEndpoints(app));
}
