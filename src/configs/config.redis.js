"use strict";

const dev = {
  host: "localhost",
  port: process.env.DEV_REDIS_PORT || 6379,
};

const pro = {
  host: "localhost",
  port: process.env.PRO_REDIS_PORT || 6379,
};

const config = { dev, pro };
const env = process.env.NODE_ENV || "dev";
module.exports = config[env];
