import * as dotenv from "dotenv";
dotenv.config();

const { Client } = require("pg");
const database = new Client({
  user: process.env.DEV_USER,
  password: process.env.DEV_PASSWORD,
  host: "localhost",
  port: 5432,
  database: process.env.DEV_DATABASE,
});

// const database = new Client(process.env.COCKROACH_DATABASE_URL);

const build_database_if_needed: string = `
  CREATE TABLE IF NOT EXISTS channels(
    id VARCHAR(20) PRIMARY KEY,
    channel_name VARCHAR(50)
  ); 
  CREATE TABLE IF NOT EXISTS groups(
    id VARCHAR(20) Primary key,
    group_name VARCHAR(50)
  );
  CREATE TABLE IF NOT EXISTS users(
    id VARCHAR(20) PRIMARY KEY
  );
  CREATE TABLE IF NOT EXISTS messages(
    id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) REFERENCES Users(id),
    channel_id VARCHAR(20) REFERENCES Channels(id),
    message_content VARCHAR(2000),
    attachment_size BIGINT,
    attachment_name VARCHAR(255),
    attachment_type VARCHAR(100),
    date DATE NOT NULL
  );
  CREATE TABLE IF NOT EXISTS mentioned_users(
    user_id VARCHAR(20) REFERENCES Users(id),
    message_id VARCHAR(20) REFERENCES Messages(id)
  );
  CREATE TABLE IF NOT EXISTS mentioned_groups(
    message_id VARCHAR(20) REFERENCES Messages(id),
    group_id VARCHAR(20) REFERENCES Groups(id)
  );`;
(async () => {
  await database.connect();
  try {
    const build_tables = await database.query(build_database_if_needed);
    console.log("Connected to 2D-Slaves Database!");
    console.log(build_tables);
  } catch (err) {
    console.error("error building :", err);
  }
})();

module.exports = database;
