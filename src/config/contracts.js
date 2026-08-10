import contractAddresses from '../contractAddresses.json';
import FPLSABI from './abis/FPLS.json';
import FPLGameABI from './abis/FPLGame.json';

export const FPLS_ADDRESS = contractAddresses.fplsAddress;
export const FPLGAME_ADDRESS = contractAddresses.gameAddress;
export const TREASURY_ADDRESS = contractAddresses.treasuryAddress;

export const FPLS_ABI = FPLSABI.abi;
export const FPLGAME_ABI = FPLGameABI.abi;
