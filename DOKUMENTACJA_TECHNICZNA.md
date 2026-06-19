# Dokumentacja Techniczna — Ogłoszenia Miasteczkowe (msAGH)

## 1. Architektura rozwiązania

### 1.1 Overview

Aplikacja składa się z trzech warstw:

- **Frontend** — React 19 + Vite + Tailwind CSS (SPA)
- **Backend** — ASP.NET Core 10.0 Web API z Entity Framework Core
- **Baza danych** — PostgreSQL

Komunikacja: Frontend ← HTTP/JSON → Backend (REST API) ← EF Core → PostgreSQL

### 1.2 Diagram architektury

```
Przeglądarka (SPA)
     │
     │ Vite dev server (localhost:5173)
     │ proxy /api → localhost:5016
     │ proxy /uploads → localhost:5016
     ▼
Backend ASP.NET Core (localhost:5016)
     │
     │ Controllers (REST API)
     │   ├── AuthController
     │   ├── AdvertisementsController
     │   ├── CommentsController
     │   ├── FavoritesController
     │   ├── ReactionsController
     │   ├── MessagesController
     │   ├── ImagesController
     │   └── AdminController
     │
     │ Models (Entity Framework)
     │   ├── User
     │   ├── Advertisement
     │   ├── Comment
     │   ├── Favorite
     │   ├── Reaction
     │   └── Message
     │
     │ DataContext (DbContext + Migrations)
     │
     ▼
PostgreSQL (local_marketplace_db)
```

### 1.3 Uruchomienie projektu

1. **Baza danych**: `./postgres.sh` (włącza PostgreSQL)
2. **Backend**: `cd projekt_ti/LocalMarketplace/LocalMarketplace && dotnet run` (port 5016)
3. **Frontend**: `npm run dev` (port 5173)

---

## 2. Baza danych — PostgreSQL

### 2.1 Connection string

```
Host=localhost;Database=local_marketplace_db;Username=postgres;Password=haslo
```

Plik konfiguracji: `appsettings.json:3`

### 2.2 Schemat tabel

#### Tabela: `Users`

| Kolumna | Typ | Nullable | Domyślne | Opis |
|---|---|---|---|---|
| Id | integer | NO | — | Klucz główny |
| Email | text | NO | — | Adres e-mail (unikalny) |
| PasswordHash | text | NO | — | Hash hasła (BCrypt) |
| Role | text | NO | 'Student' | 'Admin' lub 'Student' |
| Nickname | text | NO | '' | Wyświetlana nazwa |
| AvatarUrl | text | YES | null | Ścieżka do zdjęcia profilowego |
| IsBanned | boolean | NO | false | Czy konto zablokowane |

#### Tabela: `Advertisements`

| Kolumna | Typ | Nullable | Domyślne | Opis |
|---|---|---|---|---|
| Id | integer | NO | — | Klucz główny |
| Title | text | NO | — | Tytuł ogłoszenia |
| Description | text | NO | — | Treść ogłoszenia |
| Price | numeric | NO | — | Cena (0 dla ogłoszeń bezpłatnych) |
| Category | text | NO | — | Kategoria (Nauka, Meble, Elektronika, Usługi, Pytania i odpowiedzi, Zgubione/Znalezione) |
| Location | text | NO | — | Akademik (np. Ds Babilon, Ds Olimp) |
| ImageUrl | text | NO | — | Ścieżka do zdjęcia |
| IsApproved | boolean | NO | false | Czy zatwierdzone przez admina |
| UserId | integer | NO | — | FK → Users.Id |
| CreatedAt | timestamptz | NO | -infinity | Data utworzenia |

Klucz obcy: `UserId` → `Users.Id`

#### Tabela: `Comments`

| Kolumna | Typ | Nullable | Domyślne | Opis |
|---|---|---|---|---|
| Id | integer | NO | — | Klucz główny |
| Content | text | NO | — | Treść komentarza |
| AdvertisementId | integer | NO | — | FK → Advertisements.Id |
| UserId | integer | NO | — | FK → Users.Id |
| ParentCommentId | integer | YES | null | FK → Comments.Id (odpowiedzi) |
| CreatedAt | timestamptz | NO | — | Data dodania |

#### Tabela: `Favorites`

| Kolumna | Typ | Nullable | Domyślne | Opis |
|---|---|---|---|---|
| Id | integer | NO | — | Klucz główny |
| UserId | integer | NO | — | FK → Users.Id |
| AdvertisementId | integer | NO | — | FK → Advertisements.Id |

Klucz obcy: `AdvertisementId` → `Advertisements.Id`

