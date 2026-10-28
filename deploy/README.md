# VPS OVH: Supervisor + Nginx

Przykład dla świeżego VPS z Ubuntu 24.04 lub Debianem. Potrzebujesz dostępu SSH z sudo, domeny i SMTP. Podmień `santa.example.com` na swoją domenę. Aplikacja działa w jednym procesie, baza SQLite pozostaje na trwałym dysku poza kodem.

## 1. System i Node.js

Ustaw rekord A domeny na publiczny IPv4 VPS w panelu DNS. Rekord AAAA dodaj tylko, jeżeli skonfigurujesz także IPv6. W firewallu VPS oraz ewentualnym firewallu OVH dopuść SSH i porty TCP 80/443. Port 3000 pozostaje dostępny tylko lokalnie.

```sh
sudo apt update
sudo apt install -y ca-certificates curl gnupg rsync build-essential python3 openssl nginx supervisor sqlite3 certbot python3-certbot-nginx
```

Zainstaluj aktualną wersję Node.js 24 LTS, np. z repozytorium [NodeSource](https://github.com/nodesource/distributions#installation-instructions). Jeżeli masz już Node.js 24, pomiń instalację i sprawdź jedynie jego ścieżkę i wersję. W przeciwnym razie:

```sh
curl -fsSL https://deb.nodesource.com/setup_24.x -o /tmp/nodesource_setup.sh
# Możesz przejrzeć skrypt przed uruchomieniem.
sudo bash /tmp/nodesource_setup.sh
sudo apt install -y nodejs
/usr/bin/node --version
/usr/bin/npm --version
sudo systemctl enable --now supervisor nginx
```

Po zmianie głównej wersji Node.js ponownie wykonaj `npm ci --include=dev` i `npm run build` przy zatrzymanej aplikacji, zgodnie z sekcją aktualizacji. To przebuduje natywny moduł SQLite dla Node.js 24.

Konfiguracja Supervisora używa `/usr/bin/node`. Jeżeli instalujesz Node inaczej, wpisz jego absolutną ścieżkę w `supervisor.conf`; Supervisor nie ładuje profilu powłoki ani nvm.

## 2. Użytkownik i pliki

```sh
sudo useradd --system --user-group --home-dir /var/lib/secretsanta --shell /usr/sbin/nologin secretsanta
sudo install -d -o secretsanta -g secretsanta -m 0750 /var/www/secretsanta /var/lib/secretsanta /var/log/secretsanta
```

Prześlij źródła z komputera do katalogu tymczasowego na VPS, np. (podmień login i IP):

```sh
rsync -az --exclude=node_modules --exclude=.next --exclude=.git --exclude=.env --exclude='.env.*' --exclude=generated --exclude='*.db' --exclude='*.db-*' --exclude=test-results --exclude=playwright-report ./ ubuntu@ADRES_VPS:/tmp/secretsanta-upload/
```

Następnie na VPS:

```sh
sudo rsync -a /tmp/secretsanta-upload/ /var/www/secretsanta/
sudo chown -R secretsanta:secretsanta /var/www/secretsanta
sudo cp /var/www/secretsanta/deploy/production.env.example /var/www/secretsanta/.env
sudo chown secretsanta:secretsanta /var/www/secretsanta/.env
sudo chmod 600 /var/www/secretsanta/.env
sudoedit /var/www/secretsanta/.env
```

Uzupełnij domenę, hasło organizatora i dane SMTP. Nie zmieniaj bez potrzeby `DATABASE_URL="file:/var/lib/secretsanta/santa.db"`. `.env` jest czytany przez Next.js i polecenia migracji; nie umieszczaj haseł w pliku Supervisora. Hasła ze znakiem `#` muszą pozostać w cudzysłowie. Nie twórz dodatkowego `.env.local`, żeby nie nadpisywać konfiguracji runtime względem migracji.

## 3. Instalacja i pierwsze uruchomienie

Na VPS, w katalogu projektu:

```sh
cd /var/www/secretsanta
sudo -u secretsanta -H npm ci --include=dev
sudo -u secretsanta -H npm run build
sudo -u secretsanta -H npm run db:deploy
sudo install -m 0644 deploy/supervisor.conf /etc/supervisor/conf.d/secretsanta.conf
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status secretsanta
curl -I http://127.0.0.1:3000
```

Zachowaj zależności developerskie na serwerze: Prisma CLI jest potrzebne do migracji, a TypeScript i Tailwind do kolejnych buildów. Moduły instaluj na VPS, nie kopiuj `node_modules` z macOS. Migracje wykonujemy podczas wdrożenia, nie przy każdym automatycznym restarcie procesu. Supervisor uruchamia bezpośrednio Node, wznawia aplikację po awarii i pozwala jej zakończyć pracę po SIGTERM. Uruchamiaj jedną instancję.

## 4. Nginx i HTTPS

```sh
cd /var/www/secretsanta
sudo install -m 0644 deploy/nginx.conf /etc/nginx/sites-available/secretsanta
sudoedit /etc/nginx/sites-available/secretsanta
# Podmień server_name na rzeczywistą domenę.
sudo ln -s /etc/nginx/sites-available/secretsanta /etc/nginx/sites-enabled/secretsanta
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d santa.example.com --redirect
sudo certbot renew --dry-run
```

Sprawdź publiczny adres HTTPS i upewnij się, że `APP_URL` wskazuje dokładnie tę samą domenę z HTTPS. Certbot dostosuje konfigurację Nginx i skonfiguruje odnowienia certyfikatu (sprawdź `systemctl list-timers` na swoim systemie). Produkcyjne ciasteczka wymagają HTTPS. Zachowany nagłówek Host pozwala poprawnie działać Server Actions. Nginx nie buforuje odpowiedzi ani nie zapisuje standardowego access logu dla prywatnych linków; logi błędów nadal mogą zawierać adresy przy awariach, dlatego traktuj je jako prywatne.

## 5. Aktualizacje

Zaplanowana krótka przerwa chroni działający proces przed nadpisaniem plików buildu. Prześlij nowe źródła do `/tmp/secretsanta-upload/` jak w kroku 2, a następnie na VPS:

```sh
sudo supervisorctl stop secretsanta
sudo install -d -o secretsanta -g secretsanta -m 0700 /var/lib/secretsanta/backups
sudo -u secretsanta sqlite3 /var/lib/secretsanta/santa.db ".backup '/var/lib/secretsanta/backups/before-update.db'"
sudo chmod 600 /var/lib/secretsanta/backups/before-update.db
sudo rsync -a --exclude=.env --exclude='.env.*' --exclude=node_modules --exclude=.next --exclude=generated /tmp/secretsanta-upload/ /var/www/secretsanta/
sudo chown -R secretsanta:secretsanta /var/www/secretsanta
cd /var/www/secretsanta
sudo -u secretsanta -H npm ci --include=dev
sudo -u secretsanta -H npm run build
sudo -u secretsanta -H npm run db:deploy
sudo supervisorctl start secretsanta
sudo supervisorctl status secretsanta
curl -I https://santa.example.com
```

Wykonuj polecenia kolejno i przerwij po błędzie. W razie nieudanego buildu przywróć poprzedni kod i zbuduj go przed startem. Kopia `before-update.db` jest nadpisywana przy kolejnej aktualizacji — zachowaj dodatkowe datowane kopie poza VPS. Po migracji nie cofaj samego kodu bez sprawdzenia zgodności schematu; przywrócenie starszej bazy wymaga zatrzymania procesu i oznacza utratę nowszych zapisów.

## Obsługa

```sh
sudo supervisorctl status secretsanta
sudo supervisorctl restart secretsanta
sudo supervisorctl tail -f secretsanta
sudo tail -n 100 /var/log/secretsanta/app.log
sudo nginx -t
```

Supervisor rotuje log aplikacji (10 MB, 5 kopii). Po zmianie `.env` wystarczy restart procesu. Po zmianie konfiguracji Supervisora wykonaj `sudo supervisorctl reread` i `sudo supervisorctl update`.

Brak maili: sprawdź SMTP i przycisk „Ponów wysyłkę” w panelu organizatora. Błąd 502: sprawdź status procesu, build, uprawnienia do `/var/lib/secretsanta` i log aplikacji. Błąd Server Actions za proxy: sprawdź domenę w przeglądarce, `APP_URL` i nagłówki Host. Wysyłka po SMTP zwykle używa portu 587 lub 465; zweryfikuj dostępność wyjściowego portu u dostawcy SMTP i VPS.

Referencja opcji: [dokumentacja konfiguracji Supervisor](https://supervisord.org/configuration.html#program-x-section-settings).
