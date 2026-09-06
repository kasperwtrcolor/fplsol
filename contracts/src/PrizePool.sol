// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FPLSPrizePool
 * @dev Manages podium prize distribution for both $FPLS and tokenized RWA Stock Yield ($GME)
 * Narrative: "Play fantasy football, win real Wall Street equity."
 */
contract FPLSPrizePool is Ownable {
    using ECDSA for bytes32;

    IERC20 public immutable fplsToken;
    IERC20 public gmeToken; // Tokenized GameStop Stock / RWA Yield Token
    address public oracle;
    
    // gameweek => rank (1, 2, 3) => claimed
    mapping(uint256 => mapping(uint256 => bool)) public isRankClaimed;
    // gameweek => burn processed
    mapping(uint256 => bool) public isGameweekBurned;

    event PrizeClaimed(
        uint256 indexed gameweek, 
        uint256 indexed rank, 
        address indexed winner, 
        uint256 fplsAmount, 
        uint256 gmeAmount
    );
    event DeflationaryBurned(uint256 indexed gameweek, uint256 burnAmount);
    event GmeTokenUpdated(address indexed newGmeToken);
    event OracleUpdated(address indexed newOracle);

    constructor(address _fplsToken, address _gmeToken, address _oracle) Ownable(msg.sender) {
        fplsToken = IERC20(_fplsToken);
        if (_gmeToken != address(0)) {
            gmeToken = IERC20(_gmeToken);
        }
        oracle = _oracle;
    }

    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    function setGmeToken(address _gmeToken) external onlyOwner {
        require(_gmeToken != address(0), "Invalid GME token address");
        gmeToken = IERC20(_gmeToken);
        emit GmeTokenUpdated(_gmeToken);
    }

    /**
     * @dev Dual Podium claim: winners call this with a signature from the backend oracle
     * Message signed by oracle: keccak256(abi.encodePacked(gameweek, rank, winner, fplsAmount, gmeAmount))
     */
    function claimPrize(
        uint256 gameweek,
        uint256 rank,
        uint256 fplsAmount,
        uint256 gmeAmount,
        bytes calldata signature
    ) external {
        require(!isRankClaimed[gameweek][rank], "Prize already claimed for this rank");
        require(fplsAmount > 0 || gmeAmount > 0, "No prize amount specified");

        // Verify oracle signature
        bytes32 messageHash = keccak256(abi.encodePacked(gameweek, rank, msg.sender, fplsAmount, gmeAmount));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        require(ethSignedMessageHash.recover(signature) == oracle, "Invalid signature");

        isRankClaimed[gameweek][rank] = true;

        // 1. Transfer $FPLS prize
        if (fplsAmount > 0) {
            require(fplsToken.balanceOf(address(this)) >= fplsAmount, "Insufficient FPLS pool balance");
            require(fplsToken.transfer(msg.sender, fplsAmount), "FPLS transfer failed");
        }

        // 2. Transfer $GME RWA Stock Yield
        if (gmeAmount > 0) {
            require(address(gmeToken) != address(0), "GME token not configured");
            require(gmeToken.balanceOf(address(this)) >= gmeAmount, "Insufficient GME stock yield balance");
            require(gmeToken.transfer(msg.sender, gmeAmount), "GME transfer failed");
        }

        emit PrizeClaimed(gameweek, rank, msg.sender, fplsAmount, gmeAmount);
    }

    /**
     * @dev Backward compatible claim for single $FPLS prize
     * Message signed by oracle: keccak256(abi.encodePacked(gameweek, rank, winner, prizeAmount))
     */
    function claimPrize(
        uint256 gameweek,
        uint256 rank,
        uint256 prizeAmount,
        bytes calldata signature
    ) external {
        require(!isRankClaimed[gameweek][rank], "Prize already claimed for this rank");
        require(prizeAmount > 0, "Invalid prize amount");

        // Verify legacy oracle signature
        bytes32 messageHash = keccak256(abi.encodePacked(gameweek, rank, msg.sender, prizeAmount));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        require(ethSignedMessageHash.recover(signature) == oracle, "Invalid signature");

        isRankClaimed[gameweek][rank] = true;

        require(fplsToken.balanceOf(address(this)) >= prizeAmount, "Insufficient FPLS pool balance");
        require(fplsToken.transfer(msg.sender, prizeAmount), "FPLS transfer failed");

        emit PrizeClaimed(gameweek, rank, msg.sender, prizeAmount, 0);
    }

    /**
     * @dev Process the 10% gameweek burn to 0x...dEaD
     */
    function processGameweekBurn(
        uint256 gameweek,
        uint256 burnAmount,
        bytes calldata signature
    ) external {
        require(!isGameweekBurned[gameweek], "Burn already processed");
        require(burnAmount > 0, "Invalid burn amount");

        bytes32 messageHash = keccak256(abi.encodePacked(gameweek, uint256(0), address(0x000000000000000000000000000000000000dEaD), burnAmount));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        require(ethSignedMessageHash.recover(signature) == oracle, "Invalid signature");

        isGameweekBurned[gameweek] = true;
        require(fplsToken.balanceOf(address(this)) >= burnAmount, "Insufficient pool balance");
        
        require(fplsToken.transfer(address(0x000000000000000000000000000000000000dEaD), burnAmount), "Burn transfer failed");
        emit DeflationaryBurned(gameweek, burnAmount);
    }
}
