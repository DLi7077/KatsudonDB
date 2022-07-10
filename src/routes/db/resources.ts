import { Request, Response } from "express";
import userService from "../../services/users";
import messageService from "../../services/messages";

const database = require("../../database");

import _ from "lodash";
/**
 * @description adds a user
 * @param {Request} req HTTP request object
 * @param {Response} res HTTP response object
 * @param {NextFunction} next Callback to the next route function
 * @returns {Promise<void>} Returns next function to execute
 */
export async function addUser(req: Request, res: Response): Promise<void> {
  await userService.addUser(req.body.user_id).then((user) => {
    console.log(user);
    res.json({ user_ids: req.body.user_id });
  });
}

/**
 * @description adds a user
 * @param {Request} req HTTP request object
 * @param {Response} res HTTP response object
 * @returns {Promise<void>} Returns next function to execute
 */
export async function findUsers(req: Request, res: Response) {
  await database.query("select * from users").then((users) => {
    res.json({ user_ids: users.rows });
  });
}

/**
 * @description adds a user
 * @param {Request} req HTTP request object
 * @param {Response} res HTTP response object
 * @returns {Promise<void>} Returns next function to execute
 */
export async function addMessage(req: Request, res: Response): Promise<void> {
  messageService
    .addMessage(req.body)
    .then((message) => {
      console.log(message);
      res.json({
        status: 200,
        note: "message added!",
        message: message.rows,
      });
    })
    .catch((err) => res.json({ error: err }));
}
