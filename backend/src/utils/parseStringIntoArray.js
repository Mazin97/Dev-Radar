module.exports = function parseStringIntoArray(string) {
  return string.split(",").map(str => str.trim());
};
