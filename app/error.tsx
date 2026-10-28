'use client';
import { Button } from '@/components/button';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <>
      <h1 className="text-3xl font-medium">
        Coś zatrzymało świąteczną pocztę.
      </h1>
      <p className="my-5 text-muted">
        Nie udało się wczytać strony. Spróbuj ponownie za chwilę.
      </p>
      <Button onClick={reset}>Spróbuj ponownie</Button>
    </>
  );
}
