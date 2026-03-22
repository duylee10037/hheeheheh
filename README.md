# Simple License Key Web

Web app full-stack tối giản để quản lý license key cho file Python desktop/script.

## Kiến trúc ngắn gọn

- `Next.js App Router` làm cả UI admin và API.
- `Prisma + Postgres` lưu admin và license.
- `Cookie httpOnly + JWT` giữ session admin.
- `POST /api/verify` nhận `license_key` và `machine_code`, tự bind ở lần verify đầu tiên.

## Cấu trúc thư mục

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
│  ├─ auth.ts
│  ├─ env.ts
│  ├─ licenses.ts
│  ├─ prisma.ts
│  └─ validators.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ seed-admin.ts
├─ proxy.ts
├─ package.json
└─ .env.example
```

## Cài đặt

```bash
npm install
```

Tạo file `.env` từ `.env.example`, rồi điền:

```env
DATABASE_URL="your-postgres-url"
JWT_SECRET="your-long-random-secret"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-password"
```

## Migrate và tạo admin

```bash
npm run prisma:migrate
npm run seed-admin
```

## Chạy local

```bash
npm run dev
```

Mở:

- `http://localhost:3000/login`
- `http://localhost:3000/admin/licenses`

## Deploy Vercel

1. Push source code lên GitHub.
2. Import project vào Vercel.
3. Tạo Postgres riêng của bạn, lấy `DATABASE_URL`.
4. Set các biến môi trường trên Vercel:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
5. Sau deploy đầu tiên, chạy migrate:

```bash
npx prisma migrate deploy
npm run seed-admin
```

Bạn có thể chạy 2 lệnh trên bằng local terminal với env production, hoặc tạo một Vercel job/manual command tùy cách deploy của bạn.

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

Response mẫu:

```json
{
  "valid": true,
  "message": "License hợp lệ",
  "expires_at": null,
  "bound": true
}
```

## Python client mẫu

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

    print("Key khả dụng. Bắt đầu chạy tool...")
    return True


if __name__ == "__main__":
    API_URL = "https://your-domain.vercel.app"
    license_key = input("Nhap license key: ").strip()
    verify_license(API_URL, license_key)
    print("Tool dang chay...")
```
