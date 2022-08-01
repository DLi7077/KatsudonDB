import _ from "lodash";
import * as dotenv from "dotenv";
import axios from "axios";
dotenv.config();

async function getUsernameById(user_id: string): Promise<any> {
  const url = `https://discord.com/api/users/${user_id}`;
  const request = {
    method: "get",
    url: url,
    headers: {
      Authorization: `Bot ${process.env.TOKEN}`,
    },
  };

  return await axios(request)
    .then((res: any) => _.get(res, "data.username"))
    .catch(console.error);
}

export default {
  getUsernameById,
};
