// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {PoolManager} from "v4-core/PoolManager.sol";

contract DeployCore is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the Uniswap v4 PoolManager
        // The constructor takes the address of the initial owner (which will be the deployer)
        PoolManager manager = new PoolManager(deployerAddress);
        
        console.log("Uniswap v4 PoolManager deployed to:", address(manager));

        vm.stopBroadcast();
    }
}
