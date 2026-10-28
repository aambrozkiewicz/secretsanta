'use client';
import { Button } from '@/components/button';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { retryMail, type ActionResult } from '@/lib/actions';
import { Feedback } from './ui';
export function DeliveryStatus({ pending }: { pending: number }) {
  const [busy, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult>({});
  const router = useRouter();
  return (
    <div>
      <p className="mt-3 text-sm text-muted" role="status">
        {pending
          ? `${pending} wiadomości oczekuje na wysyłkę. Odśwież status za chwilę lub ponów wysyłkę.`
          : 'Wszystkie wiadomości zostały wysłane.'}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button disabled={busy} onClick={() => router.refresh()}>
          Odśwież status
        </Button>
        {pending > 0 && (
          <Button
            disabled={busy}
            onClick={() =>
              startTransition(async () => {
                try {
                  setResult(await retryMail());
                  router.refresh();
                } catch {
                  setResult({
                    error: 'Nie udało się sprawdzić wysyłki. Spróbuj ponownie.',
                  });
                }
              })
            }
          >
            {busy ? 'Wysyłanie…' : 'Ponów wysyłkę'}
          </Button>
        )}
      </div>
      <Feedback {...result} />
    </div>
  );
}
