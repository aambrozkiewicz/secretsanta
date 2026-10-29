'use client';
import { Button } from '@/components/button';
import { useEffect, useState, useTransition } from 'react';
import {
  Gift,
  ArrowUpRight,
  RefreshCw,
  MailOpen,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { markLinkOpened, saveWishes, type ActionResult } from '@/lib/actions';
import { Eyebrow, Feedback, input, sheet } from './ui';
function LetterText({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap break-words text-sm leading-8 sm:text-base">
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
  useEffect(() => {
    // Record a browser visit, rather than a server render or link preview.
    void markLinkOpened(token).catch(() => {});
  }, [token]);
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
              <div className="relative mt-7 rounded-xl border border-gold/20 bg-[#fffdf8] p-5 pt-7 shadow-[0_8px_30px_-12px_#99703940] sm:p-7 sm:pt-8">
                <div
                  className="absolute -top-4 right-5 flex size-12 rotate-6 items-center justify-center rounded-xl border-4 border-[#f7eee0] bg-burgundy text-white shadow-sm sm:right-7"
                  aria-hidden="true"
                >
                  <MailOpen className="size-6" strokeWidth={1.5} />
                </div>
                <div className="mb-5 flex items-center gap-2 border-b border-gold/15 pb-4 pr-10 text-gold">
                  <Sparkles className="size-3.5 shrink-0" aria-hidden="true" />
                  <p className="break-words text-xs font-medium tracking-wide">
                    Świąteczne marzenia · {recipient.name}
                  </p>
                </div>
                <LetterText text={recipient.wishes} />
                <div
                  className="mt-6 h-1 rounded-full bg-[repeating-linear-gradient(135deg,#be363c_0px,#be363c_8px,transparent_8px,transparent_16px,#997039_16px,#997039_24px,transparent_24px,transparent_32px)] opacity-30"
                  aria-hidden="true"
                />
              </div>
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
