/* eslint-disable no-console */
import * as dotenv from "dotenv";
dotenv.config();
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { throwIfInvalidHttpVerb, withCors } from "./lib/lambda-utils.js";
import { getErrorMessage } from "./lib/error-utils.js";
import { StatusError } from "./lib/errors.js";
import { StatusCodes } from "./lib/http-status-code.js";

interface JsonResponse {
  message?: string;
  version?: string;
  error?: string;
  event?: APIGatewayProxyEventV2;
}

const internalHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(`${event.requestContext.http.method} ${event.requestContext.http.path} ${event.body}`);
  let bodyJson: JsonResponse;
  try {
    switch (event.requestContext.http.path) {
      case "/":
      case "/version":
        throwIfInvalidHttpVerb(event, ["GET"]);
        bodyJson = {
          version: process.env.npm_package_version || "unknown",
        };
        break;
      default:
        bodyJson = {
          error: `Unknown event.requestContext.http.path=${event.requestContext.http.path}`,
          event,
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(bodyJson),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    return {
      statusCode: error instanceof StatusError ? error.statusCode : StatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: getErrorMessage(error) }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
};

export const handler = withCors(internalHandler);
