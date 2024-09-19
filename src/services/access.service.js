"use strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils/index");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHP",
  WRITER: "WRT",
  EDITOR: "EDIT",
  ADMIN: "ADMIN",
};

class AccessService {
  static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokenUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happened ! Please login");
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Shop not registered");
    }

    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Shop not registered");
    }

    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    await KeyTokenService.updateKeyToken({
      userId,
      refreshToken: tokens.refreshToken,
      refreshTokenUsed: refreshToken,
    });

    return {
      user,
      tokens,
    };
  };

  /*
    Check this token used ???
  */
  static handleRefreshToken = async (refreshToken) => {
    // Check if token has been used before ?
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    // if yes
    if (foundToken) {
      // decode to findout who ?
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      // simple way: delete all token from keystore
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happened ! Please login");
    }

    // if no
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);

    if (!holderToken) {
      throw new AuthFailureError("Shop not registered");
    }

    // verify token
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );

    // check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Shop not registered");
    }

    // create new pair
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    // update token
    await KeyTokenService.updateKeyToken({
      userId,
      refreshToken: tokens.refreshToken,
      refreshTokenUsed: refreshToken,
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };
  /*
    1 - check email in dbs
    2 - match password
    3 - create accessToken and refreshToken, then save
    4 - generate tokens
    5 - get data return login
  */
  static login = async ({ email, password, refreshToken = null }) => {
    // 1. Check if the email exists in the database

    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop not registered");
    }

    // 2. Verify the password
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) {
      throw new AuthFailureError("Authentication error");
    }

    // 3. Generate private and public keys
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });

    // 4. Create token pair
    const { _id: userId } = foundShop._id;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    // 5. Save the refresh token and keys
    await KeyTokenService.createKeyToken({
      userId,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    // 6. Return the shop data and tokens
    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    // step 1: check if the email already exist
    const shopHolder = await shopModel.findOne({ email }).lean(); // lean will return javascript object

    if (shopHolder) {
      throw new ConflictRequestError("Error: Shop already registered!");
    }

    // we need to hash our password to avoid being attack if leaked data
    const passwordHash = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // created privateKey, publicKey
      // privateKey for user to sign token, we don't save it in database
      // publicKey use to verified token
      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "pkcs1", // Public key CryptoGraphy Standard 1
          format: "pem", // format to encoding binary data
        },
        privateKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
      });

      // save public key for user
      const publicKeyString = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
      });

      // if doesn't exist publicKeyString, return error
      if (!publicKeyString) {
        throw new BadRequestError("Error: public key not found");
      }

      // when take public key from database, we need to convert again
      const publickeyObject = crypto.createPublicKey(publicKeyString);

      // else, create a pair token ( accessToken, refreshToken )
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publickeyObject,
        privateKey
      );

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }
    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
