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
      <div className="flex flex-wrap gap-3 items-center">
        <p className="text-sm text-muted" role="status">
          {pending
            ? `Zaproszenia oczekujące na wysyłkę: ${pending}. Odśwież status za chwilę lub ponów wysyłkę.`
            : 'Wszystkie zaproszenia zostały wysłane.'}
        </p>
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
