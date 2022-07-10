import * as dotenv from "dotenv";
dotenv.config();

const { Client } = require("pg");
const database = new Client({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: "localhost",
  port: 5432,
  database: process.env.DATABASE,
});

database.connect().then(() => {
  console.log("Connected to 2D-Slaves Database!");
});

database.query("select * from users");

module.exports = database;
