import _ from "lodash";
const database = require("../database");

/**
 * @description Adds user to database if not in it
 * @param {string} userId the user id
 * @returns {Promise<any>} Promise of created user
 */
async function addUser(userId: string): Promise<any> {
  return await database.query(`
    INSERT into users (id) 
    values ('${userId}')
    ON CONLFICT DO NOTHING
    ;`);
}

/**
 * @description Adds user to database if not in it
 * @param {any} queryParams query keys like user_id
 * @returns {Promise<any>} users that meet the query
 */
async function findUsers(queryParams: any): Promise<any> {
  const user_id = _.get(queryParams, "user_id");
  const user_id_filter = user_id ? `where id = '${user_id}'` : "";
  const users = await database.query(`select * from users ${user_id_filter}`);

  return users;
}

export default {
  addUser,
  findUsers,
};
