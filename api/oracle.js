import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { gameweek, winner, totalPrizePool } = req.body;

  if (!gameweek || !winner || !totalPrizePool) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
  if (!ORACLE_PRIVATE_KEY) {
    return res.status(500).json({ error: 'Oracle private key not configured' });
  }

  try {
    const wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY);

    // Pack the data exactly as the Solidity contract expects:
    // abi.encodePacked(uint256, address, uint256)
    const payload = ethers.utils.solidityPack(
      ['uint256', 'address', 'uint256'],
      [gameweek, winner, totalPrizePool]
    );

    // Hash the payload
    const messageHash = ethers.utils.keccak256(payload);

    // Sign the hash (ethers handles the \x19Ethereum Signed Message prefix automatically)
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    res.status(200).json({ signature });
  } catch (error) {
    console.error('Error signing payload:', error);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
}
