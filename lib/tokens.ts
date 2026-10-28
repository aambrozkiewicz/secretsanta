import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
export const newToken = () => randomBytes(32).toString('hex');
export const hashToken = (value: string) =>
  createHash('sha256').update(value).digest('hex');
export function validPassword(value: string) {
  const expected = process.env.ORGANIZER_PASSWORD;
  if (!expected) return process.env.NODE_ENV !== 'production';
  return timingSafeEqual(
    Buffer.from(hashToken(value)),
    Buffer.from(hashToken(expected)),
  );
}
