import { Button } from '@/components/button';
export default function NotFound() {
  return (
    <>
      <h1 className="text-3xl font-medium">Ten sekret jest poza zasięgiem.</h1>
      <p className="my-5 text-muted">
        Link jest niepoprawny. Otwórz pełny adres z otrzymanej wiadomości
        e-mail.
      </p>
      <Button href="/">Strona główna</Button>
    </>
  );
}
