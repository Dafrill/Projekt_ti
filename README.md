# Ogłoszenia Miasteczkowe

Platforma ogłoszeniowa dla mieszkańców Miasteczka AGH. Użytkownicy mogą dodawać ogłoszenia, wymieniać wiadomości, reagować i komentować.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: ASP.NET Core 10.0 Web API + Entity Framework Core
- **Baza danych**: PostgreSQL (baza `local_marketplace_db`, user `postgres`)
- **Auth**: JWT Bearer tokens
- **Hasło bazy**: `haslo`

## Uruchomienie

### 1. Baza danych

Włącz PostgreSQL (jeśli nie jest uruchomiony):

```bash
./postgres.sh
```

### 2. Backend

```bash
cd projekt_ti/LocalMarketplace/LocalMarketplace
dotnet run
```

Backend uruchamia się na `http://localhost:5016`.

### 3. Frontend

```bash
npm run dev
```

Frontend uruchamia się na `http://localhost:5173` — requesty do `/api` i `/uploads` są proxyowane do backendu.

## Konta

| Email | Hasło | Rola |
|---|---|---|
| `admin@admin.pl` | `admin` | Admin |
| `jan@test.pl` | `test123` | Student |
| `ola@test.pl` | `test123` | Student |

## Funkcjonalności

- **Ogłoszenia** — dodawanie, edycja, usuwanie, kategorie, lokalizacje, zdjęcia
- **Filtry** — wyszukiwanie, kategoria, lokalizacja, ulubione, moje ogłoszenia
- **Reakcje** — 👍 ❤️ 😂 😮 😢 (admin może dodawać wielokrotnie)
- **Komentarze** — z odpowiedziami (usuwanie przez autora lub admina)
- **Czat** — prywatne wiadomości między użytkownikami przy ogłoszeniach
- **Ulubione** — zapisywanie ogłoszeń
- **Panel admina** — banowanie/usuwanie użytkowników, podgląd ogłoszeń
- **Moderacja** — ogłoszenia wymagają zatwierdzenia przez admina
