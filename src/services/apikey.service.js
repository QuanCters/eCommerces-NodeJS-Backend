"use strict";

const apiKeyModel = require("../models/apikey.model");
const crypto = require("crypto");

const findById = async (key) => {
  const objKey = await apiKeyModel.findOne({ key }).lean();
  return objKey;
};

module.exports = {
  findById,
};
