const dotenv = require('dotenv');

const envFile = dotenv.config();
const parsedEnv = { ...envFile.parsed };

module.exports = {
  ...parsedEnv,
  PORT: parsedEnv.PORT ?? 3000,
};
