"use strict";

const keytokenModel = require("../models/keytoken.model");
const mongoose = require("mongoose");

// create token
class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // public key generate by rsa, it haven't hash yet so we need to convert to string
      // and save to database, if not, it will cause error

      const filter = { name: userId };
      const update = {
        publicKey,
        privateKey,
        refreshTokenUsed: [],
        refreshToken,
      };
      const options = { upsert: true, new: true };
      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      console.error(`Error createKeyToken: ${error}`);
      throw new Error("Failed to create key token");
    }
  };

  static findByUserId = async (userId) => {
    return await keytokenModel.findOne({ name: userId }).lean();
  };

  static removeKeyById = async (id) => {
    return await keytokenModel.findByIdAndDelete(id);
  };
}

module.exports = KeyTokenService;
