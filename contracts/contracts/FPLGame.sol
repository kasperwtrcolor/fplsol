// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FPLGame is Ownable, ReentrancyGuard {
    IERC20 public fplsToken;
    
    uint256 public entryFee = 10 * 10**18; // Default 10 FPLS
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    struct Gameweek {
        uint256 id;
        bool isActive;
        uint256 totalEntries;
        uint256 prizePoolStocks; // Mocked amount of stocks for prizes
        mapping(address => bool) hasEntered;
        address[] participants;
    }
    
    uint256 public currentGameweekId;
    mapping(uint256 => Gameweek) public gameweeks;
    
    event GameweekStarted(uint256 indexed gameweekId);
    event TeamEntered(uint256 indexed gameweekId, address indexed manager, uint256[] playerIds);
    event PrizesDistributed(uint256 indexed gameweekId, address[] winners, uint256[] amounts);
    event EntryFeeUpdated(uint256 newFee);

    constructor(address _fplsTokenAddress) Ownable(msg.sender) {
        require(_fplsTokenAddress != address(0), "Invalid token address");
        fplsToken = IERC20(_fplsTokenAddress);
    }
    
    function setEntryFee(uint256 _newFee) external onlyOwner {
        entryFee = _newFee;
        emit EntryFeeUpdated(_newFee);
    }

    function startGameweek(uint256 _gameweekId) external onlyOwner {
        require(!gameweeks[_gameweekId].isActive, "Gameweek already active");
        
        // Deactivate current if exists
        if (currentGameweekId != 0 && gameweeks[currentGameweekId].isActive) {
            gameweeks[currentGameweekId].isActive = false;
        }
        
        currentGameweekId = _gameweekId;
        Gameweek storage gw = gameweeks[_gameweekId];
        gw.id = _gameweekId;
        gw.isActive = true;
        
        emit GameweekStarted(_gameweekId);
    }
    
    // In a real production app, playerIds would be verified or stored. 
    // Here we just emit them as an event for an off-chain indexer to pick up.
    function enterGameweek(uint256[] calldata playerIds) external nonReentrant {
        require(playerIds.length == 11, "Must submit exactly 11 players");
        require(currentGameweekId != 0, "No active gameweek");
        
        Gameweek storage gw = gameweeks[currentGameweekId];
        require(gw.isActive, "Current gameweek is not active");
        require(!gw.hasEntered[msg.sender], "Already entered this gameweek");
        
        // Transfer FPLS from user to burn address
        // Note: The FPLS token contract must be approved by the user first!
        require(fplsToken.transferFrom(msg.sender, BURN_ADDRESS, entryFee), "Fee transfer failed");
        
        gw.hasEntered[msg.sender] = true;
        gw.participants.push(msg.sender);
        gw.totalEntries += 1;
        
        emit TeamEntered(currentGameweekId, msg.sender, playerIds);
    }

    // Admin function to record prize distribution 
    // In a real environment with RWAs (Real World Assets), this would interact with a DEX or Treasury
    function distributePrizes(uint256 _gameweekId, address[] calldata winners, uint256[] calldata amounts) external onlyOwner {
        require(winners.length == amounts.length, "Mismatched arrays");
        Gameweek storage gw = gameweeks[_gameweekId];
        require(!gw.isActive, "Gameweek must be inactive/finished to distribute");
        
        emit PrizesDistributed(_gameweekId, winners, amounts);
    }
    
    function getParticipants(uint256 _gameweekId) external view returns (address[] memory) {
        return gameweeks[_gameweekId].participants;
    }
}
