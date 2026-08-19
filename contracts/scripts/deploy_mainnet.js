import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying FPLGame with the account:", deployer.address);

  // Use the test token address deployed on Pons
  const fplsAddress = "0xb138C8Ce9095bf24A20cB4DBaf16e9Bb184Df70f";
  console.log("Using FPLS Token at:", fplsAddress);

  // Deploy Mock Functions Router (since we are just testing entry right now)
  const MockRouter = await ethers.getContractFactory("MockFunctionsRouter");
  const mockRouter = await MockRouter.deploy();
  await mockRouter.waitForDeployment();
  const mockRouterAddress = await mockRouter.getAddress();
  console.log("MockFunctionsRouter deployed to:", mockRouterAddress);

  // Deploy FPLGame
  const FPLGame = await ethers.getContractFactory("FPLGame");
  const game = await FPLGame.deploy(fplsAddress, mockRouterAddress);
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("FPLGame deployed to:", gameAddress);

  // Save the addresses to a file for the frontend to use
  const configPath = "../src/contractAddresses.json";
  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
  
  config.fplsAddress = fplsAddress;
  config.gameAddress = gameAddress;
  config.mockRouterAddress = mockRouterAddress;

  fs.writeFileSync(
    configPath,
    JSON.stringify(config, null, 2)
  );
  console.log("Contract addresses updated in src/contractAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
