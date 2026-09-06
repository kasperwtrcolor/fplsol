// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/PrizePool.sol";

contract DeployPrizePool is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address fplsTokenAddress = vm.envAddress("FPLS_ADDRESS");
        address oracleAddress = vm.envAddress("ORACLE_ADDRESS");

        address gmeTokenAddress = vm.envOr("GME_ADDRESS", address(0));

        vm.startBroadcast(deployerPrivateKey);

        FPLSPrizePool prizePool = new FPLSPrizePool(fplsTokenAddress, gmeTokenAddress, oracleAddress);
        console.log("PrizePool deployed at:", address(prizePool));

        vm.stopBroadcast();
    }
}
