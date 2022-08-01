import _ from "lodash";
import async, { AsyncResultCallback } from "async";
import * as dotenv from "dotenv";
import getTimestampHour from "./Timestamp";
import discordService from "../services/discord";
dotenv.config();

/**
 * @description Produces a mentioned username distribution object
 * @param {any []} mentioned_users a list of mentioned user_ids
 * @returns {Promise<any>} An object mapping each mentioned username to a frequency
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
    const mentioned_user_id = _.get(mentioned_info, "mentioned");
    const existing_username = usernameMap.get(mentioned_user_id);
    //avoid api call if username exists
    if (existing_username) {
      mention_distribution[existing_username] += 1;
    } else {
      const fetched_username = await discordService.getUsernameById(
        mentioned_user_id
      );
      //update map and initialize user count
      usernameMap.set(mentioned_user_id, fetched_username);
      mention_distribution[fetched_username] = 1;
    }
    return next(null, {});
  };

  await async.mapSeries(mentioned_users, iteree);

  return mention_distribution;
}

/**
 * @description Produces a time distribution based on a list of message times
 * @param {any []} time_list a list of timestamps
 * @returns {number []} An array of size 24, where each index represents the messages at the i'th hour
 */
function getTimeDistribution(time_list: any[]): number[] {
  const time_distribution = _.reduce(
    time_list,
    (accumulator: number[], timestamp: any) => {
      const hour = getTimestampHour(timestamp);
      accumulator[hour] += 1;
      return accumulator;
    },
    new Array(24).fill(0)
  );

  return time_distribution;
}

/**
 * @description Produces a word distribution object based on a list of messages
 * @param {string []} message_list a list of messages
 * @returns {any} word distribution object
 */
function getWordDistribution(message_list: string[]): any {
  const word_distribution = _.reduce(
    message_list,
    (accumulator: any, message: string) => {
      const cleaned_message = message.replace(/(\r\n|\n|\r)/gm, " ");
      const words = _.split(cleaned_message, " ");

      _.map(words, (word) => {
        if (!word) return; //handle empty sentences
        _.assign(accumulator, {
          [word]: (_.get(accumulator, word) ?? 0) + 1,
        });
      });

      return accumulator;
    },
    {}
  );

  return word_distribution;
}

export default {
  getMentionedUserDistribution,
  getTimeDistribution,
  getWordDistribution,
};
