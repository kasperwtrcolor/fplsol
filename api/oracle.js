import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { gameweek, winner, rank, prizeAmount, totalPrizePool } = req.body;
  const amount = prizeAmount || totalPrizePool;
  const rankNum = rank !== undefined ? Number(rank) : 1;

  if (!gameweek || !winner || !amount) {
    return res.status(400).json({ error: 'Missing parameters (gameweek, winner, and prizeAmount are required)' });
  }

  const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
  if (!ORACLE_PRIVATE_KEY) {
    return res.status(500).json({ error: 'Oracle private key not configured' });
  }

  try {
    const wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY);

    // 1. Multi-winner Podium payload: abi.encodePacked(uint256 gameweek, uint256 rank, address winner, uint256 prizeAmount)
    const podiumPayload = ethers.utils.solidityPack(
      ['uint256', 'uint256', 'address', 'uint256'],
      [gameweek, rankNum, winner, amount]
    );
    const podiumHash = ethers.utils.keccak256(podiumPayload);
    const signature = await wallet.signMessage(ethers.utils.arrayify(podiumHash));

    // 2. Legacy payload for backward compatibility: abi.encodePacked(uint256 gameweek, address winner, uint256 totalPrizePool)
    const legacyPayload = ethers.utils.solidityPack(
      ['uint256', 'address', 'uint256'],
      [gameweek, winner, amount]
    );
    const legacyHash = ethers.utils.keccak256(legacyPayload);
    const legacySignature = await wallet.signMessage(ethers.utils.arrayify(legacyHash));

    res.status(200).json({ 
      signature, 
      legacySignature,
      gameweek,
      rank: rankNum,
      winner,
      amount
    });
  } catch (error) {
    console.error('Error signing payload:', error);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
}
