'use client';
import { Button } from '@/components/button';
import { useState, useTransition } from 'react';
import { Gift, ArrowUpRight, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { saveWishes, type ActionResult } from '@/lib/actions';
import { Eyebrow, Feedback, input, sheet } from './ui';
function LetterText({ text }: { text: string }) {
  return (
    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7">
      {text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            rel="noreferrer noopener"
            target="_blank"
            className="break-all text-burgundy underline underline-offset-4"
          >
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </p>
  );
}
export function Participant({
  token,
  name,
  wishes,
  recipient,
}: {
  token: string;
  name: string;
  wishes: string;
  recipient: { name: string; wishes: string };
}) {
  const [revealed, setRevealed] = useState(false);
  const [text, setText] = useState(wishes);
  const [result, setResult] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <>
      <Eyebrow>TWÓJ PRYWATNY ŚWIĄTECZNY KĄCIK</Eyebrow>
      <h1 className="mt-4 break-words text-3xl font-medium tracking-tight sm:text-4xl">
        Cześć, {name}.
      </h1>
      <p className="mt-4 text-sm text-muted">
        Ktoś czeka na prezent właśnie od Ciebie.
      </p>
      <section
        className="my-8 rounded-xl bg-[#f7eee0] p-5 sm:p-7"
        aria-live="polite"
      >
        <div className="flex items-center gap-4">
          <Gift className="size-7 shrink-0 text-gold" aria-hidden="true" />
          <div className="min-w-0">
            {revealed ? (
              <>
                <p className="text-xs text-muted">Twój świąteczny sekret</p>
                <h2 className="mt-1 break-words text-xl font-medium">
                  Robisz prezent: {recipient.name}
                </h2>
              </>
            ) : (
              <>
                <p className="mb-3 text-sm">
                  Gotowa / gotowy poznać swój sekret?
                </p>
                <Button onClick={() => setRevealed(true)}>
                  Odkryj, komu robisz prezent
                </Button>
              </>
            )}
          </div>
        </div>
        {revealed && (
          <div className="mt-5 border-t border-gold/20 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-medium">List do Mikołaja</h3>
              <Button onClick={() => router.refresh()}>
                <RefreshCw className="size-3" />
                Odśwież list
              </Button>
            </div>
            {recipient.wishes ? (
              <LetterText text={recipient.wishes} />
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted">
                List jeszcze do nas nie dotarł. Gdy będzie gotowy, dostaniesz
                powiadomienie e-mail.
              </p>
            )}
          </div>
        )}
      </section>
      <section className={sheet}>
        <Eyebrow>LIST DO ŚWIĘTEGO MIKOŁAJA</Eyebrow>
        <h2 className="mt-3 text-2xl font-medium tracking-tight">
          A o czym Ty marzysz?
        </h2>
        <p className="mt-3 mb-5 text-sm leading-6 text-muted">
          Podpowiedz swojemu Mikołajowi, co sprawiłoby Ci radość.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              try {
                setResult(await saveWishes(token, text));
                router.refresh();
              } catch {
                setResult({
                  error: 'Nie udało się zapisać listu. Spróbuj ponownie.',
                });
              }
            });
          }}
        >
          <label htmlFor="wishes" className="text-xs text-muted">
            Twoja lista życzeń
          </label>
          <textarea
            id="wishes"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={5000}
            required
            rows={6}
            disabled={pending}
            className={input}
            placeholder="Drogi Mikołaju, w tym roku ucieszyłaby mnie dobra książka, herbata albo coś zrobionego własnoręcznie…"
          />
          <p className="mt-2 text-right text-xs text-muted">
            {text.length} / 5000
          </p>
          <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-6 text-muted">
              Możesz dodać linki i kilka słów o sobie.
              <br />
              List zobaczy tylko osoba, która Cię wylosowała.
            </p>
            <Button type="submit" disabled={pending || !text.trim()}>
              {pending ? 'Zapisywanie…' : 'Zapisz list'}
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </form>
        <Feedback {...result} />
        {wishes && (
          <p className="mt-4 text-xs text-muted">
            List możesz edytować. Po zmianie powiadomimy Twojego Mikołaja.
          </p>
        )}
      </section>
      <p className="mt-6 text-center text-xs leading-6 text-muted">
        Zachowaj swój link dla siebie. To klucz do Twojej niespodzianki.
      </p>
    </>
  );
}
