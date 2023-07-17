const path = require('path');

module.exports = function resolveRoot(...segments) {
  return path.resolve(__dirname, '..', '..', ...segments);
};
