# Simple License Key Web

Web app full-stack toi gian de quan ly license key cho file Python desktop/script va flow Android get key.

## Kien truc ngan gon

- `Next.js App Router` lam ca UI admin va API.
- `Prisma + Postgres` luu admin va license.
- `Cookie httpOnly + JWT` giu session admin.
- `POST /api/verify` nhan `license_key` va `machine_code`, tu bind o lan verify dau tien.
- `POST /connect` va `POST /api/connect` tuong thich flow Android get key, nhan `game`, `user_key`, `serial` dang `application/x-www-form-urlencoded`.
- `POST /api/admin/login` chi dang nhap, khong tu tao admin.

## Cau truc thu muc

```text
.
|-- app/
|   |-- admin/licenses/page.tsx
|   |-- api/
|   |   |-- admin/
|   |   |   |-- login/route.ts
|   |   |   |-- logout/route.ts
|   |   |   `-- licenses/
|   |   |      |-- route.ts
|   |   |      `-- [id]/
|   |   |         |-- route.ts
|   |   |         |-- toggle/route.ts
|   |   |         `-- clear-binding/route.ts
|   |   `-- verify/route.ts
|   |-- connect/route.ts
|   |-- login/page.tsx
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   |-- license-dashboard.tsx
|   `-- login-form.tsx
|-- lib/
|   |-- admin.ts
|   |-- auth.ts
|   |-- env.ts
|   |-- license-verification.ts
|   |-- licenses.ts
|   |-- prisma.ts
|   `-- validators.ts
|-- prisma/
|   |-- migrations/
|   |-- schema.prisma
|   `-- seed-admin.ts
|-- proxy.ts
`-- package.json
```

## Cai dat

```bash
npm install
```

Tao file `.env` roi dien:

```env
DATABASE_URL="your-postgres-url"
JWT_SECRET="your-long-random-secret"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-password"
GETKEY_GAME="PUBG"
GETKEY_SECRET="Vm8Lk7Uj2JmsjCPVPVjrLa7zgfx3uz9E"
```

`GETKEY_SECRET` phai giong secret hardcode trong native Android neu ban muon token validate dung.

## Flow dung de setup va deploy

1. Set env.
2. Chay migrate.
3. Chay seed admin.
4. Deploy va dang nhap.

Local:

```bash
npm run prisma:migrate
npm run seed-admin
npm run dev
```

Production:

```bash
npm run prisma:deploy
npm run seed-admin
```

## Chay local

```bash
npm run dev
```

Mo:

- `http://localhost:3000/login`
- `http://localhost:3000/admin/licenses`

## API verify

Request:

```http
POST /api/verify
Content-Type: application/json
```

```json
{
  "license_key": "KEY-ABC-123",
  "machine_code": "32charsmachinecode"
}
```

Response mau:

```json
{
  "valid": true,
  "message": "License hop le",
  "expires_at": null,
  "bound": true
}
```

## API get key Android

Request:

```http
POST /connect
hoac
POST /api/connect
Content-Type: application/x-www-form-urlencoded
```

```text
game=PUBG&user_key=KEY-ABC-123&serial=generated-device-uuid
```

Response thanh cong:

```json
{
  "status": true,
  "data": {
    "token": "md5(game-user_key-serial-secret)",
    "rng": 1711711711,
    "EXP": "2026-12-31T23:59:59.000Z"
  }
}
```

Response loi:

```json
{
  "status": false,
  "reason": "Key da het han"
}
```
