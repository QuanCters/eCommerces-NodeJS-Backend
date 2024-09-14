"use strict";

const keytokenModel = require("../models/keytoken.model");

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

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel
      .findOne({ refreshTokenUsed: refreshToken })
      .lean();
  };

  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken });
  };

  static deleteKeyById = async (userId) => {
    return await keytokenModel.deleteOne({ name: userId });
  };

  static updateKeyToken = async ({
    userId,
    refreshToken,
    refreshTokenUsed,
  }) => {
    try {
      const filter = { name: userId };
      const update = {
        $set: { refreshToken },
        $addToSet: { refreshTokenUsed },
      };

      const result = await keytokenModel.updateOne(filter, update);

      if (result.nModified === 0) {
        throw new Error("Failed to update key token");
      }

      return result;
    } catch (error) {
      console.error(`Error updateKeyToken: ${error}`);
      throw new Error("Failed to update key token");
    }
  };
}

module.exports = KeyTokenService;
