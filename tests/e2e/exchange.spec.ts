import { test, expect } from '@playwright/test';
import { SMTPServer } from 'smtp-server';
const messages: { to: string; text: string }[] = [];
let rejectFirst = true;
const smtp = new SMTPServer({
  authOptional: true,
  disabledCommands: ['AUTH', 'STARTTLS'],
  onData(stream, session, callback) {
    let raw = '';
    stream.on('data', (chunk) => {
      raw += chunk.toString();
    });
    stream.on('end', () => {
      if (rejectFirst) {
        rejectFirst = false;
        callback(new Error('Test: temporary SMTP failure'));
        return;
      }
      const split = raw.indexOf('\r\n\r\n');
      const headers = raw.slice(0, split);
      const body = raw.slice(split + 4);
      const text = /Content-Transfer-Encoding: base64/i.test(headers)
        ? Buffer.from(body.replace(/\s/g, ''), 'base64').toString()
        : body
            .replace(/=\r\n/g, '')
            .replace(/=([A-F0-9]{2})/gi, (_, h) =>
              String.fromCharCode(parseInt(h, 16)),
            );
      messages.push({ to: session.envelope.rcptTo[0].address, text });
      callback();
    });
  },
});
test.beforeAll(async () => {
  await new Promise<void>((resolve) => smtp.listen(2526, '127.0.0.1', resolve));
});
test.afterAll(async () => {
  await new Promise<void>((resolve) => smtp.close(resolve));
});

test('draw, invitations, private access, wishes and notification work together', async ({
  page,
  browser,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Od Ciebie/ })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Przejdź do losowania' }),
  ).toBeDisabled();
  for (const name of ['Ania', 'Kuba', 'Marta']) {
    await page.getByRole('textbox', { name: 'Imię', exact: true }).fill(name);
    await page
      .getByRole('textbox', { name: 'Adres e-mail' })
      .fill(`${name.toLowerCase()}@example.com`);
    await page.getByRole('button', { name: 'Dodaj', exact: true }).click();
  }
  await page
    .getByRole('textbox', { name: 'Imię', exact: true })
    .fill('Duplikat');
  await page
    .getByRole('textbox', { name: 'Adres e-mail' })
    .fill('ANIA@example.com');
  await page.getByRole('button', { name: 'Dodaj', exact: true }).click();
  await expect(page.locator('p[role="alert"]')).toHaveText(
    'Ten adres jest już na liście.',
  );
  await page.getByRole('button', { name: 'Przejdź do losowania' }).click();
  await page.getByLabel('Hasło organizatora').fill('wrong');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Losuj i wyślij linki' }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(
    'Nieprawidłowe hasło',
  );
  await page.getByLabel('Hasło organizatora').fill('test-organizer');
  await page.getByRole('button', { name: 'Losuj i wyślij linki' }).click();
  await expect(
    page.getByRole('heading', { name: 'Sekrety są już rozdane.' }),
  ).toBeVisible({ timeout: 30000 });
  await expect(
    page.getByRole('button', { name: 'Ponów wysyłkę' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Ponów wysyłkę' }).click();
  await expect.poll(() => messages.length).toBe(3);
  const invitations = messages.slice();
  const links = invitations.map((m) => ({
    to: m.to,
    url: m.text.match(/http:\/\/localhost:3100\/s\/[a-f0-9]{64}/)![0],
  }));
  expect(new Set(links.map((l) => l.url)).size).toBe(3);
  // Organizer never sees private links or assigned recipients.
  expect(await page.locator('a[href*="/s/"]').count()).toBe(0);
  await page.getByRole('button', { name: 'Odśwież status' }).click();
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Wszystkie zaproszenia' })
      .first(),
  ).toContainText('Wszystkie zaproszenia');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Sekrety są już rozdane.' }),
  ).toBeVisible();
  const privateContext = await browser.newContext();
  await expect(
    page.getByText('Link jeszcze nieotwarty', { exact: true }),
  ).toHaveCount(3);
  await expect(
    page.getByText('List jeszcze nieuzupełniony', { exact: true }),
  ).toHaveCount(3);
  const participant = await privateContext.newPage();
  const ania = links.find((l) => l.to === 'ania@example.com')!;
  await participant.goto(ania.url);
  await expect(
    participant.getByRole('heading', { name: 'Cześć, Ania.' }),
  ).toBeVisible();
  await participant
    .getByRole('button', { name: 'Odkryj, komu robisz prezent' })
    .click();
  await expect(
    participant.getByRole('heading', { name: /Robisz prezent:/ }),
  ).not.toContainText('Ania');
  await participant
    .getByLabel('Twoja lista życzeń')
    .fill(
      'Dobra książka i herbata. https://example.com/prezent <script>alert(1)</script>',
    );
  await participant.getByRole('button', { name: 'Zapisz list' }).click();
  await expect(participant.getByRole('status')).toContainText('List zapisany');
  await page.getByRole('button', { name: 'Odśwież status' }).click();
  const aniaRow = page
    .locator('section > div')
    .filter({ has: page.getByText('ania@example.com', { exact: true }) });
  await expect(
    aniaRow.getByText('Link otwarty', { exact: true }),
  ).toBeVisible();
  await expect(
    aniaRow.getByText('List zapisany', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Link jeszcze nieotwarty', { exact: true }),
  ).toHaveCount(2);
  await expect(page.getByText(/Dobra książka/)).toHaveCount(0);
  await expect.poll(() => messages.length).toBe(4);
  await page.getByRole('button', { name: 'Odśwież status' }).click();
  await expect(page.getByText('Wysłane zaproszenia: 3 z 3')).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: 'test-results/organizer-mobile.png',
    fullPage: true,
  });
  expect(messages[3].to).not.toBe('ania@example.com');
  const santaLink = links.find((l) => l.to === messages[3].to)!;
  expect(messages[3].text).toContain(santaLink.url);
  await participant.getByRole('button', { name: 'Zapisz list' }).click();
  await expect(participant.getByRole('status')).toContainText('już zapisany');
  expect(messages.length).toBe(4);
  await participant.reload();
  await expect(participant.getByLabel('Twoja lista życzeń')).toHaveValue(
    /Dobra książka/,
  );
  const santa = await privateContext.newPage();
  await santa.goto(santaLink.url);
  await santa
    .getByRole('button', { name: 'Odkryj, komu robisz prezent' })
    .click();
  await expect(
    santa.getByRole('heading', { name: 'Robisz prezent: Ania' }),
  ).toBeVisible();
  await expect(
    santa.getByRole('link', { name: 'https://example.com/prezent' }),
  ).toBeVisible();
  await expect(
    santa.getByText('<script>alert(1)</script>', { exact: false }),
  ).toBeVisible();
  await participant.setViewportSize({ width: 375, height: 812 });
  await expect(participant.locator('body')).toHaveCSS(
    'font-family',
    /Noto Sans/,
  );
  expect(
    await participant.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await participant.screenshot({
    path: 'test-results/participant-mobile.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({
    path: 'test-results/organizer-desktop.png',
    fullPage: true,
  });
  await santa.goto('/s/' + '0'.repeat(64));
  await expect(
    santa.getByRole('heading', { name: 'Ten sekret jest poza zasięgiem.' }),
  ).toBeVisible();
  await privateContext.close();
});
