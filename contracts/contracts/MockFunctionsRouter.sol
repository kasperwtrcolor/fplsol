// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";

contract MockFunctionsRouter {
    event RequestSent(bytes32 indexed id, address indexed sender, bytes data);
    event RequestFulfilled(bytes32 indexed id);

    uint256 private s_requestCounter;
    mapping(bytes32 => address) public s_requests;

    function sendRequest(
        uint64 subscriptionId,
        bytes calldata data,
        uint16 dataVersion,
        uint32 callbackGasLimit,
        bytes32 donId
    ) external returns (bytes32) {
        s_requestCounter++;
        bytes32 requestId = keccak256(abi.encode(s_requestCounter, msg.sender, data));
        
        s_requests[requestId] = msg.sender;
        emit RequestSent(requestId, msg.sender, data);
        
        return requestId;
    }

    // Admin function to fulfill the request manually with whatever bytes response we want
    function fulfill(
        address clientAddress,
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) external {
        require(s_requests[requestId] == clientAddress, "Request not found for client");
        
        FunctionsClient(clientAddress).handleOracleFulfillment(requestId, response, err);
        emit RequestFulfilled(requestId);
    }
}
