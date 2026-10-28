import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMailHtml } from '../lib/mail-template';

test('invitations and wish notifications contain their own action and private link', () => {
  for (const [key, label] of [
    ['invite:person', 'Odkryj swoje losowanie'],
    ['wishes:person:2', 'Przeczytaj list do Mikołaja'],
  ]) {
    const html = renderMailHtml({
      key,
      subject: 'Świąteczna wiadomość',
      text: 'Cześć, Ania!\n\nOdkryj swój sekret.\n\nhttps://example.com/s/secret\n\nTen link jest prywatny.\n\nSecret Santa',
    });
    assert.ok(html.includes(label));
    assert.equal(
      (html.match(/href="https:\/\/example.com\/s\/secret"/g) || []).length,
      2,
    );
    assert.ok(html.includes('Ten link jest prywatny.'));
    assert.ok(html.includes('lang="pl"'));
  }
});

test('user content and subjects are escaped and non-web links never become actions', () => {
  const html = renderMailHtml({
    key: 'invite:person',
    subject: '</title><script>alert(1)</script>',
    text: 'Cześć, <img src=x onerror="alert(1)"> & Ola!\nDruga linia\n\njavascript:alert(1)\n\nhttps://example.com/s/token?a=1&b="test"',
  });
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(html.includes('&lt;img'));
  assert.ok(html.includes('&amp; Ola!<br>Druga linia'));
  assert.ok(
    html.includes(
      'href="https://example.com/s/token?a=1&amp;b=&quot;test&quot;"',
    ),
  );
});
