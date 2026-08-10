import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const robinhoodTestnet = {
  id: 46630,
  name: 'Robinhood Chain Testnet',
  network: 'robinhood-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://rpc.testnet.chain.robinhood.com'] },
    default: { http: ['https://rpc.testnet.chain.robinhood.com'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.testnet.chain.robinhood.com' },
  },
}

export const config = createConfig({
  chains: [hardhat, sepolia, mainnet, robinhoodTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [robinhoodTestnet.id]: http(),
  },
})