#### Tabela: `Reactions`

| Kolumna | Typ | Nullable | Domyślne | Opis |
|---|---|---|---|---|
| Id | integer | NO | — | Klucz główny |
| AdvertisementId | integer | NO | — | FK → Advertisements.Id |
| UserId | integer | NO | — | FK → Users.Id |
| Emoji | text | NO | — | Emoji reakcji (👍❤️😂😮😢) |

#### Tabela: `Messages`

| Kolumna | Typ | Nullable | Domyślne | Opis |
|---|---|---|---|---|
| Id | integer | NO | — | Klucz główny |
| SenderId | integer | NO | — | FK → Users.Id (nadawca) |
| ReceiverId | integer | NO | — | FK → Users.Id (odbiorca) |
| AdvertisementId | integer | NO | — | FK → Advertisements.Id |
| Content | text | NO | — | Treść wiadomości |
| ImageUrl | text | YES | null | Opcjonalne zdjęcie |
| SentAt | timestamptz | NO | — | Data wysłania |

#### Tabela: `__EFMigrationsHistory`

Tabela migracji Entity Framework Core.

### 2.3 Relacje między tabelami

```
Users (1) ──< Advertisements (N)    — użytkownik może mieć wiele ogłoszeń
Users (1) ──< Comments (N)          — użytkownik może mieć wiele komentarzy
Users (1) ──< Favorites (N)         — użytkownik może mieć wiele ulubionych
Users (1) ──< Reactions (N)         — użytkownik może mieć wiele reakcji
Users (1) ──< Messages (N)          — użytkownik może wysyłać/odbierać wiadomości

Advertisements (1) ──< Comments (N)     — ogłoszenie może mieć wiele komentarzy
Advertisements (1) ──< Favorites (N)    — ogłoszenie może być ulubione przez wielu
Advertisements (1) ──< Reactions (N)    — ogłoszenie może mieć wiele reakcji
Advertisements (1) ──< Messages (N)     — ogłoszenie może mieć wiele wiadomości

Comments (1) ──< Comments (N) — ParentCommentId (odpowiedzi na komentarze)
```

---

## 3. Backend — ASP.NET Core 10.0

### 3.1 Technologie i pakiety (NuGet)

| Pakiet | Wersja | Zastosowanie |
|---|---|---|
| BCrypt.Net-Next | 4.2.0 | Haszowanie haseł |
| Microsoft.AspNetCore.Authentication.JwtBearer | 10.0.9 | Autoryzacja JWT |
| Microsoft.AspNetCore.OpenApi | 10.0.9 | OpenAPI/Swagger |
| Microsoft.EntityFrameworkCore.Tools | 10.0.9 | Migracje EF |
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.2 | Provider PostgreSQL dla EF |
| Scalar.AspNetCore | 2.16.4 | Interaktywna dokumentacja API (Scalar) |

### 3.2 Struktura katalogów backendu

```
projekt_ti/LocalMarketplace/LocalMarketplace/
├── Controllers/
│   ├── AdminController.cs          — Panel administracyjny
│   ├── AdvertisementsController.cs — CRUD ogłoszeń
│   ├── AuthController.cs           — Rejestracja, logowanie, profil
│   ├── CommentsController.cs       — Komentarze
│   ├── FavoritesController.cs      — Ulubione
│   ├── ImagesController.cs         — Upload zdjęć
│   ├── MessagesController.cs       — Czat / wiadomości
│   └── ReactionsController.cs      — Reakcje (emoji)
├── Data/
│   └── DataContext.cs              — DbContext EF
├── DTOs/
│   ├── UpdateProfileDto.cs         — DTO edycji profilu
│   └── UserDto.cs                  — DTO logowania/rejestracji
├── Migrations/                     — Migracje EF (9 plików)
├── Models/
│   ├── Advertisement.cs            — Model ogłoszenia
│   ├── Comment.cs                  — Model komentarza
│   ├── Favorite.cs                 — Model ulubionych
│   ├── Models.cs                   — Model Message
│   ├── Reaction.cs                 — Model reakcji
│   └── User.cs                     — Model użytkownika
├── Program.cs                      — Entry point, konfiguracja
├── appsettings.json                — Konfiguracja bazy i JWT
└── appsettings.Development.json
```

### 3.3 Program.cs — konfiguracja aplikacji

- **JWT Authentication** — token symetryczny HMAC-SHA256, issuer + audience nie walidowane
- **CORS** — `AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()`
- **PostgreSQL** — `UseNpgsql(connectionString)`
- **OpenAPI/Scalar** — dostępne w trybie Development
- **Seed admina** — przy starcie tworzy konto `admin@admin.pl` / `admin` (rola Admin)

