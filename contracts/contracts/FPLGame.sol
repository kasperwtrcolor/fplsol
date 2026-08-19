// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract FPLGame is Ownable, ReentrancyGuard, FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    IERC20 public fplsToken;
    
    uint256 public entryFee = 100000 * 10**18; // Default 100,000 FPLS
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Chainlink Functions specific variables
    bytes32 public donId;
    string public oracleSource;
    uint64 public subscriptionId;
    uint32 public gasLimit = 300000;
    
    struct Gameweek {
        uint256 id;
        bool isActive;
        uint256 totalEntries;
        uint256 prizePoolStocks;
        mapping(address => bool) hasEntered;
        address[] participants;
        mapping(address => uint256) managerScores; // Stores scores retrieved from Oracle
    }
    
    uint256 public currentGameweekId;
    mapping(uint256 => Gameweek) public gameweeks;
    
    // To map Chainlink request IDs back to users
    mapping(bytes32 => address) public requestToManager;
    mapping(bytes32 => uint256) public requestToGameweek;
    
    event GameweekStarted(uint256 indexed gameweekId);
    event TeamEntered(uint256 indexed gameweekId, address indexed manager, uint256[] playerIds);
    event PrizesDistributed(uint256 indexed gameweekId, address[] winners, uint256[] amounts);
    event EntryFeeUpdated(uint256 newFee);
    
    event ScoreRequested(bytes32 indexed requestId, address indexed manager, uint256 gameweekId);
    event ScoreReceived(bytes32 indexed requestId, address indexed manager, uint256 gameweekId, uint256 score);
    event ScoreRequestFailed(bytes32 indexed requestId, bytes err);

    constructor(
        address _fplsTokenAddress, 
        address _functionsRouter
    ) Ownable(msg.sender) FunctionsClient(_functionsRouter) {
        require(_fplsTokenAddress != address(0), "Invalid token address");
        fplsToken = IERC20(_fplsTokenAddress);
    }
    
    function setChainlinkConfig(bytes32 _donId, uint64 _subscriptionId, string calldata _source, uint32 _gasLimit) external onlyOwner {
        donId = _donId;
        subscriptionId = _subscriptionId;
        oracleSource = _source;
        gasLimit = _gasLimit;
    }

    function setEntryFee(uint256 _newFee) external onlyOwner {
        entryFee = _newFee;
        emit EntryFeeUpdated(_newFee);
    }

    function startGameweek(uint256 _gameweekId) external onlyOwner {
        require(!gameweeks[_gameweekId].isActive, "Gameweek already active");
        
        if (currentGameweekId != 0 && gameweeks[currentGameweekId].isActive) {
            gameweeks[currentGameweekId].isActive = false;
        }
        
        currentGameweekId = _gameweekId;
        Gameweek storage gw = gameweeks[_gameweekId];
        gw.id = _gameweekId;
        gw.isActive = true;
        
        emit GameweekStarted(_gameweekId);
    }
    
    function enterGameweek(uint256[] calldata playerIds) external nonReentrant {
        require(playerIds.length == 11, "Must submit exactly 11 players");
        require(currentGameweekId != 0, "No active gameweek");
        
        Gameweek storage gw = gameweeks[currentGameweekId];
        require(gw.isActive, "Current gameweek is not active");
        require(!gw.hasEntered[msg.sender], "Already entered this gameweek");
        
        require(fplsToken.transferFrom(msg.sender, BURN_ADDRESS, entryFee), "Fee transfer failed");
        
        gw.hasEntered[msg.sender] = true;
        gw.participants.push(msg.sender);
        gw.totalEntries += 1;
        
        emit TeamEntered(currentGameweekId, msg.sender, playerIds);
    }

    // Requests the Chainlink DON to fetch the manager's points for a gameweek
    function requestTeamScore(string[] calldata args) external returns (bytes32 requestId) {
        require(bytes(oracleSource).length > 0, "Oracle source not set");
        require(args.length == 2, "Requires 2 args: managerId, gameweekId");
        
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(oracleSource);
        if (args.length > 0) req.setArgs(args);
        
        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );
        
        requestToManager[requestId] = msg.sender;
        
        // args[1] is gameweek string, we can parse it off-chain or pass it properly
        // For simplicity, we just use currentGameweekId
        requestToGameweek[requestId] = currentGameweekId;
        
        emit ScoreRequested(requestId, msg.sender, currentGameweekId);
    }

    // Callback that Chainlink DON calls to fulfill the request
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        address manager = requestToManager[requestId];
        uint256 gameweekId = requestToGameweek[requestId];
        
        if (err.length > 0) {
            emit ScoreRequestFailed(requestId, err);
            return;
        }

        // Response is encoded as a uint256 buffer
        uint256 score = abi.decode(response, (uint256));
        
        Gameweek storage gw = gameweeks[gameweekId];
        gw.managerScores[manager] = score;
        
        emit ScoreReceived(requestId, manager, gameweekId, score);
    }

    function distributePrizes(uint256 _gameweekId, address[] calldata winners, uint256[] calldata amounts) external onlyOwner {
        require(winners.length == amounts.length, "Mismatched arrays");
        Gameweek storage gw = gameweeks[_gameweekId];
        require(!gw.isActive, "Gameweek must be inactive/finished to distribute");
        
        emit PrizesDistributed(_gameweekId, winners, amounts);
    }
    
    function getParticipants(uint256 _gameweekId) external view returns (address[] memory) {
        return gameweeks[_gameweekId].participants;
    }
    
    function getScore(uint256 _gameweekId, address _manager) external view returns (uint256) {
        return gameweeks[_gameweekId].managerScores[_manager];
    }
}
