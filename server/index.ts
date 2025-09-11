/**
 * MERN Backend: Auth + Sessions (Express + MongoDB + JWT, TypeScript)
 * ---------------------------------------------------------------
 * Endpoints
 *  POST   /api/auth/signup   -> create user, returns JWT + user
 *  POST   /api/auth/login    -> login, returns JWT + user
 *  GET    /api/auth/me       -> get current user (auth)
 *  POST   /api/sessions      -> save typing session (auth)
 *  GET    /api/sessions      -> list my sessions (auth)
 *
 * Quick start
 *  1) npm init -y && npm i express cors helmet mongoose bcryptjs jsonwebtoken zod dotenv
 *     npm i -D typescript ts-node-dev @types/express @types/cors @types/jsonwebtoken @types/bcryptjs @types/node
 *  2) npx tsc --init
 *  3) Create .env (see below), then run: npx ts-node-dev src/index.ts
 *
 * .env example
 *  PORT=4000
 *  MONGO_URI=mongodb://127.0.0.1:27017/typing_app
 *  JWT_SECRET=superlongrandomstring
 *  CORS_ORIGIN=http://localhost:5173
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose, { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// ---------- Env ----------
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/typing_app';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// ---------- DB ----------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((e) => {
    console.error('Mongo connection error:', e);
    process.exit(1);
  });

// ---------- Models ----------
interface IUser {
  name: string;
  email: string;
  passwordHash: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const User = model<IUser>('User', UserSchema);

interface ISessionSample { second: number; wpm: number }

interface ISession {
  userId: mongoose.Types.ObjectId;
  difficulty: 'low' | 'medium' | 'high';
  timeLimit: number;
  targetText: string;
  typedText: string;
  wpm: number;
  accuracy: number;
  date: Date;
  samples: ISessionSample[];
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    difficulty: { type: String, enum: ['low', 'medium', 'high'], required: true },
    timeLimit: { type: Number, required: true },
    targetText: { type: String, required: true },
    typedText: { type: String, required: true },
    wpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    date: { type: Date, default: () => new Date(), required: true },
    samples: [
      {
        second: { type: Number, required: true },
        wpm: { type: Number, required: true },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

const Session = model<ISession>('Session', SessionSchema);

// ---------- Express App ----------
const app = express();
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// ---------- Utils ----------
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function signToken(userId: string) {
  return jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req: Request & { userId?: string }, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.substring(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Authorization header' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { uid: string };
    req.userId = payload.uid;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ---------- Validation Schemas ----------
const SignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const SessionSchemaZ = z.object({
  difficulty: z.enum(['low', 'medium', 'high']),
  timeLimit: z.number().int().min(1).max(600),
  targetText: z.string().min(1),
  typedText: z.string().min(0),
  wpm: z.number().int().min(0),
  accuracy: z.number().int().min(0).max(100),
  date: z.string().datetime().or(z.date()).transform((d: string | Date) => new Date(d)),
  samples: z.array(z.object({ second: z.number().int().min(0), wpm: z.number().int().min(0) })).default([]),
});

// ---------- Routes ----------
app.get('/health', (_req, res) => res.json({ ok: true }));

app.post(
  '/api/auth/signup',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = SignupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { name, email, password } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user.id);
    return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  })
);

app.post(
  '/api/auth/login',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user.id);
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  })
);

app.get('/api/auth/me', authMiddleware, asyncHandler(async (req: Request & { userId?: string }, res: Response) => {
  const user = await User.findById(req.userId).select('name email');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
}));

app.post(
  '/api/sessions',
  authMiddleware,
  asyncHandler(async (req: Request & { userId?: string }, res: Response) => {
    const parsed = SessionSchemaZ.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const s = await Session.create({ ...parsed.data, userId: new mongoose.Types.ObjectId(req.userId!) });
    return res.status(201).json({ id: s.id });
  })
);

app.get(
  '/api/sessions',
  authMiddleware,
  asyncHandler(async (req: Request & { userId?: string }, res: Response) => {
    const list = await Session.find({ userId: req.userId }).sort({ date: -1 }).lean();
    return res.json({ sessions: list });
  })
);

// ---------- Error handling ----------
import { ZodError } from 'zod';

app.use((err: unknown, _req: Request, res: Response) => {
  console.error(err);
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.flatten() });
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));

/**
 * Frontend wiring (replace mocks in App.tsx):
 *
 * import axios from 'axios';
 * const api = axios.create({ baseURL: 'http://localhost:4000', headers: { 'Content-Type': 'application/json' }});
 * // After login/signup, store token
 * api.interceptors.request.use((cfg) => {
 *   const token = localStorage.getItem('jwt');
 *   if (token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
 *   return cfg;
 * });
 *
 * // signup
 * const { data } = await api.post('/api/auth/signup', { name, email, password });
 * localStorage.setItem('jwt', data.token);
 *
 * // login
 * const { data } = await api.post('/api/auth/login', { email, password });
 * localStorage.setItem('jwt', data.token);
 *
 * // save session
 * await api.post('/api/sessions', { difficulty, timeLimit, targetText, typedText, wpm, accuracy, date: new Date().toISOString(), samples });
 *
 * // get sessions
 * const { data } = await api.get('/api/sessions');
 */
