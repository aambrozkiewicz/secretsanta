import 'dotenv/config';
import { resolve, dirname } from 'node:path';
import { mkdirSync, openSync, closeSync } from 'node:fs';
const url = process.env.DATABASE_URL || 'file:./prisma/dev.db';
if (!url.startsWith('file:'))
  throw new Error('Expected a file: SQLite DATABASE_URL.');
const path = resolve(url.slice(5));
mkdirSync(dirname(path), { recursive: true });
closeSync(openSync(path, 'a'));
