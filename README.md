# Simple License Key Web

Web app full-stack toi gian de quan ly license key cho file Python desktop/script.

## Kien truc ngan gon

- `Next.js App Router` lam ca UI admin va API.
- `Prisma + Postgres` luu admin va license.
- `Cookie httpOnly + JWT` giu session admin.
- `POST /api/verify` nhan `license_key` va `machine_code`, tu bind o lan verify dau tien.
- `POST /api/admin/login` chi dang nhap, khong tu tao admin.

## Cau truc thu muc

```text
.
├─ app/
│  ├─ admin/licenses/page.tsx
│  ├─ api/
│  │  ├─ admin/
│  │  │  ├─ login/route.ts
│  │  │  ├─ logout/route.ts
│  │  │  └─ licenses/
│  │  │     ├─ route.ts
│  │  │     └─ [id]/
│  │  │        ├─ route.ts
│  │  │        ├─ toggle/route.ts
│  │  │        └─ clear-binding/route.ts
│  │  └─ verify/route.ts
│  ├─ login/page.tsx
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ license-dashboard.tsx
│  └─ login-form.tsx
├─ lib/
│  ├─ admin.ts
│  ├─ auth.ts
│  ├─ env.ts
│  ├─ licenses.ts
│  ├─ prisma.ts
│  └─ validators.ts
├─ prisma/
│  ├─ migrations/
│  ├─ schema.prisma
│  └─ seed-admin.ts
├─ proxy.ts
├─ package.json
└─ .env.example
```

## Cai dat

```bash
npm install
```

Tao file `.env` tu `.env.example`, roi dien:

```env
DATABASE_URL="your-postgres-url"
JWT_SECRET="your-long-random-secret"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-password"
```

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

Route login khong tu tao admin nua. Neu DB chua co admin, ban phai chay seed truoc.

## Chay local

```bash
npm run dev
```

Mo:

- `http://localhost:3000/login`
- `http://localhost:3000/admin/licenses`

## Deploy Vercel

1. Push source code len GitHub.
2. Import project vao Vercel.
3. Tao Postgres rieng cua ban va lay `DATABASE_URL`.
4. Set cac bien moi truong tren Vercel:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
5. Chay migrate production:

```bash
npm run prisma:deploy
```

6. Chay seed admin:

```bash
npm run seed-admin
```

7. Dang nhap bang `ADMIN_USERNAME` va `ADMIN_PASSWORD`.

## Loi 500 pho bien khi login

- `DATABASE_URL` sai hoac database khong ket noi duoc.
- Database production chua duoc migrate.
- Chua chay `npm run seed-admin`.
- Thieu `JWT_SECRET`.

Khi can debug tren Vercel, xem log cua route `POST /api/admin/login`.

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

## Python client mau

```python
import hashlib
import sys
import uuid

import requests


def get_machine_code():
    mac = uuid.getnode()
    h = hashlib.sha256(str(mac).encode()).hexdigest()
    return h[:32]


def verify_license(api_url, license_key):
    machine_code = get_machine_code()

    try:
        response = requests.post(
            f"{api_url.rstrip('/')}/api/verify",
            json={
                "license_key": license_key,
                "machine_code": machine_code,
            },
            timeout=15,
        )
    except requests.RequestException as exc:
        print(f"Khong the ket noi server license: {exc}")
        sys.exit()

    try:
        data = response.json()
    except ValueError:
        print("Server tra ve du lieu khong hop le")
        sys.exit()

    if not response.ok or not data.get("valid"):
        print(data.get("message", "Xac minh license that bai"))
        sys.exit()

    print("Key kha dung. Bat dau chay tool...")
    return True


if __name__ == "__main__":
    API_URL = "https://your-domain.vercel.app"
    license_key = input("Nhap license key: ").strip()
    verify_license(API_URL, license_key)
    print("Tool dang chay...")
```
