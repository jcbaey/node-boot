import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import qs from "qs";

import { InvalidEventError, InvalidHttpVerbError } from "./errors.js";

interface HandlerFunction {
  (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2>;
}

const ALLOWED_ORIGINS = ["https://chatgpt.*.vercel.app", "http://localhost:[0-9]*"];

const getHeader = (event: APIGatewayProxyEventV2, name: string): string | undefined => {
  if (!event) {
    return undefined;
  }

  const { headers } = event;
  if (!headers) {
    return undefined;
  }

  const key = Object.keys(headers).filter((k) => k.toLocaleLowerCase() === name.toLocaleLowerCase())[0];

  if (!headers[key]) {
    return undefined;
  }

  if (Array.isArray(headers[key])) {
    return (headers[key] as unknown as string[]).join(" ");
  }

  return headers[key] as string;
};

const getCorsHeader = (event: APIGatewayProxyEventV2): { [header: string]: string | boolean } => {
  // Inspired from https://github.com/expressjs/cors/blob/master/lib/index.js
  const origin = getHeader(event, "origin");
  let valid = false;

  if (origin) {
    ALLOWED_ORIGINS.forEach((allowedOrigin) => {
      if (!valid && origin.match(allowedOrigin)) {
        valid = true;
      }
    });
  }

  const allowedOrigin = valid && origin ? origin : ALLOWED_ORIGINS[0];
  const headers: { [header: string]: string | boolean } = {
    "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": true,
  };

  const controlRequest = getHeader(event, "access-control-request-headers");
  if (controlRequest) {
    headers["Access-Control-Allow-Headers"] = controlRequest;
  } else {
    headers["Vary"] = "Access-Control-Allow-Headers";
    headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
  }

  return headers;
};

export function getContentType(event: APIGatewayProxyEventV2) {
  const contentType = getHeader(event, "Content-Type");
  return contentType ? contentType.toLowerCase().trim() : undefined;
}

export function getJsonBody(event: APIGatewayProxyEventV2): unknown {
  let { body } = event;

  if (!body) {
    return undefined;
  }

  const { isBase64Encoded } = event;
  if (isBase64Encoded) {
    body = Buffer.from(body, "base64").toString("utf-8");
  }
  const contentType = getContentType(event);
  switch (contentType) {
    case "application/json":
      return JSON.parse(body);
    case "application/x-www-form-urlencoded":
      return qs.parse(body);
    default:
      return body;
  }
}

export function createEvent(path: string, httpMethod = "GET"): APIGatewayProxyEventV2 {
  const event: APIGatewayProxyEventV2 = {
    version: "2.0",
    routeKey: "$default",
    rawPath: path,
    rawQueryString: "",
    body: undefined,
    headers: {},
    isBase64Encoded: false,
    requestContext: {
      accountId: "local",
      apiId: "local",
      domainName: "local",
      domainPrefix: "local",
      http: {
        method: httpMethod,
        path,
        protocol: "HTTP/1.1",
        sourceIp: "193.194.132.21",
        userAgent: "vscode-restclient",
      },
      stage: "dev",
      requestId: "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
      routeKey: "$default",
      time: "09/Apr/2015:12:34:56 +0000",
      timeEpoch: 1428582896000,
    },
  };
  return event;
}

export function throwIfInvalidHttpVerb(
  event: undefined | APIGatewayProxyEventV2,
  verbs: undefined | string | string[]
): void {
  if (!event) {
    throw new InvalidEventError();
  }

  const method = event.requestContext.http.method;

  if (!method) {
    throw new InvalidEventError(`Missing httpMethod property`);
  }

  if (Array.isArray(verbs)) {
    if (!verbs.some((verb) => verb === method)) {
      throw new InvalidHttpVerbError(`Expected one of [${verbs}] verb, received ${method}`);
    }
  } else {
    if (method !== verbs) {
      throw new InvalidHttpVerbError(`Expected ${verbs} verb, received ${method}`);
    }
  }
}

export function withCors(handler: HandlerFunction) {
  return async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    if (event.requestContext.http.method === "OPTIONS") {
      return {
        statusCode: 200,
        body: "OK",
        headers: {
          ...getCorsHeader(event),
        },
      };
    }

    return handler(event).then((response) => ({
      ...response,
      headers: {
        ...response.headers,
        ...getCorsHeader(event),
      },
    }));
  };
}

export function getIp(event: APIGatewayProxyEventV2): string {
  const rawIp = getHeader(event, "x-forwarded-for") || event.requestContext.http.sourceIp;
  return rawIp.split(",")[0].trim();
}
