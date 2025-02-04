const redis = require("redis");
const { host, port } = require("../configs/config.redis");
const { RedisErrorResponse } = require("../core/error.response");

let client = {};
let statusConnectRedis = {
  CONNECT: "conn",
  END: "end",
  RECONNECT: "reconnecting",
  ERROR: "error",
};
let connectionTimeout;

const REDIS_CONNECT_TIMEOUT = 10000;
const REDIS_CONNECT_MESSAGE = {
  code: -99,
  message: {
    vn: "Redis loi",
    en: "Service connection error",
  },
};

const RedisConfig = {
  socket: {
    host: host,
    port: port,
  },
};

const handleTimeoutError = () => {
  connectionTimeout = setTimeout(() => {
    throw new RedisErrorResponse({
      message: REDIS_CONNECT_MESSAGE.message.vn,
      statusCode: REDIS_CONNECT_MESSAGE.code,
    });
  }, REDIS_CONNECT_TIMEOUT);
};

const handleEventConnection = ({ connectionRedis }) => {
  // check if connect is null
  connectionRedis.on(statusConnectRedis.CONNECT, () => {
    console.log(`connectionRedis - Connection status: connected`);
    clearTimeout(connectionTimeout);
  });

  connectionRedis.on(statusConnectRedis.END, () => {
    console.log(`connectionRedis - Connection status: disconnected`);
    // connect retry
    handleTimeoutError();
  });

  connectionRedis.on(statusConnectRedis.RECONNECT, () => {
    console.log(`connectionRedis - Connection status: reconnecting`);
    clearTimeout(connectionTimeout);
  });

  connectionRedis.on(statusConnectRedis.ERROR, (err) => {
    console.log(`connectionRedis - Connection status: error ${err}`);
    handleTimeoutError();
  });
};

const initRedis = async () => {
  const instanceRedis = redis.createClient(RedisConfig);
  client.instanceConnect = instanceRedis;
  handleEventConnection({ connectionRedis: instanceRedis });
  await instanceRedis.connect();
  console.log("Connected to Redis successfully");
};

const getRedis = () => client;

const closeRedis = () => {};

module.exports = {
  initRedis,
  getRedis,
  closeRedis,
};
