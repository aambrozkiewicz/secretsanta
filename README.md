# Secret Santa

Jedna aplikacja Next.js (App Router, TypeScript), Tailwind CSS 4, Prisma 7 i SQLite. Lokalnie hostowany Noto Sans, ciepła biel, bordo i złoto. Bez osobnego API ani serwera bazy danych.

## Uruchomienie

Wymagany Node.js 24.x. Wersja jest wskazana także w `.nvmrc` i `.node-version`; używaj tej samej głównej wersji lokalnie i na VPS.

```sh
npm ci
cp .env.example .env
npm run db:generate
npm run db:deploy
npm run dev
```

Otwórz http://localhost:3000. Dodaj od 2 do 50 uczestników, potwierdź listę i rozpocznij losowanie. W lokalnym trybie developerskim hasło organizatora jest opcjonalne.

## Konfiguracja poczty

W `.env` ustaw `APP_URL` (publiczny adres aplikacji), `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` i `MAIL_FROM`. Port 465 zwykle wymaga `SMTP_SECURE=true`; port 587 używa STARTTLS (`false`). Serwer SMTP może działać bez uwierzytelnienia lokalnie. W produkcji ustaw `APP_URL=https://twoja-domena.pl` i silne `ORGANIZER_PASSWORD` — bez hasła tworzenie losowań jest zablokowane. Dane SMTP pozostają wyłącznie na serwerze.

Wiadomości są wysyłane w tle po odpowiedzi serwera. Bez SMTP pozostają w bazie jako oczekujące; aplikacja nie udaje poprawnej dostawy. Na stronie organizatora przyciski „Odśwież status” i „Ponów wysyłkę” pozwalają sprawdzić i ponowić dostawę. Ponowienie nie zmienia losowania ani nie wysyła ponownie wiadomości oznaczonych jako wysłane. W razie awarii procesu między przyjęciem maila przez SMTP a zapisem statusu w bazie możliwa jest powtórna dostawa (at-least-once). SMTP potwierdza przyjęcie, a nie dostarczenie do skrzynki.

## Jak działa

- Fisher–Yates + przesunięcie listy o jedną pozycję, zgodnie z pierwotnym algorytmem. Każdy daje i otrzymuje jeden prezent, nikt nie losuje siebie. Wszyscy tworzą jeden cykl.
- Uczestnicy, przydziały i zaproszenia zapisują się w jednej transakcji. Wyniki nie są dostępne organizatorowi w interfejsie.
- Linki `/s/[token]` zawierają 256-bitowe tokeny z kryptograficznego generatora. Nie używamy `Math.random()` do tokenów. Link jest kluczem dostępu — nie należy go udostępniać. Administrator serwera ma dostęp do bazy i wyników.
- Uczestnik odkrywa odbiorcę i widzi jego list. Osobno zapisuje własny list (do 5000 znaków, z linkami). Pierwszy zapis i każda zmiana dodają powiadomienie dla osoby, która go wylosowała. Identyczny zapis nie generuje kolejnego maila.
- Sesja organizatora jest przechowywana w ciasteczku HttpOnly na rok. Przeglądarka pokazuje jedno zakończone losowanie; nie ma panelu wielu wydarzeń, resetowania, kont ani odzyskiwania sesji. Inne urządzenie/profil przeglądarki może stworzyć osobne wydarzenie. Utrata ciasteczka oznacza utratę dostępu do panelu, ale linki uczestników pozostają aktywne.
- Prywatne strony nie są indeksowane, nie ładują zewnętrznych fontów ani analityki i nie przekazują adresu strony jako referrera.

## Wdrożenie na VPS OVH

Instrukcja dla Ubuntu/Debian, Supervisor, Nginx i HTTPS: [deploy/README.md](deploy/README.md).

Jeden proces Next.js obsługuje stronę, backend i wysyłkę. SQLite znajduje się poza katalogiem kodu w `/var/lib/secretsanta/santa.db`, więc aktualizacje aplikacji nie usuwają danych. Gotowe konfiguracje są w `deploy/`.

## Sprawdzenie

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

Testy sprawdzają poprawność przydziałów dla różnych wielkości grup, pojedynczy cykl, brak samolosowania, niezmienność danych wejściowych i tokeny dostępu. Build generuje klienta Prisma; nie potrzebuje produkcyjnej bazy ani SMTP.

Pełny test przeglądarkowy uruchamia własny serwer aplikacji, lokalny SMTP i osobną bazę `prisma/e2e.db` (bez prawdziwych maili):

```sh
npx playwright install chromium
npm run test:e2e
```

Obejmuje też duplikaty adresów, błędne hasło, trwałość listu, brak ponownego powiadomienia dla niezmienionego tekstu, wyświetlanie treści jako tekstu, nieprawidłowe linki i szerokość ekranu telefonu.
