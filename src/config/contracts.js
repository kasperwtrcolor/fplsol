import contractAddresses from '../contractAddresses.json';
import FPLSABI from './abis/FPLS.json';
import FPLGameABI from './abis/FPLGame.json';
import PrizePoolABI from './abis/PrizePool.json';

export const FPLS_ADDRESS = contractAddresses.fplsAddress;
export const FPLGAME_ADDRESS = contractAddresses.gameAddress;
export const TREASURY_ADDRESS = contractAddresses.treasuryAddress;

export const FPLS_ABI = FPLSABI.abi;
export const FPLGAME_ABI = FPLGameABI.abi;
export const PRIZE_POOL_ABI = PrizePoolABI.abi;
export const PRIZE_POOL_ADDRESS = contractAddresses.treasuryAddress; // The Treasury acts as the prize pool now

export const RWA_GME_ADDRESS = "0xMockGmeTokenAddress00000000000000000000";

export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
];