### 3.4 Modele (Entity Framework)

#### User (`Models/User.cs`)
- `Id`, `Email`, `PasswordHash`, `Role`, `Nickname`, `AvatarUrl`, `IsBanned`
- Rola domyślna: `"Student"`

#### Advertisement (`Models/Advertisement.cs`)
- `Id`, `Title`, `Description`, `Price`, `Category`, `Location`, `ImageUrl`, `IsApproved`, `CreatedAt`
- `UserId` + nawigacja `User`
- `IsApproved` — flaga moderacji (domyślnie `false`)

#### Comment (`Models/Comment.cs`)
- `Id`, `Content`, `AdvertisementId`, `UserId`, `ParentCommentId` (nullable — odpowiedzi), `CreatedAt`

#### Favorite (`Models/Favorite.cs`)
- `Id`, `UserId`, `AdvertisementId` + nawigacja `Advertisement`

#### Reaction (`Models/Reaction.cs`)
- `Id`, `AdvertisementId`, `UserId`, `Emoji`

#### Message (`Models/Models.cs`)
- `Id`, `SenderId`, `ReceiverId`, `AdvertisementId`, `Content`, `ImageUrl` (nullable), `SentAt`

### 3.5 Endpointy API

#### AuthController — `/api/auth`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| POST | /api/auth/register | — | Rejestracja użytkownika |
| POST | /api/auth/login | — | Logowanie, zwraca token JWT |
| GET | /api/auth/profile | JWT | Pobranie profilu zalogowanego |
| PUT | /api/auth/profile | JWT | Edycja profilu (nick, avatar) |

#### AdvertisementsController — `/api/advertisements`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| GET | /api/advertisements | — | Lista ogłoszeń (z filtrami: search, category, location, myOnly) |
| GET | /api/advertisements/{id} | — | Szczegóły ogłoszenia |
| POST | /api/advertisements | JWT | Dodanie ogłoszenia |
| PUT | /api/advertisements/{id} | JWT | Edycja (tylko własne) |
| DELETE | /api/advertisements/{id} | JWT | Usunięcie (właściciel lub admin) |
| GET | /api/advertisements/unapproved | JWT | Ogłoszenia niezatwierdzone (moderacja) |
| PUT | /api/advertisements/{id}/approve | JWT | Zatwierdzenie ogłoszenia przez admina |

#### CommentsController — `/api/comments`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| GET | /api/comments/{advertisementId} | — | Komentarze dla ogłoszenia |
| POST | /api/comments | JWT | Dodanie komentarza/odpowiedzi |
| DELETE | /api/comments/{id} | JWT | Usunięcie (autor lub admin) |

#### FavoritesController — `/api/favorites`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| GET | /api/favorites | JWT | Ulubione ogłoszenia |
| POST | /api/favorites/{advertisementId} | JWT | Dodanie do ulubionych |
| DELETE | /api/favorites/{advertisementId} | JWT | Usunięcie z ulubionych |

#### ReactionsController — `/api/reactions`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| GET | /api/reactions/{advertisementId} | — | Reakcje + reakcja użytkownika |
| POST | /api/reactions | JWT | Dodanie/usunięcie reakcji (toggle) |

#### MessagesController — `/api/messages`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| GET | /api/messages | JWT | Wiadomości użytkownika |
| POST | /api/messages | JWT | Wysłanie wiadomości |

#### ImagesController — `/api/images`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| POST | /api/images/upload | — | Upload zdjęcia (max 10 MB) |

#### AdminController — `/api/admin`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| GET | /api/admin/users | Admin | Lista użytkowników z liczbą ogłoszeń |
| GET | /api/admin/users/{id} | Admin | Szczegóły użytkownika |
| GET | /api/admin/users/{id}/ads | Admin | Ogłoszenia użytkownika |
| PUT | /api/admin/users/{id}/ban | Admin | Zablokowanie użytkownika |
| PUT | /api/admin/users/{id}/unban | Admin | Odblokowanie użytkownika |
| DELETE | /api/admin/users/{id} | Admin | Usunięcie użytkownika z wszystkimi danymi |
| DELETE | /api/admin/comments/{id} | Admin | Usunięcie dowolnego komentarza |

### 3.6 Autoryzacja i bezpieczeństwo

