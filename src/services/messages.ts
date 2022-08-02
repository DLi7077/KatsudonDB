import _ from "lodash";
const database = require("../database");

/**
 * @description Adds message to database
 * Before adding message, adds user and channel, then adds message
 * Then, adds all mentioned users and groups to their tables
 * Finally, creates a row for each mentioned user linked to the message to the mentions table
 * @param {any} message the message content block
 * @returns {Promise<any>}
 */
async function addMessage(message: any): Promise<any> {
  const message_id = _.get(message, "id");
  const { user_id, channel_id } = message;
  const message_content = _.get(message, "message_content").replace(/'/g, "''");
  const attachment_size = _.get(message, "attachment_size") ?? 0;
  const attachment_name = _.get(message, "attachment_name") ?? null;
  const attachment_type = _.get(message, "attachment_type") ?? null;
  const mentionedUsers = _.get(message, "message_mentions.users");
  const mentionedGroups = _.get(message, "message_mentions.groups");

  const addUser = `INSERT into users (id) VALUES 
    ('${user_id}') ON CONFLICT DO NOTHING;`;
  const addChannel = `INSERT into channels (id) VALUES
    ('${channel_id}') ON CONFLICT DO NOTHING;`;
  const addMessage = `INSERT into messages (
      id, user_id, channel_id, message_content, date,
      attachment_name, attachment_size, attachment_type)
      VALUES (
        '${message_id}','${user_id}','${channel_id}','${message_content}', now(),
        '${attachment_name}','${attachment_size}','${attachment_type}'
      );`;

  // generate users for each mentioned user
  // associate(mention) those users to the current message
  const linkMentionedUsers = _.map(mentionedUsers, (user_id: string) => {
    const addMentionedUser = `INSERT into users (id) VALUES ('${user_id}')
        ON CONFLICT DO NOTHING;`;
    const linkUserToMessage = `INSERT into mentioned_users (user_id, message_id)
        VALUES ('${user_id}', '${message_id}')
        ON CONFLICT DO NOTHING;`;

    return addMentionedUser + linkUserToMessage;
  });

  // generate groups for each mentioned group
  // associate(mention) those groups to the current message
  const linkMentionedGroups = _.map(mentionedGroups, (group_id: string) => {
    const addMentionedGroup = `INSERT into groups (id) VALUES '"${group_id}')
      ON CONFLICT DO NOTHING;`;
    const linkGroupToMessage = `INSERT into mentioned_groups (id, message_id)
      VALUES (
        '${group_id}', '${message_id}'
      ) ON CONFLICT DO NOTHING;`;

    return addMentionedGroup + linkGroupToMessage;
  });

  const mentionedUsersScript = _.join(linkMentionedUsers, "");
  const mentionedGroupsScript = _.join(linkMentionedGroups, "");

  return await database
    .query(
      addUser +
        addChannel +
        addMessage +
        mentionedUsersScript +
        mentionedGroupsScript
    )
    .catch(() => {
      console.log("error adding message");
    })
    .then(async () => {
      await database.query(
        `select * FROM messages WHERE id = ${message_id} limit 1`
      );
    });
}

/**
 * @description Finds all messages
 * @param {any} queryParams params that may contain user_id to filter
 * @returns {Promise<any>}
 */
async function getAllMessages(queryParams: any): Promise<any> {
  const user_id = _.get(queryParams, "user_id");
  const user_id_query = user_id ? `Where user_id = '${user_id}'` : "";

  return await database
    .query(`Select * from messages ${user_id_query};`)
    .then((res: any) => {
      return {
        count: res.rowCount,
        messages: res.rows,
      };
    });
}

export default {
  addMessage,
  getAllMessages,
};
