import _ from "lodash";
import distribution from "../utils/Distribution";

const database = require("../database");
import discordService from "./discord";

/**
 * @description Computes user statistics using messages
 * @param {any} queryParams - queryParams for user_id filter
 * @returns {Promise<any>} a collection of mentions, time, and word distribution
 */
async function getUserStatistics(queryParams: any): Promise<any> {
  const user_id = _.get(queryParams, "user_id");
  const current_username = user_id
    ? await discordService.getUsernameById(user_id)
    : "";
  const user_id_query = user_id ? `Where user_id = '${user_id}'` : "";
  const messageBlocks = await database
    .query(`Select * from messages ${user_id_query}`)
    .then((res: any) => res.rows);
  const mentioned_users = await database
    .query(
      `select m.user_id as speaker, u.user_id as mentioned from  messages m right join mentioned_users u on m.id = u.message_id
    ${user_id ? `where m.user_id ='${user_id}'` : ""}`
    )
    .then((res: any) => res.rows);

  const message_count = messageBlocks.length;
  const messages = _.map(messageBlocks, (msg) => {
    return _.get(msg, "message_content");
  });
  const timestamps = _.map(messageBlocks, (msg) => {
    return _.get(msg, "date");
  });

  //translate user_id to username using discord api
  const mention_distribution = await distribution.getMentionedUserDistribution(
    mentioned_users
  );
  const time_distribution = distribution.getTimeDistribution(timestamps);
  const word_distribution = distribution.getWordDistribution(messages);

  return {
    username: current_username ?? "",
    count: message_count,
    mention_distribution: mention_distribution,
    time_distribution: time_distribution,
    word_distribution: word_distribution,
  };
}

export default {
  getUserStatistics,
};
