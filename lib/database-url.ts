import { resolve } from 'node:path';
/** Use one absolute SQLite path in both the Prisma CLI and runtime adapter. */
export function databaseUrl() {
  const url = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  if (!url.startsWith('file:'))
    throw new Error('DATABASE_URL musi wskazywać plik SQLite (file:).');
  return `file:${resolve(url.slice(5))}`;
}
