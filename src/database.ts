const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  password: "Devin12?",
  host: "localhost",
  port: 5432,
  database: "2D-Slaves",
});

client.connect().then(() => {
  console.log("Connected to 2D-Slaves Database!");
});

client.query("select * from Users");

module.exports = Client;
