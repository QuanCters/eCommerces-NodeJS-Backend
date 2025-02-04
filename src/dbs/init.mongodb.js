const mongoose = require("mongoose");
const {
  db: { host, name, port },
} = require("../configs/config.mongodb");
const connectString = `mongodb://${host}:${port}/${name}`;
const { countConnect } = require("../helpers/check.connect");
// use singleton pattern
class Database {
  constructor() {
    this.connect();
  }

  // connect
  connect(type = "mongodb") {
    mongoose.set("debug", true);
    mongoose.set("debug", { color: true });

    console.log(connectString);

    mongoose
      .connect(connectString)
      .then(() => console.log(`Connected MongoDB Success`, countConnect()))
      .catch((error) => console.log(`Error Connection: ${error.message}`));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongoDB = Database.getInstance();
module.exports = instanceMongoDB;
