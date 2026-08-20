// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "./BaseHook.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {SwapParams} from "v4-core/types/PoolOperation.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/types/PoolId.sol";
import {BalanceDelta} from "v4-core/types/BalanceDelta.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract RwaTaxHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    address public immutable treasury;
    IERC20 public immutable fplsToken;
    IERC20 public immutable gmeToken;

    uint256 public constant TAX_RATE = 300; 
    uint256 public constant BASIS_POINTS = 10000;

    constructor(
        IPoolManager _poolManager,
        address _treasury,
        address _fplsToken,
        address _gmeToken
    ) BaseHook(_poolManager) {
        treasury = _treasury;
        fplsToken = IERC20(_fplsToken);
        gmeToken = IERC20(_gmeToken);
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: false,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    function afterSwap(
        address,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external override onlyByPoolManager returns (bytes4, int128) {
        int256 swapAmount = delta.amount0(); 
        if (swapAmount < 0) {
            swapAmount = -swapAmount; 
        }
        
        uint256 taxAmount = (uint256(swapAmount) * TAX_RATE) / BASIS_POINTS;
        
        return (BaseHook.afterSwap.selector, 0);
    }
}
