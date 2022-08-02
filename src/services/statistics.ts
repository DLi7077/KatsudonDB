import _ from "lodash";
import distribution from "../utils/Distribution";
import userService from "./users";
import messageService from "./messages";
import tools from "../utils/tools";

/**
 * @description updates a word distribution set
 * @param {any} intialDistribution - intial word distribution
 * @param {any} wordDistribution - the additional words distribution
 * @returns The updated word distribution
 */
function updatedWordDistribution(
  intialDistribution: any,
  wordDistribution: any
): any {
  const updatedDistribution = _.reduce(
    wordDistribution,
    (word_freq: any, freq: number, word: string) => {
      const currentWordFrequency = _.get(word_freq, word) ?? 0;
      _.assign(word_freq, { [word]: currentWordFrequency + freq });

      return word_freq;
    },
    intialDistribution
  );

  return updatedDistribution;
}

/**
 * @description Computes user statistics using messages
 * @param {any} queryParams - queryParams for user_id filter
 * @returns {Promise<any>} a collection of mentions, time, and word distribution
 */
async function userStats(queryParams: any): Promise<any> {
  const user_id = _.get(queryParams, "user_id");
  //construct user data object
  const user_data: any = await userService
    .findUsers(user_id ? { user_id: user_id } : {})
    .then((res: any) => {
      return _.reduce(
        res.rows,
        (accumulator: any, user: any) => {
          const user_id = _.get(user, "id");
          //the intial state of user data object
          return _.assign(accumulator, {
            [user_id]: {
              count: 0,
              word_distribution: {},
              time_distribution: new Array(24).fill(0),
              attachments: {
                none: 0,
                attachment_sizes: [],
              },
            },
          });
        },
        {}
      );
    })
    .catch(() => console.log("error getting user(s)"));

  const { count, messages } = await messageService
    .getAllMessages(user_id ? { user_id: user_id } : {})
    .catch(() => {
      console.error("error retreiving messages");
    });

  const user_data_object = _.reduce(
    messages,
    (accumulator: any, message: any) => {
      const { user_id, message_content, attachment_size, date } = message;
      const sentenceWords: any =
        distribution.getWordDistribution(message_content);
      const message_hour: number = tools.getTimestampHour(date);
      const attachment_size_int = parseInt(attachment_size);
      const currentUserData = accumulator[user_id];
      //update count
      currentUserData.count += 1;

      //update word distribution
      currentUserData.word_distribution = updatedWordDistribution(
        currentUserData.word_distribution,
        sentenceWords
      );

      //update time distribution
      currentUserData.time_distribution[message_hour] += 1;

      //update attachment_size distribution
      if (attachment_size_int) {
        currentUserData.attachments.attachment_sizes.push(attachment_size_int);
      } else {
        currentUserData.attachments.none += 1;
      }

      return accumulator;
    },
    user_data
  );
  

  return { message_count: count, users: user_data_object };
}

export default {
  userStats,
};
