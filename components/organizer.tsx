'use client';
import { Button } from '@/components/button';
import { useState, useTransition } from 'react';
import { ArrowUpRight, Plus, X } from 'lucide-react';
import { createExchange, type ActionResult } from '@/lib/actions';
import { Feedback, input, sheet } from './ui';
type Person = { name: string; email: string };
export function Organizer({ passwordRequired }: { passwordRequired: boolean }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [result, setResult] = useState<ActionResult>({});
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name')).trim(),
      email = String(data.get('email')).trim().toLowerCase();
    if (!name) {
      setResult({ error: 'Podaj imię uczestnika.' });
      return;
    }
    if (people.some((p) => p.email === email)) {
      setResult({ error: 'Ten adres jest już na liście.' });
      return;
    }
    setPeople([...people, { name, email }]);
    setResult({});
    setConfirming(false);
    form.reset();
    form.querySelector('input')?.focus();
  }
  function draw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const response = await createExchange(
          people,
          String(data.get('password') || ''),
        );
        setResult(response);
        if (response.success) window.location.reload();
      } catch {
        setResult({
          error:
            'Nie udało się potwierdzić wyniku. Odśwież stronę, zanim spróbujesz ponownie.',
        });
      }
    });
  }
  return (
    <section className={sheet}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-medium">Wasza lista</h2>
        <span className="text-xs text-muted">{people.length} / 50 os.</span>
      </div>
      {!people.length && (
        <p className="border-b border-line py-5 text-sm text-muted">
          Każda niespodzianka zaczyna się od pierwszej osoby.
        </p>
      )}
      {people.map((p) => (
        <div
          key={p.email}
          className="flex flex-wrap items-center gap-3 border-b border-line py-3"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-soft text-burgundy">
            {p.name[0]}
          </span>
          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <p className="break-words text-sm">{p.name}</p>
            <p className="break-all text-xs text-muted">{p.email}</p>
          </div>
          <Button
            disabled={pending}
            type="button"
            aria-label={`Usuń ${p.name}`}
            iconOnly
            onClick={() => {
              setPeople(people.filter((x) => x.email !== p.email));
              setConfirming(false);
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      {people.length < 50 && (
        <form
          onSubmit={add}
          className="mt-5 grid gap-3 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end"
        >
          <label className="text-xs text-muted">
            Imię
            <input
              name="name"
              placeholder="np. Ola"
              maxLength={60}
              required
              disabled={pending}
              className={input}
              autoComplete="given-name"
            />
          </label>
          <label className="text-xs text-muted">
            Adres e-mail
            <input
              name="email"
              type="email"
              placeholder="ola@example.com"
              maxLength={254}
              required
              disabled={pending}
              className={input}
              autoComplete="email"
            />
          </label>
          <Button type="submit" disabled={pending}>
            Dodaj <Plus className="size-4" />
          </Button>
        </form>
      )}
      <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-6 text-muted">
          Każdy otrzyma prywatny link do swojego losowania.
          <br />
          Nikt nie wylosuje samego siebie.
        </p>
        <Button
          type="button"
          disabled={people.length < 2 || pending}

          onClick={() => {
            setConfirming(true);
            setResult({});
          }}
        >
          Przejdź do losowania <ArrowUpRight className="size-4" />
        </Button>
      </div>
      {confirming && (
        <form onSubmit={draw} className="mt-6 rounded-lg bg-cream p-5">
          <h3 className="font-medium">Lista jest kompletna?</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Wylosujemy pary dla {people.length} osób i wyślemy wiadomości. Po
            losowaniu nie można zmienić uczestników ani losować ponownie.
          </p>
          {passwordRequired && (
            <label className="mt-4 block text-xs text-muted">
              Hasło organizatora
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className={input}
                disabled={pending}
              />
            </label>
          )}
          <label className="mt-4 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              required
              className="mt-1 accent-burgundy"
              disabled={pending}
            />
            Potwierdzam listę i chcę wysłać zaproszenia.
          </label>
          <Button
            type="submit"
            className="mt-5 w-full sm:w-auto"
            disabled={pending}
          >
            {pending ? 'Trwa losowanie…' : 'Losuj i wyślij linki'}
            <ArrowUpRight className="size-4" />
          </Button>
        </form>
      )}
      <Feedback {...result} />
    </section>
  );
}
