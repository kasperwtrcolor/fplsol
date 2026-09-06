// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockGME
 * @dev Tokenized GameStop Corp. Class A Equity (GME) on Robinhood Chain
 * Used for the Dividend-Yielding Stock Yield Pool in fpl.stock
 */
contract MockGME is ERC20, Ownable {
    constructor() ERC20("GameStop Corp. Class A Tokenized Equity", "GME") Ownable(msg.sender) {
        // Mint initial supply to deployer for liquidity & rewards
        _mint(msg.sender, 100000 * 10 ** decimals());
    }

    /**
     * @dev Mint function for owner / game engine
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Public faucet for testnet users / local simulation (max 5 GME per call)
     */
    function faucet(address to, uint256 amount) external {
        require(amount <= 5 * 10 ** decimals(), "Faucet limit exceeded (max 5 GME)");
        _mint(to, amount);
    }
}
