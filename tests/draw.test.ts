import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSecretSantas } from '../lib/draw';
import { hashToken, newToken, validPassword } from '../lib/tokens';

test('every participant gives and receives exactly once, never to themselves', () => {
  for (const size of [2, 3, 4, 10, 50]) {
    const people = Array.from({ length: size }, (_, id) => ({ id }));
    const original = [...people];
    for (let run = 0; run < 100; run++) {
      const pairs = generateSecretSantas(people);
      assert.equal(pairs.length, size);
      assert.equal(new Set(pairs.map(([giver]) => giver.id)).size, size);
      assert.equal(
        new Set(pairs.map(([, recipient]) => recipient.id)).size,
        size,
      );
      for (const [giver, recipient] of pairs)
        assert.notEqual(giver.id, recipient.id);
      // Original algorithm produces one cycle through the entire group.
      const next = new Map(pairs.map(([a, b]) => [a.id, b.id]));
      const visited = new Set<number>();
      let current = 0;
      while (!visited.has(current)) {
        visited.add(current);
        current = next.get(current)!;
      }
      assert.equal(visited.size, size);
      assert.equal(current, 0);
    }
    assert.deepEqual(people, original);
  }
});
test('a draw requires at least two people', () => {
  assert.throws(() => generateSecretSantas([]));
  assert.throws(() => generateSecretSantas(['Ania']));
});
test('private links have 256 bits of randomness', () => {
  const values = Array.from({ length: 100 }, newToken);
  assert.equal(new Set(values).size, 100);
  for (const token of values) assert.match(token, /^[a-f0-9]{64}$/);
  assert.equal(hashToken('test'), hashToken('test'));
  assert.notEqual(hashToken(values[0]), hashToken(values[1]));
});
test('organizer password is checked without accepting a wrong value', () => {
  const before = process.env.ORGANIZER_PASSWORD;
  try {
    process.env.ORGANIZER_PASSWORD = 'test-secret';
    assert.equal(validPassword('test-secret'), true);
    assert.equal(validPassword('wrong'), false);
    assert.equal(validPassword(''), false);
  } finally {
    if (before === undefined) delete process.env.ORGANIZER_PASSWORD;
    else process.env.ORGANIZER_PASSWORD = before;
  }
});
