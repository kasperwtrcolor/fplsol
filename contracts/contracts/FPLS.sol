// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FPLS is ERC20, Ownable {
    uint256 public constant TAX_RATE = 3; // 3% tax
    address public treasury;

    mapping(address => bool) public isExcludedFromTax;

    event TreasuryUpdated(address newTreasury);
    event TaxDeducted(address indexed from, uint256 amount);

    constructor(address _treasury) ERC20("FPL.STOCKS", "FPLS") Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        
        // Exclude owner, treasury, and burn address from tax
        isExcludedFromTax[msg.sender] = true;
        isExcludedFromTax[_treasury] = true;
        isExcludedFromTax[0x000000000000000000000000000000000000dEaD] = true;

        // Mint initial supply of 100,000,000 tokens to the deployer
        _mint(msg.sender, 100000000 * 10**decimals());
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        isExcludedFromTax[_treasury] = true;
        emit TreasuryUpdated(_treasury);
    }

    function setExcludedFromTax(address account, bool excluded) external onlyOwner {
        isExcludedFromTax[account] = excluded;
    }

    function transfer(address to, uint256 value) public virtual override returns (bool) {
        address owner = _msgSender();
        _transferWithTax(owner, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transferWithTax(from, to, value);
        return true;
    }

    function _transferWithTax(address from, address to, uint256 amount) internal {
        if (amount == 0) {
            _transfer(from, to, 0);
            return;
        }

        uint256 taxAmount = 0;
        
        // Apply tax if neither sender nor receiver is excluded
        if (!isExcludedFromTax[from] && !isExcludedFromTax[to]) {
            taxAmount = (amount * TAX_RATE) / 100;
        }

        uint256 transferAmount = amount - taxAmount;

        if (taxAmount > 0) {
            _transfer(from, treasury, taxAmount);
            emit TaxDeducted(from, taxAmount);
        }

        _transfer(from, to, transferAmount);
    }

    // Custom mint function for testing/development
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
