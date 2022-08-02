import _ from "lodash";

/**
 * @description splits a sentence into an array of words
 * @param {string} sentence - a string containing words
 * @returns {string[]} words in the sentence
 */
function splitSentenceToWords(sentence: string): string[] {
  return sentence.trim().split(/\s+|[,/.]/);
}

/**
 * @description Constructs a word frequency object from a sentence after cleaning it
 * @param {string} sentence some sentence string
 * @returns Word frequency object
 */
function getWordDistribution(sentence: string): any {
  const splitWords = splitSentenceToWords(sentence);
  const word_distribution = _.reduce(
    splitWords,
    (accumulator: any, word: string) => {
      const word_count = _.get(accumulator, word) ?? 0;
      return _.assign(accumulator, { [word]: word_count + 1 });
    },
    {}
  );

  return word_distribution;
}

export default {
  getWordDistribution,
};
