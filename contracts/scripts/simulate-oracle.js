import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { simulateScript, decodeResult } from "@chainlink/functions-toolkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const source = fs.readFileSync(path.resolve(__dirname, "fpl-oracle.js"), "utf8");

  // A random manager ID and an old gameweek for testing.
  // E.g., manager 123456, gameweek 30
  const args = ["123456", "30"];

  console.log("Simulating Oracle script locally...");
  console.log("Args:", args);

  const { responseBytesHexstring, errorString, capturedTerminalStdout } = await simulateScript({
    source: source,
    args: args,
    bytesArgs: [],
    secrets: {},
  });

  console.log("\n--- Simulation Output ---");
  console.log(capturedTerminalStdout);

  if (errorString) {
    console.error("Simulation failed with error:", errorString);
  }

  if (responseBytesHexstring) {
    console.log(`\nResponse Bytes (Hex): ${responseBytesHexstring}`);
    // Functions.encodeUint256 returns a hex string representing a uint256
    const decodedPoints = decodeResult(responseBytesHexstring, "uint256");
    console.log(`Decoded Points (uint256): ${decodedPoints}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
