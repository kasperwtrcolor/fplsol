import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("FPLGame and FPLS Integration", function () {
  let fplsToken;
  let fplGame;
  let owner;
  let treasury;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, treasury, user1, user2] = await ethers.getSigners();

    // Deploy FPLS Token
    const FPLS = await ethers.getContractFactory("FPLS");
    fplsToken = await FPLS.deploy(treasury.address);
    await fplsToken.waitForDeployment();

    // Deploy Game Contract
    const FPLGame = await ethers.getContractFactory("FPLGame");
    fplGame = await FPLGame.deploy(await fplsToken.getAddress());
    await fplGame.waitForDeployment();

    // Fund users with tokens and whitelist the game contract from tax for simplified testing
    await fplsToken.setExcludedFromTax(await fplGame.getAddress(), true);
    
    // Transfer 100 FPLS to users (owner is excluded from tax, so full 100 arrives)
    const amountToFund = ethers.parseUnits("100", 18);
    await fplsToken.transfer(user1.address, amountToFund);
    await fplsToken.transfer(user2.address, amountToFund);
  });

  it("Should deduct 3% tax on normal transfers between users", async function () {
    const transferAmount = ethers.parseUnits("10", 18);
    const taxAmount = ethers.parseUnits("0.3", 18);
    const finalAmount = ethers.parseUnits("9.7", 18);

    const initialTreasuryBalance = await fplsToken.balanceOf(treasury.address);

    await fplsToken.connect(user1).transfer(user2.address, transferAmount);

    expect(await fplsToken.balanceOf(user2.address)).to.equal(ethers.parseUnits("109.7", 18));
    expect(await fplsToken.balanceOf(treasury.address)).to.equal(initialTreasuryBalance + taxAmount);
  });

  it("Should allow a user to enter a gameweek and burn entry fee", async function () {
    // Start Gameweek 1
    await fplGame.startGameweek(1);
    
    const entryFee = await fplGame.entryFee();

    // User1 approves Game contract to spend entryFee
    await fplsToken.connect(user1).approve(await fplGame.getAddress(), entryFee);
    
    // Player IDs array (11 players)
    const playerIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    const burnAddress = "0x000000000000000000000000000000000000dEaD";
    const initialBurnBalance = await fplsToken.balanceOf(burnAddress);

    // User1 enters gameweek
    await expect(fplGame.connect(user1).enterGameweek(playerIds))
      .to.emit(fplGame, "TeamEntered")
      .withArgs(1, user1.address, playerIds);

    // Verify fee was sent to burn address
    expect(await fplsToken.balanceOf(burnAddress)).to.equal(initialBurnBalance + entryFee);
    
    // Verify user is in participants
    const participants = await fplGame.getParticipants(1);
    expect(participants[0]).to.equal(user1.address);
  });
});
