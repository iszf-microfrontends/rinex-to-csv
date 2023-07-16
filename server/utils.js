const path = require('path');

function resolveRoot(...segments) {
  return path.resolve(__dirname, '..', ...segments);
}

module.exports = {
  resolveRoot,
};
