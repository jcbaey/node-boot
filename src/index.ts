export async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("=== Starting ===");
}

(async () => {
  // eslint-disable-next-line no-console
  main().catch((error) => console.error(error));
})();
