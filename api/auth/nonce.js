import { generateNonce } from 'siwe';
import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const nonce = generateNonce();
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 5,
  };
  
  res.setHeader('Set-Cookie', serialize('siwe_nonce', nonce, cookieOptions));
  res.status(200).json({ nonce });
}
