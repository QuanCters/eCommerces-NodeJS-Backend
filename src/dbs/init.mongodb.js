const mongoose = require("mongoose");
const {
  db: { host, name, port },
} = require("../configs/config.mongodb");
const connectString = `mongodb://${host}:${port}/${name}`;
const { countConnect } = require("../helpers/check.connect");
console.log(connectString);
// use singleton pattern
class Database {
  constructor() {
    this.connect();
  }

  // connect
  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(connectString)
      .then((_) => console.log(`Connected MongoDB Success`, countConnect()))
      .catch((error) => console.log(`Error Connection: ${error}`));
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
