// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PrizePool.sol";
import "../src/MockGME.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract MockFPLS is ERC20 {
    constructor() ERC20("FPL Stock Token", "FPLS") {
        _mint(msg.sender, 100000000 * 10 ** 18);
    }
}

contract PrizePoolTest is Test {
    FPLSPrizePool prizePool;
    MockFPLS fpls;
    MockGME gme;

    uint256 oraclePrivateKey = 0xA11CE;
    address oracleAddress;

    address winner1 = address(0x1111);
    address winner2 = address(0x2222);
    address winner3 = address(0x3333);

    function setUp() public {
        oracleAddress = vm.addr(oraclePrivateKey);

        fpls = new MockFPLS();
        gme = new MockGME();

        prizePool = new FPLSPrizePool(address(fpls), address(gme), oracleAddress);

        // Fund Prize Pool with 1,000,000 FPLS and 1,000 GME stock tokens
        fpls.transfer(address(prizePool), 1000000 * 10 ** 18);
        gme.transfer(address(prizePool), 1000 * 10 ** 18);
    }

    function testDualPodiumClaim() public {
        uint256 gameweek = 4;
        uint256 rank = 1;
        uint256 fplsAmount = 60000 * 10 ** 18;
        uint256 gmeAmount = 15 * 10 ** 17; // 1.5 GME shares

        // Generate Oracle signature for dual payout
        bytes32 messageHash = keccak256(abi.encodePacked(gameweek, rank, winner1, fplsAmount, gmeAmount));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(oraclePrivateKey, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Winner1 claims
        vm.prank(winner1);
        prizePool.claimPrize(gameweek, rank, fplsAmount, gmeAmount, signature);

        // Assert balances
        assertEq(fpls.balanceOf(winner1), fplsAmount);
        assertEq(gme.balanceOf(winner1), gmeAmount);
        assertTrue(prizePool.isRankClaimed(gameweek, rank));
    }

    function testLegacyFplsOnlyClaim() public {
        uint256 gameweek = 3;
        uint256 rank = 2;
        uint256 prizeAmount = 20000 * 10 ** 18;

        // Legacy 4-param hash
        bytes32 messageHash = keccak256(abi.encodePacked(gameweek, rank, winner2, prizeAmount));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(oraclePrivateKey, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(winner2);
        prizePool.claimPrize(gameweek, rank, prizeAmount, signature);

        assertEq(fpls.balanceOf(winner2), prizeAmount);
        assertTrue(prizePool.isRankClaimed(gameweek, rank));
    }

    function testCannotDoubleClaimRank() public {
        uint256 gameweek = 4;
        uint256 rank = 1;
        uint256 fplsAmount = 60000 * 10 ** 18;
        uint256 gmeAmount = 15 * 10 ** 17;

        bytes32 messageHash = keccak256(abi.encodePacked(gameweek, rank, winner1, fplsAmount, gmeAmount));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(oraclePrivateKey, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(winner1);
        prizePool.claimPrize(gameweek, rank, fplsAmount, gmeAmount, signature);

        // Attempt second claim
        vm.prank(winner1);
        vm.expectRevert("Prize already claimed for this rank");
        prizePool.claimPrize(gameweek, rank, fplsAmount, gmeAmount, signature);
    }

    function testInvalidSignatureReverts() public {
        uint256 gameweek = 4;
        uint256 rank = 1;
        uint256 fplsAmount = 60000 * 10 ** 18;
        uint256 gmeAmount = 15 * 10 ** 17;

        // Signed by rogue key
        bytes32 messageHash = keccak256(abi.encodePacked(gameweek, rank, winner1, fplsAmount, gmeAmount));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(0xBAD, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(winner1);
        vm.expectRevert("Invalid signature");
        prizePool.claimPrize(gameweek, rank, fplsAmount, gmeAmount, signature);
    }
}
