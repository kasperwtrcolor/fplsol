// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {HookMiner} from "v4-periphery/test/shared/HookMiner.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {RwaTaxHook} from "../src/RwaTaxHook.sol";

/**
 * @title DeployRwaTaxHook
 * @dev Deploys the RwaTaxHook to Robinhood Chain Mainnet (Chain ID: 4663).
 *
 * Required environment variables:
 *   PRIVATE_KEY       - Deployer wallet private key (must have ETH on Robinhood Chain)
 *   TREASURY_ADDRESS  - Treasury wallet that receives the $GME RWA tokens
 *   FPLS_TOKEN        - Deployed $FPLS token address on Robinhood Chain
 *   GME_TOKEN         - Synthetic $GME RWA token address on Robinhood Chain
 *
 * Usage:
 *   forge script script/DeployRwaTaxHook.s.sol:DeployRwaTaxHook \
 *     --rpc-url https://rpc.mainnet.chain.robinhood.com/ \
 *     --broadcast -vvvv
 */
contract DeployRwaTaxHook is Script {
    // Official Uniswap v4 PoolManager on Robinhood Chain Mainnet
    address constant POOL_MANAGER = 0x8366a39CC670B4001A1121B8F6A443A643e40951;

    function run() external {
        // Read required addresses from environment
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        address fplsToken = vm.envAddress("FPLS_TOKEN");
        address gmeToken = vm.envAddress("GME_TOKEN");

        console.log("=== RwaTaxHook Deployment on Robinhood Chain ===");
        console.log("PoolManager:", POOL_MANAGER);
        console.log("Treasury:", treasury);
        console.log("FPLS Token:", fplsToken);
        console.log("GME Token:", gmeToken);

        // The hook only needs AFTER_SWAP permission (bit 6)
        uint160 flags = uint160(Hooks.AFTER_SWAP_FLAG);

        // Mine a salt that produces a contract address with the correct flag bits
        console.log("Mining hook address with AFTER_SWAP flag...");
        (address hookAddress, bytes32 salt) = HookMiner.find(
            address(this),
            flags,
            type(RwaTaxHook).creationCode,
            abi.encode(POOL_MANAGER, treasury, fplsToken, gmeToken)
        );

        console.log("Found valid hook address:", hookAddress);
        console.log("Salt:", vm.toString(salt));

        // Deploy
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        RwaTaxHook hook = new RwaTaxHook{salt: salt}(
            IPoolManager(POOL_MANAGER),
            treasury,
            fplsToken,
            gmeToken
        );

        require(address(hook) == hookAddress, "Hook address mismatch!");
        console.log("=== SUCCESS ===");
        console.log("RwaTaxHook deployed at:", address(hook));

        vm.stopBroadcast();
    }
}
