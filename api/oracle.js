import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { gameweek, winner, rank, prizeAmount, totalPrizePool, fplsAmount: reqFplsAmount, gmeAmount: reqGmeAmount } = req.body;
  const fplsAmount = reqFplsAmount || prizeAmount || totalPrizePool;
  const gmeAmount = reqGmeAmount || 0;
  const rankNum = rank !== undefined ? Number(rank) : 1;

  if (!gameweek || !winner || (!fplsAmount && !gmeAmount)) {
    return res.status(400).json({ error: 'Missing parameters (gameweek, winner, and prize amounts are required)' });
  }

  const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
  if (!ORACLE_PRIVATE_KEY) {
    return res.status(500).json({ error: 'Oracle private key not configured' });
  }

  try {
    const wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY);

    // 1. Dual-Token Podium payload (FPLS + Tokenized GME Stock Yield):
    // abi.encodePacked(uint256 gameweek, uint256 rank, address winner, uint256 fplsAmount, uint256 gmeAmount)
    const dualPayload = ethers.utils.solidityPack(
      ['uint256', 'uint256', 'address', 'uint256', 'uint256'],
      [gameweek, rankNum, winner, fplsAmount, gmeAmount]
    );
    const dualHash = ethers.utils.keccak256(dualPayload);
    const dualSignature = await wallet.signMessage(ethers.utils.arrayify(dualHash));

    // 2. FPLS-only 4-param payload: abi.encodePacked(uint256 gameweek, uint256 rank, address winner, uint256 prizeAmount)
    const podiumPayload = ethers.utils.solidityPack(
      ['uint256', 'uint256', 'address', 'uint256'],
      [gameweek, rankNum, winner, fplsAmount]
    );
    const podiumHash = ethers.utils.keccak256(podiumPayload);
    const fplsOnlySignature = await wallet.signMessage(ethers.utils.arrayify(podiumHash));

    // 3. Legacy 3-param payload for backward compatibility
    const legacyPayload = ethers.utils.solidityPack(
      ['uint256', 'address', 'uint256'],
      [gameweek, winner, fplsAmount]
    );
    const legacyHash = ethers.utils.keccak256(legacyPayload);
    const legacySignature = await wallet.signMessage(ethers.utils.arrayify(legacyHash));

    res.status(200).json({ 
      signature: dualSignature, 
      fplsOnlySignature,
      legacySignature,
      gameweek,
      rank: rankNum,
      winner,
      fplsAmount,
      gmeAmount,
      amount: fplsAmount
    });
  } catch (error) {
    console.error('Error signing payload:', error);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
}
