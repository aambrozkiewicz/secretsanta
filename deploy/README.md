# Docker / Coolify i SQLite

Obraz używa Node.js 24 i uruchamia aplikację jako użytkownik `node` (UID/GID 1000). Budowanie nie wymaga produkcyjnej bazy ani sekretów. Prisma CLI pozostaje w obrazie, żeby przed każdym startem wykonać `prisma migrate deploy`. Nieudana migracja zatrzymuje start.

## Docker Compose

Skopiuj `.env.example` do `.env` i uzupełnij publiczny `APP_URL` oraz SMTP. Następnie:

```sh
docker compose up -d --build
docker compose logs -f app
```

Compose nadpisuje `DATABASE_URL` na `file:/data/santa.db`. Nazwany wolumen `santa-data` przechowuje cały katalog `/data`, włącznie z dodatkowymi plikami SQLite. Przetrwa restart, przebudowę i `docker compose down`. Polecenie `docker compose down -v` usuwa też bazę — nie używaj go, jeśli chcesz zachować dane.

Port 3000 jest dostępny na localhost VPS; przed nim ustaw proxy z HTTPS. Aktualizacja: `docker compose up -d --build`. Utrzymuj stałą nazwę projektu Compose, aby używać tego samego wolumenu.

## Coolify

Wybierz build pack Dockerfile, ścieżkę `/Dockerfile` i port aplikacji `3000`. Dodaj domenę HTTPS i zmienne runtime: `APP_URL`, SMTP, `MAIL_FROM` i opcjonalne `ORGANIZER_PASSWORD`. Ustaw `DATABASE_URL=file:/data/santa.db`.

W Persistent Storage dodaj **Volume Mount**, z docelowym katalogiem `/data`. Montuj katalog, nie pojedynczy plik bazy. Przy bind mouncie katalog na hoście musi być zapisywalny przez UID/GID 1000; nowy nazwany wolumen Dockera dziedziczy uprawnienia katalogu z obrazu.

Uruchamiaj jedną replikę i wyłącz rolling updates (nakładanie starego i nowego kontenera). Migracje są w poleceniu startowym; nie ustawiaj dodatkowego polecenia migracji ani startu w Coolify. Krótka przerwa przy wdrożeniu pozwala uniknąć obsługi ruchu przez stary kod podczas migracji.

## Kopie danych

Wolumen chroni przed wymianą kontenera, ale nie przed awarią dysku. Wykonuj kopie SQLite i przechowuj je także poza VPS. Użyj SQLite `.backup` lub zatrzymaj aplikację przed kopiowaniem całego katalogu danych; nie kopiuj samego pliku działającej bazy. Przed wdrożeniem migracji wykonaj kopię. Cofnięcie obrazu nie cofa migracji.

Istniejąca lokalna baza nie trafia do obrazu. Aby ją przenieść, zatrzymaj aplikację, zrób spójną kopię, umieść ją w wolumenie jako `/data/santa.db` i ustaw właściciela 1000:1000 przed startem.
