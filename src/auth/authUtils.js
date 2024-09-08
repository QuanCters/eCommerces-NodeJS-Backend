"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const KeyTokenService = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

// @payload include information transfer between system by token
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "2 days",
    }); // use privateKey to not save in database

    // refreshToken have expiresIn longer than accessToken to reduce unsecurity when accessToken being leaked
    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`Error verify::`, err);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {
    return error;
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  // 1 - check userId missing?
  console.log("Authentication middleware called");
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    console.log("User ID missing");
    throw new AuthFailureError("Invalid Request");
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) {
    console.log("Access token missing");
    throw new AuthFailureError("Invalid request");
  }

  // 3 - verify accessToken
  const keyStore = await KeyTokenService.findByUserId(userId);
  if (!keyStore) {
    console.log("Key store not found");
    throw new NotFoundError("Not found keyStore");
  }

  // 4 - check keyStore with shop
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      console.log("Invalid user ID");
      throw new AuthFailureError("Invalid userId");
    }
    req.keyStore = keyStore;
    next();
  } catch (error) {
    console.log("Error verifying token", error);
    throw error;
  }
});

module.exports = {
  createTokenPair,
  authentication,
};
