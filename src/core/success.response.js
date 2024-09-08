"use strict";

const StatusCode = require("../utils/StatusCode");
const ReasonPhrases = require("../utils/ReasonPhrases");

class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.OK,
    reasonPhrases = ReasonPhrases.OK,
    metadata = {},
  }) {
    this.message = !message ? reasonPhrases : message;
    this.status = statusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.CREATED,
    reasonPhrases = ReasonPhrases.CREATED,
    metadata,
  }) {
    super({ message, statusCode, reasonPhrases, metadata });
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse,
};
