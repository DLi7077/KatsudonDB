import _ from "lodash";
import * as dotenv from "dotenv";
import async, { AsyncResultCallback } from "async";
import axios from "axios";
import timestampHour from "../utils/Timestamp";

const database = require("../database");
dotenv.config();

async function getUserById(user_id: string): Promise<any> {
  const url = `https://discord.com/api/users/${user_id}`;
  const request = {
    method: "get",
    url: url,
    headers: {
      Authorization: `Bot ${process.env.TOKEN}`,
    },
  };

  const response = await axios(request)
    .then((res: any) => res.data)
    .catch(console.error);

  return _.get(response, "username");
}

/**
 * @description Computes the distribution of mentioned users
 * @param {any[]} mentioned_users - The resulting mentioned_users from a SQL query
 * @returns {Promise<any>} a distribution of username mentions
 */
async function getMentionedUserDistribution(
  mentioned_users: any[]
): Promise<any> {
  const mention_distribution = {};
  const usernameMap = new Map();

  const iteree = async (
    mentioned_info: any,
    next: AsyncResultCallback<any>
  ) => {
    const { mentioned } = mentioned_info;
    const existingUsername = usernameMap.get(mentioned);
    //cut down run time if username is already mapped
    if (existingUsername) {
      _.assign(mention_distribution, {
        [existingUsername]:
          (_.get(mention_distribution, existingUsername) || 0) + 1,
      });
      return next(null, {});
    }
    const request = {
      method: "get",
      url: `https://discord.com/api/users/${mentioned}`,
      headers: {
        Authorization: `Bot ${process.env.TOKEN}`,
      },
    };

    await axios(request)
      .then((res) => {
        const fetched_username = _.get(res, "data.username");
        usernameMap.set(mentioned, fetched_username);
        //increment count of current user
        _.assign(mention_distribution, {
          [fetched_username]:
            (_.get(mention_distribution, fetched_username) || 0) + 1,
        });
      })
      .catch(console.error);
    return next(null, {});
  };

  await async.mapSeries(mentioned_users, iteree);

  return mention_distribution;
}

/**
 * @description Computes the distributions of words in all messages
 * @param {any[]} message_response- The resulting messages from a SQL query
 * @returns {any} a distributions of words used
 */
function getWordDistribution(message_response: any[]): any {
  const word_distribution = _.reduce(
    message_response,
    (res: any, msg: string) => {
      //for each message
      const sentence = _.get(msg, "message_content") ?? [];

      const split = _.split(sentence, " ");
      //update word frequency
      const word_freq: any = _.reduce(
        split,
        (result: any, word: string) => {
          _.assign(result, { [word]: (_.get(result, word) || 0) + 1 });
          return result;
        },
        {}
      );
      _.map(word_freq, (count: number, word: string) => {
        _.assign(res, { [word]: (_.get(res, word) || 0) + count });
      });

      return res;
    },
    {}
  );

  return word_distribution;
}

/**
 * @description Computes the distributions of timestamps in all messages
 * @param {any[]} message_response- The resulting messages from a SQL query
 * @returns {any} a distributions of hours the message was sent
 */
function getTimeDistribtuion(message_response: any[]): any {
  const time_distribution = _.reduce(
    message_response,
    (result: any, message: any) => {
      const time_stamp = _.get(message, "date");
      const hour = timestampHour(time_stamp);
      result[hour] += 1;

      return result;
    },
    new Array(24).fill(0)
  );

  return time_distribution;
}

/**
 * @description Computes user statistics using messages
 * @param {any} queryParams - queryParams for user_id filter
 * @returns {Promise<any>} a collection of mentions, time, and word distribution
 */
async function getUserStatistics(queryParams: any): Promise<any> {
  const user_id = _.get(queryParams, "user_id") ?? null;
  const messageBlocks = await database
    .query(
      `Select * from messages ${user_id ? `where user_id ='${user_id}'` : ""}`
    )
    .then((res: any) => res.rows);
  const mentioned_users = await database
    .query(
      `select m.user_id as speaker, u.user_id as mentioned from  messages m right join mentioned_users u on m.id = u.message_id
    ${user_id ? `where m.user_id ='${user_id}'` : ""}`
    )
    .then((res: any) => res.rows);

  const message_count = messageBlocks.length;
  // translate user_id to username using discord api
  const mention_distribution = await getMentionedUserDistribution(
    mentioned_users
  );
  const word_distribution = getWordDistribution(messageBlocks);
  const time_distribution = getTimeDistribtuion(messageBlocks);

  return {
    messages: message_count,
    mention_distribution: mention_distribution,
    time_distribution: time_distribution,
    word_distribution: word_distribution,
  };
}

export default {
  getUserById,
  getUserStatistics,
};
