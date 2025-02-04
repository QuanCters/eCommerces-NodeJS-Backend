"use strict";

const { getRedis } = require("../dbs/init.redis");

const { instanceConnect: redisClient } = getRedis();
