/* eslint-disable no-console */
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

export async function main(): Promise<void> {
  console.log("=== Starting ===");
}

(async () => {
  main().catch((error) => console.error(error));
})();
