import { SiweMessage } from 'siwe';
import { parse } from 'cookie';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT not found in env variables');
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, signature } = req.body;
    const cookies = parse(req.headers.cookie || '');
    const savedNonce = cookies.siwe_nonce;
    
    if (!savedNonce) {
      return res.status(400).json({ error: 'No nonce in session. Please request a new nonce.' });
    }

    const siweMessage = new SiweMessage(message);
    const { data: fields } = await siweMessage.verify({ signature, nonce: savedNonce });

    const walletAddress = fields.address.toLowerCase();
    
    if (!admin.apps.length) {
      return res.status(500).json({ error: 'Firebase Admin not initialized on backend. Set FIREBASE_SERVICE_ACCOUNT in Vercel.' });
    }

    const customToken = await admin.auth().createCustomToken(walletAddress);

    res.setHeader('Set-Cookie', 'siwe_nonce=; Path=/; HttpOnly; Max-Age=0');
    res.status(200).json({ token: customToken, address: walletAddress });
  } catch (e) {
    console.error('SIWE Verification Error:', e);
    res.status(400).json({ error: e.message || 'Signature verification failed' });
  }
}
