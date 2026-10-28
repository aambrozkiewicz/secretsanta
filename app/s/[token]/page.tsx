import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Participant } from '@/components/participant';
export const dynamic = 'force-dynamic';
export default async function ParticipantPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token)) notFound();
  const person = await db.person.findUnique({
    where: { token },
    include: { recipient: { select: { name: true, wishes: true } } },
  });
  if (!person?.recipient) notFound();
  return (
    <div className="mx-auto max-w-3xl py-4">
      <Participant
        token={token}
        name={person.name}
        wishes={person.wishes}
        recipient={person.recipient}
      />
    </div>
  );
}
