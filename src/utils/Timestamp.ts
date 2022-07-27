import _ from "lodash";

/**
 * @description Converts a timestamp string to the hour of day (int EST).
 * Ex: 2022-07-10 17:16:58.002075 -> returns 17
 * @param {string} timestamp in the form of a string
 * @returns {number}the hour the message was sent [0,24]
 */
export default function timestampHour(timestamp: string): number {
  const [weekday, day, month, year, time] = _.split(timestamp, " ");
  const [hour] = _.split(time, ":");
  return parseInt(hour);
}
