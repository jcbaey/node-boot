/* eslint-disable no-console */
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { createEvent } from "./lib/lambda-utils";
import { handler } from "./handler";

dotenv.config();

export async function main(): Promise<void> {
  console.log("=== Starting ===");
  const event = createEvent("/version");
  const response = await handler(event);
  console.log(response);
}

(async () => {
  main().catch((error) => console.error(error));
})();
