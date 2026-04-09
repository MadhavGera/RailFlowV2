import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_EXPIRES = '7d';

// 👇 FIX 1: The secret is now inside the function to avoid the dotenv hoisting bug!
const makeToken = (user: { _id: any; email: string; name: string; role: string }) => {
  const secret = process.env.JWT_SECRET || 'railflow_secret';
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name, role: user.role }, 
    secret, 
    { expiresIn: JWT_EXPIRES }
  );
};

const setTokenCookie = (res: Response, token: string) =>
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashedPassword });

    const token = makeToken(user);
    setTokenCookie(res, token); 

    // 👇 FIX 2: We are sending the token back in the JSON body so LocalStorage can catch it
    res.status(201).json({ user: { name: user.name, email: user.email, picture: user.picture, role: user.role }, token });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = makeToken(user);
    setTokenCookie(res, token); 

    // 👇 FIX 2: We are sending the token back in the JSON body so LocalStorage can catch it
    res.json({ user: { name: user.name, email: user.email, picture: user.picture, role: user.role }, token });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/google/url
router.get('/google/url', (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: 'Google OAuth not configured' });

  const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const redirectUri = `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
});

// GET /api/auth/google/callback
router.get('/google/callback', async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code provided');

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  try {
    const redirectUri = `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`;

    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenRes.data;
    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { email, name, picture } = userRes.data;
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({ name, email: email.toLowerCase(), picture, provider: 'google' });
    }

    const token = makeToken(user);
    setTokenCookie(res, token);

    res.send(`
      <script>
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}' }, '*');
          window.close();
        } else {
          window.location.href = '${clientUrl}';
        }
      </script>
    `);
  } catch (err: any) {
    console.error('Google OAuth error:', err.message);
    res.status(500).send('Authentication failed');
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { name: user.name, email: user.email, picture: user.picture, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

export default router;