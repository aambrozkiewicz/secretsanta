import 'server-only';
import nodemailer from 'nodemailer';
import { db } from './db';
import { renderMailHtml } from './mail-template';

export function appUrl() {
  const value = process.env.APP_URL || 'http://localhost:3000';
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('Niepoprawny APP_URL.');
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:')
    throw new Error('APP_URL musi używać HTTPS.');
  return url.origin;
}
export function participantUrl(token: string) {
  return `${appUrl()}/s/${token}`;
}

/** Durable outbox. A short claim prevents concurrent requests sending the same job. */
export async function deliverMail(exchangeId: string) {
  if (!process.env.SMTP_HOST || !process.env.MAIL_FROM) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  const jobs = await db.mail.findMany({
    where: { exchangeId, sentAt: null },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });
  for (const job of jobs) {
    const claim = await db.mail.updateMany({
      where: {
        id: job.id,
        sentAt: null,
        OR: [
          { claimedAt: null },
          { claimedAt: { lt: new Date(Date.now() - 5 * 60_000) } },
        ],
      },
      data: { claimedAt: new Date() },
    });
    if (!claim.count) continue;
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: job.to,
        subject: job.subject,
        text: job.text,
        html: renderMailHtml(job),
      });
      await db.mail.update({
        where: { id: job.id },
        data: { sentAt: new Date(), claimedAt: null, text: '' },
      });
    } catch {
      await db.mail.update({
        where: { id: job.id },
        data: { claimedAt: null },
      });
      // Keep the job for explicit retry without logging private links or SMTP credentials.
      break;
    }
  }
  transporter.close();
}
