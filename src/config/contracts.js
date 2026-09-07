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

// Robinhood Chain RWA Tokenized Stock: GameStop Corp. Class A Equity ($GME)
export const RWA_GME_ADDRESS = "0xMockGmeTokenAddress00000000000000000000";

export const GME_TOKEN_CONFIG = {
  symbol: 'GME',
  name: 'GameStop Corp. Class A Tokenized Equity',
  decimals: 18,
  network: 'Robinhood Chain',
  narrative: 'Play fantasy football, win real Wall Street equity.',
  taxSwapRate: '3%'
};

// Pons Family Launchpad & Dividend Claim Config
export const PONS_CONFIG = {
  platformName: 'Pons Family',
  platformUrl: 'https://ponsfamily.com',
  // Update tokenUrl with your exact token link once launched on ponsfamily.com:
  tokenUrl: 'https://ponsfamily.com/launchpad', 
  dividendsClaimUrl: 'https://ponsfamily.com', 
  pairedAsset: 'GME',
  pairedAssetName: 'GameStop Corp. Class A Tokenized Equity',
  tradingTax: '3%',
  dividendDistribution: '100% of 3% trading tax distributed directly to $FPLS token holders'
};

export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  }
];
