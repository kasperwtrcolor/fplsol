import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy FPLS Token
  const FPLS = await ethers.getContractFactory("FPLS");
  const fpls = await FPLS.deploy(deployer.address); // Deployer acts as treasury for local test
  await fpls.waitForDeployment();
  const fplsAddress = await fpls.getAddress();
  console.log("FPLS Token deployed to:", fplsAddress);

  // Deploy FPLGame
  const FPLGame = await ethers.getContractFactory("FPLGame");
  const game = await FPLGame.deploy(fplsAddress);
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("FPLGame deployed to:", gameAddress);

  // Set game contract as excluded from tax
  await fpls.setExcludedFromTax(gameAddress, true);
  console.log("Excluded FPLGame from FPLS transfer tax.");

  // Save the addresses to a file for the frontend to use
  const config = {
    fplsAddress,
    gameAddress,
    treasuryAddress: deployer.address
  };

  fs.writeFileSync(
    "../src/contractAddresses.json",
    JSON.stringify(config, null, 2)
  );
  console.log("Contract addresses saved to src/contractAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
