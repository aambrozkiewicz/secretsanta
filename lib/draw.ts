/** Fisher–Yates followed by a one-position rotation, as in the original project. */
export function generateSecretSantas<T>(people: readonly T[]): [T, T][] {
  if (people.length < 2) throw new Error('Potrzebne są co najmniej 2 osoby.');
  const shuffled = [...people];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const offset = [shuffled[shuffled.length - 1], ...shuffled.slice(0, -1)];
  return shuffled.map((person, i) => [person, offset[i]]);
}