- **JWT** — token ważny 24h, przechowuje: Email, Role, UserId, Nickname, AvatarUrl
- **Hasła** — haszowane BCrypt (algorytm `BCrypt.Net.BCrypt`)
- **Role** — `Admin` i `Student` (sprawdzane przez `[Authorize(Roles = "Admin")]`)
- **Ochrona zasobów** — użytkownik może edytować/usunąć tylko własne ogłoszenia/konta (chyba że jest adminem)
- **Blokada konta** — zbanowani użytkownicy nie mogą dodawać ogłoszeń ani wysyłać wiadomości

---

## 4. Frontend — React 19 + Vite + Tailwind CSS

### 4.1 Technologie

- React 19 + React DOM 19
- Vite 6 (dev server, proxy API, HMR)
- Tailwind CSS 3 (utilities-first CSS)
- PostCSS + Autoprefixer

### 4.2 Struktura katalogów frontendu

```
msAGH/
├── index.html                     — HTML entry point
├── package.json                   — Zależności i skrypty
├── vite.config.js                 — Proxy /api + /uploads → backend
├── tailwind.config.js             — Konfiguracja Tailwind
├── postcss.config.js              — PostCSS config
├── public/                        — Statyczne zasoby
│   └── miasteczko.jpg             — Tło strony logowania
└── src/
    ├── main.jsx                   — Entry point React
    ├── App.jsx                    — Główna aplikacja (SPA)
    ├── api.js                     — Warstwa API (fetch + token)
    └── index.css                  — Importy Tailwind
```

Aplikacja jest SPA (Single Page Application) w jednym pliku `App.jsx` (~1144 linii) — brak routingu zewnętrznego, komponenty zarządzane stanem.

### 4.3 Komponenty React

| Komponent | Opis |
|---|---|
| `App` | Główny komponent, zarządza stanem zalogowania |
| `AuthCard` | Formularz logowania/rejestracji z przełączaniem trybu |
| `Dashboard` | Główny widok po zalogowaniu: nawigacja, lista ogłoszeń, filtry |
| `AdCard` | Karta ogłoszenia: zdjęcie, tytuł, cena, reakcje, przycisk kontaktu/usunięcia |
| `CommentSection` | Sekcja komentarzy pod ogłoszeniem, odpowiedzi (threaded) |
| `ChatPanel` | Panel czatu: lista konwersacji + okno rozmowy z wysyłaniem zdjęć |
| `NewAdModal` | Modal dodawania ogłoszenia (formularz + upload zdjęcia) |
| `EditProfileModal` | Modal edycji profilu (nick, zdjęcie profilowe) |
| `AdminPanel` | Panel admina: lista użytkowników, banowanie, usuwanie, podgląd ogłoszeń |

### 4.4 Warstwa API (`src/api.js`)

- **Base URL**: `/api` (proxy Vite → backend)
- **Autoryzacja**: token JWT w `localStorage`, dołączany jako `Authorization: Bearer <token>`
- **Funkcje pomocnicze**: `getUserId()`, `getToken()`, `request()`
- **Obsługa błędów**: rzuca `Error` z treścią odpowiedzi

Lista funkcji API:

| Funkcja | Endpoint | Opis |
|---|---|---|
| `login(email, password)` | POST /api/auth/login | Logowanie, zapisuje token |
| `register(email, password, nickname)` | POST /api/auth/register | Rejestracja |
| `getAds(params)` | GET /api/advertisements | Lista ogłoszeń z filtrami |
| `getAd(id)` | GET /api/advertisements/{id} | Szczegóły ogłoszenia |
| `createAd(data)` | POST /api/advertisements | Dodanie ogłoszenia |
| `updateAd(id, data)` | PUT /api/advertisements/{id} | Edycja ogłoszenia |
| `deleteAd(id)` | DELETE /api/advertisements/{id} | Usunięcie ogłoszenia |
| `getUnapprovedAds()` | GET /api/advertisements/unapproved | Niezatwierdzone ogłoszenia |
| `approveAd(id)` | PUT /api/advertisements/{id}/approve | Zatwierdzenie ogłoszenia |
| `getFavorites()` | GET /api/favorites | Ulubione użytkownika |
| `addFavorite(adId)` | POST /api/favorites/{adId} | Dodanie do ulubionych |
| `removeFavorite(adId)` | DELETE /api/favorites/{adId} | Usunięcie z ulubionych |
| `getMessages()` | GET /api/messages | Wiadomości użytkownika |
| `sendMessage(data)` | POST /api/messages | Wysłanie wiadomości |
| `uploadImage(file)` | POST /api/images/upload | Upload zdjęcia (FormData) |
| `getReactions(adId)` | GET /api/reactions/{adId} | Reakcje dla ogłoszenia |
| `toggleReaction(adId, emoji)` | POST /api/reactions | Dodanie/usunięcie reakcji |
| `getComments(adId)` | GET /api/comments/{adId} | Komentarze dla ogłoszenia |
| `addComment(data)` | POST /api/comments | Dodanie komentarza |
| `deleteComment(id)` | DELETE /api/comments/{id} | Usunięcie komentarza |
| `updateProfile(data)` | PUT /api/auth/profile | Edycja profilu |
| `getUsers()` | GET /api/admin/users | Lista użytkowników (admin) |
| `banUser(id)` | PUT /api/admin/users/{id}/ban | Zbanowanie (admin) |
| `unbanUser(id)` | PUT /api/admin/users/{id}/unban | Odbanowanie (admin) |
| `deleteUser(id)` | DELETE /api/admin/users/{id} | Usunięcie użytkownika (admin) |
| `getUserAds(id)` | GET /api/admin/users/{id}/ads | Ogłoszenia użytkownika (admin) |
| `logout()` | — | Usunięcie tokenu z localStorage |

