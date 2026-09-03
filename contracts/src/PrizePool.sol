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
    
    mapping(uint256 => bool) public isGameweekClaimed;

    event PrizeClaimed(uint256 indexed gameweek, address indexed winner, uint256 amount, uint256 burnAmount);

    constructor(address _fplsToken, address _oracle) Ownable(msg.sender) {
        fplsToken = IERC20(_fplsToken);
        oracle = _oracle;
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }

    /**
     * @dev Winner calls this with a signature from the backend oracle
     * Message signed by oracle: keccak256(abi.encodePacked(gameweek, winner, totalPrizePool))
     */
    function claimPrize(
        uint256 gameweek,
        uint256 totalPrizePool,
        bytes calldata signature
    ) external {
        require(!isGameweekClaimed[gameweek], "Prize already claimed");

        // Verify oracle signature
        bytes32 messageHash = keccak256(abi.encodePacked(gameweek, msg.sender, totalPrizePool));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        require(ethSignedMessageHash.recover(signature) == oracle, "Invalid signature");

        isGameweekClaimed[gameweek] = true;

        uint256 winnerAmount = (totalPrizePool * 90) / 100;
        uint256 burnAmount = totalPrizePool - winnerAmount;

        require(fplsToken.balanceOf(address(this)) >= totalPrizePool, "Insufficient pool balance");

        // Transfer 90% to winner
        fplsToken.transfer(msg.sender, winnerAmount);
        
        // Burn 10% (transfer to dead address)
        fplsToken.transfer(address(0x000000000000000000000000000000000000dEaD), burnAmount);

        emit PrizeClaimed(gameweek, msg.sender, winnerAmount, burnAmount);
    }
}
