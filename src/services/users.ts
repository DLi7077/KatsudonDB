import _ from "lodash";
const database = require("../database");

/**
 * @description Adds user to database if not in it
 * @param {string} userId the user id
 * @returns
 */
async function addUser(userId: string): Promise<any> {
  return await database.query(`INSERT into users (id) 
    values ('${userId}')
    ON CONLFICT DO NOTHING
    ;`);
}

async function findUsers() {
  return await database.query("select * from users");
}
export default {
  addUser,
  findUsers,
};
