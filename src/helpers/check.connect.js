"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECOND = 5000;

// count connect
const countConnect = () => {
  const numConnection = mongoose.connect.length;
  return numConnection;
};

// check overload
const checkOverload = () => {
  setInterval(() => {
    const numConnection = countConnect();
    const numCores = os.cpus().length;
    const memoryUse = process.memoryUsage().rss;

    // Example maximum number of connections based on number of cores
    const maxConnections = numCores * 5;

    console.log(`Activate connection:: ${numConnection}`);
    console.log(`Memory usage:: ${memoryUse / 1024 / 1024}MB`);

    if (numConnection > maxConnections) {
      console.log(`Connection overload detected`);
      // notify.send(....)
    }
  }, _SECOND); // monitor every 5 seconds
};

module.exports = { countConnect, checkOverload };
