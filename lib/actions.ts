'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { z } from 'zod';
import { db } from './db';
import { generateSecretSantas } from './draw';
import { hashToken, newToken, validPassword } from './tokens';
import { deliverMail, participantUrl } from './mail';

const peopleSchema = z
  .array(
    z.object({
      name: z.string().trim().min(1).max(60),
      email: z.email().trim().toLowerCase().max(254),
    }),
  )
  .min(2)
  .max(50);
export type ActionResult = { error?: string; success?: string };
const cookieName = 'santa-organizer';
export async function getExchange() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  return db.exchange.findUnique({
    where: { adminHash: hashToken(token) },
    include: {
      people: {
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      },
      mail: { select: { sentAt: true } },
    },
  });
}
export async function createExchange(
  input: unknown,
  password: string,
): Promise<ActionResult> {
  if (!validPassword(typeof password === 'string' ? password : ''))
    return {
      error:
        'Nieprawidłowe hasło organizatora lub brak konfiguracji hasła na serwerze.',
    };
  const parsed = peopleSchema.safeParse(input);
  if (!parsed.success)
    return {
      error: 'Podaj od 2 do 50 osób z poprawnymi imionami i adresami e-mail.',
    };
  if (new Set(parsed.data.map((p) => p.email)).size !== parsed.data.length)
    return { error: 'Każda osoba musi mieć inny adres e-mail.' };
  if (await getExchange())
    return { error: 'Losowanie zostało już wykonane. Odśwież stronę.' };
  const adminToken = newToken();
  const people = parsed.data.map((p) => ({
    ...p,
    id: newToken(),
    token: newToken(),
  }));
  const pairs = generateSecretSantas(people);
  // Validate the configured origin before committing any assignments.
  const invitations = people.map((p) => ({
    key: `invite:${p.id}`,
    to: p.email,
    subject: 'Twój świąteczny sekret czeka na odkrycie',
    text: `Cześć, ${p.name}!\n\nLosowanie Secret Santa jest gotowe. Odkryj, komu robisz prezent i napisz swój list do Mikołaja:\n\n${participantUrl(p.token)}\n\nZachowaj ten link dla siebie — zapewnia dostęp do Twojego losowania.\n\nSecret Santa`,
  }));
  const exchange = await db.$transaction(async (tx) => {
    const event = await tx.exchange.create({
      data: {
        adminHash: hashToken(adminToken),
        people: { create: people },
        mail: { create: invitations },
      },
    });
    for (const [giver, recipient] of pairs)
      await tx.person.update({
        where: { id: giver.id },
        data: { recipientId: recipient.id },
      });
    return event;
  });
  (await cookies()).set(cookieName, adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  after(() => deliverMail(exchange.id));
  revalidatePath('/');
  return {
    success: 'Losowanie gotowe. Wiadomości zostały przekazane do wysyłki.',
  };
}
export async function retryMail(): Promise<ActionResult> {
  const exchange = await getExchange();
  if (!exchange) return { error: 'Brak dostępu do losowania.' };
  await deliverMail(exchange.id);
  revalidatePath('/');
  const pending = await db.mail.count({
    where: { exchangeId: exchange.id, sentAt: null },
  });
  return pending
    ? {
        error:
          'Część wiadomości nadal czeka na wysyłkę. Sprawdź konfigurację SMTP i spróbuj ponownie.',
      }
    : { success: 'Wszystkie wiadomości zostały wysłane.' };
}
export async function saveWishes(
  token: string,
  input: string,
): Promise<ActionResult> {
  if (!/^[a-f0-9]{64}$/.test(token)) return { error: 'Nieprawidłowy link.' };
  const parsed = z.string().trim().min(1).max(5000).safeParse(input);
  if (!parsed.success)
    return { error: 'Napisz list o długości od 1 do 5000 znaków.' };
  const person = await db.person.findUnique({
    where: { token },
    include: { santa: true },
  });
  if (!person?.santa) return { error: 'Nie znaleziono losowania.' };
  if (person.wishes === parsed.data)
    return { success: 'Twój list jest już zapisany.' };
  const url = participantUrl(person.santa.token);
  try {
    await db.$transaction(async (tx) => {
      // Optimistic revision prevents duplicate notifications from concurrent saves.
      const updated = await tx.person.updateMany({
        where: { id: person.id, revision: person.revision },
        data: { wishes: parsed.data, revision: { increment: 1 } },
      });
      if (!updated.count) throw new Error('CONFLICT');
      await tx.mail.create({
        data: {
          exchangeId: person.exchangeId,
          key: `wishes:${person.id}:${person.revision + 1}`,
          to: person.santa!.email,
          subject: `${person.name} ${person.revision ? 'aktualizuje' : 'przesyła'} list do Mikołaja`,
          text: `Cześć, ${person.santa!.name}!\n\n${person.name} ${person.revision ? 'aktualizuje swoją listę życzeń' : 'uzupełnia swoją listę życzeń'}. Przeczytaj list i znajdź inspirację na prezent:\n\n${url}\n\nTen link jest prywatny.\n\nSecret Santa`,
        },
      });
    });
  } catch {
    return {
      error: 'Nie udało się zapisać listu. Odśwież stronę i spróbuj ponownie.',
    };
  }
  after(() => deliverMail(person.exchangeId));
  revalidatePath(`/s/${token}`);
  return {
    success:
      'List zapisany. Powiadomienie dla Twojego Mikołaja czeka na wysyłkę.',
  };
}
