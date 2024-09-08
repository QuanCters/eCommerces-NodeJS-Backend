// use to save  idUser, publicKey, refreshToken

"use strict";

const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Key";
const COLLECTION_NAME = "Keys";

// Declare the Schema of the Mongo model
var keyTokenSchema = new mongoose.Schema(
  {
    name: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    publicKey: {
      type: String,
      required: true,
    },
    refreshTokenUsed: {
      type: Array,
      default: [], // set of refresh token that already used
    },
    refreshToken: {
      type: String,
      required: true, // refresh token currently use
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, keyTokenSchema);
