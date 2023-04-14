import { StatusCodes } from "./http-status-code";

const ERROR_MESSAGES = Object.freeze({
  INVALID_EVENT: "The event is not correct (missing fields).",
  INVALID_HTTP_VERB: "The verb is not correct.",
});

export class InvalidEventError extends Error {
  status: number;
  constructor(msg?: string) {
    super(msg || ERROR_MESSAGES.INVALID_EVENT);
    this.name = this.constructor.name;
    this.status = StatusCodes.BAD_REQUEST;
  }
}

export class InvalidHttpVerbError extends Error {
  status: number;
  constructor(msg?: string) {
    super(msg || ERROR_MESSAGES.INVALID_HTTP_VERB);
    this.name = this.constructor.name;
    this.status = StatusCodes.BAD_REQUEST;
  }
}