### 4.5 Token JWT — struktura payload

```json
{
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "jan@test.pl",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Student",
  "UserId": "2",
  "Nickname": "janek",
  "AvatarUrl": "/uploads/...jpg",
  "exp": 1718730000
}
```

---

## 5. Funkcjonalności

### 5.1 Użytkownicy (niezalogowani)
- Przeglądanie ogłoszeń z filtrami (kategoria, lokalizacja, wyszukiwanie)
- Podgląd reakcji i komentarzy
- Rejestracja i logowanie

### 5.2 Użytkownicy (zalogowani — rola Student)
- Dodawanie, edycja, usuwanie własnych ogłoszeń
- Dodawanie/usuwanie ulubionych
- Reakcje (emoji) na ogłoszenia (toggle — jedno kliknięcie = dodanie, ponowne = usunięcie)
- Komentarze z odpowiedziami (threaded)
- Czat ze sprzedającym (wiadomości tekstowe + zdjęcia)
- Edycja profilu (nick, zdjęcie profilowe)

### 5.3 Administrator (rola Admin)
- Panel admina: lista użytkowników z liczbą ogłoszeń
- Banowanie/odbanowywanie użytkowników
- Usuwanie użytkowników (kaskadowo: ogłoszenia, wiadomości, ulubione, reakcje, komentarze)
- Podgląd ogłoszeń dowolnego użytkownika
- Usuwanie dowolnego komentarza
- Wielokrotne reakcje admina (jedno kliknięcie = dodanie kolejnej)

---

## 6. Konfiguracja

### 6.1 Backend (`appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=local_marketplace_db;Username=postgres;Password=haslo"
  },
  "AppSettings": {
    "Token": "token2026projektshsjfshfjshfyyyyyyyyyyyy"
  }
}
```

### 6.2 Frontend proxy (`vite.config.js`)
```js
server: {
  proxy: {
    '/api':     { target: 'http://localhost:5016', changeOrigin: true },
    '/uploads': { target: 'http://localhost:5016', changeOrigin: true }
  }
}
```

---

## 7. Migracje EF Core

Kolejność migracji (9 plików w `Migrations/`):

1. `20260617162613_InitialCreate` — tabela Users, Advertisements
2. `20260617165115_AddCreatedAtField` — dodanie `CreatedAt` do Advertisements
3. `20260617170717_AddMessagesSystem` — tabela Messages
4. `20260617175224_AddFavoritesTable` — tabela Favorites
5. `20260617200535_AddUserNavProperty` — nawigacja User w Advertisement
6. `20260617201643_AddReactions` — tabela Reactions
7. `20260617203013_AddComments` — tabela Comments
8. `20260617203853_AddNicknameToUser` — kolumna Nickname w Users
9. `20260618145246_AddAvatarUrlToUser` — kolumna AvatarUrl w Users
10. `20260618150032_AddImageUrlToMessage` — kolumna ImageUrl w Messages

---

## 8. Konta testowe

| Email | Hasło | Rola |
|---|---|---|
| admin@admin.pl | admin | Admin |
| jan@test.pl | test123 | Student |
| ola@test.pl | test123 | Student |

---

## 9. Obsługa plików

Zdjęcia przesyłane są na backend, zapisywane w `wwwroot/uploads/` z unikalną nazwą (UUID).
Serwowane przez `app.UseStaticFiles()` pod ścieżką `/uploads/{filename}`.
Maksymalny rozmiar pliku: 10 MB.
