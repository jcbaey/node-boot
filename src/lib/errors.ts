import { StatusCodes } from "./http-status-code";

const ERROR_MESSAGES = Object.freeze({
  INVALID_EVENT: "The event is not correct (missing fields).",
  INVALID_HTTP_VERB: "The verb is not correct.",
});

export class StatusError extends Error {
  statusCode: number;
  constructor(msg?: string, statusCode?: number) {
    super(msg);
    this.name = this.constructor.name;
    this.statusCode = statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export class InvalidEventError extends StatusError {
  constructor(msg?: string) {
    super(msg || ERROR_MESSAGES.INVALID_EVENT, StatusCodes.BAD_REQUEST);
    this.name = this.constructor.name;
  }
}

export class InvalidHttpVerbError extends StatusError {
  constructor(msg?: string) {
    super(msg || ERROR_MESSAGES.INVALID_HTTP_VERB, StatusCodes.BAD_REQUEST);
    this.name = this.constructor.name;
  }
}
