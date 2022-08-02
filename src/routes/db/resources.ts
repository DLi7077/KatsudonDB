import { Request, Response } from "express";
import userService from "../../services/users";
import messageService from "../../services/messages";
import statService from "../../services/statistics";
import discordService from "../../services/discord";

const database = require("../../database");

import _ from "lodash";
/**
 * @description Adds a user
 * @param {Request} req HTTP request object
 * @param {Response} res HTTP response object
 * @returns {Promise<any>} Returns a response
 */
export async function addUser(req: Request, res: Response): Promise<void> {
  await userService.addUser(req.body.user_id).then((user: any) => {
    res.json({ user_ids: req.body.user_id });
  });
}

/**
 * @description finds all Users
 * @param {Request} req HTTP request object
 * @param {Response} res HTTP response object
 * @returns {Promise<any>} Returns a response
 */
export async function findUsers(req: Request, res: Response): Promise<any> {
  await userService.findUsers(req.query).then((users: any) => {
    res.json({
      status: 200,
      count: users.rowCount,
      user_ids: users.rows,
    });
  });
}

/**
 * @description Adds a message
 * @param {Request} req HTTP request object
 * @param {Response} res HTTP response object
 * @returns {Promise<any>} Returns a response
 */
export async function addMessage(req: Request, res: Response): Promise<void> {
  messageService
    .addMessage(req.body)
    .then((message) => {
      res.json({
        status: 200,
        count: message.rows.length,
        note: "message added!",
        message: message.rows,
      });
    })
    .catch((err) => res.json({ error: err }));
}

/**
 * @description Gets all messages
 * @param {Request} req HTTP request object
 * @param {Response} res HTTP response object
 * @returns {Promise<any>} Returns a response
 */
export async function findMessages(req: Request, res: Response): Promise<any> {
  messageService.getAllMessages(req.query).then((messages: any) => {
    res.json({
      status: 200,
      note: "successful query!",
      ...messages,
    });
  });
}

export async function getUserStatistics(
  req: Request,
  res: Response
): Promise<any> {
  statService.userStats(req.query).then(async (result: any) => {
    res.json({
      status: 200,
      ...result,
    });
  });
}
