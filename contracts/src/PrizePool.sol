// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FPLSPrizePool is Ownable {
    using ECDSA for bytes32;

    IERC20 public immutable fplsToken;
    address public oracle;
    
    // gameweek => rank (1, 2, 3) => claimed
    mapping(uint256 => mapping(uint256 => bool)) public isRankClaimed;
    // gameweek => burn processed
    mapping(uint256 => bool) public isGameweekBurned;

    event PrizeClaimed(uint256 indexed gameweek, uint256 indexed rank, address indexed winner, uint256 amount);
    event DeflationaryBurned(uint256 indexed gameweek, uint256 burnAmount);

    constructor(address _fplsToken, address _oracle) Ownable(msg.sender) {
        fplsToken = IERC20(_fplsToken);
        oracle = _oracle;
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }

    /**
     * @dev Podium winners (1st, 2nd, 3rd) call this with a signature from the backend oracle
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

        // Verify oracle signature
        bytes32 messageHash = keccak256(abi.encodePacked(gameweek, rank, msg.sender, prizeAmount));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        require(ethSignedMessageHash.recover(signature) == oracle, "Invalid signature");

        isRankClaimed[gameweek][rank] = true;

        require(fplsToken.balanceOf(address(this)) >= prizeAmount, "Insufficient pool balance");

        // Transfer prize to winner
        fplsToken.transfer(msg.sender, prizeAmount);

        emit PrizeClaimed(gameweek, rank, msg.sender, prizeAmount);
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
        
        fplsToken.transfer(address(0x000000000000000000000000000000000000dEaD), burnAmount);
        emit DeflationaryBurned(gameweek, burnAmount);
    }
}
