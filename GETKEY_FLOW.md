# Ghi chu lai cach hoat dong cua getkey trong project

## 1. Tong quan nhanh

Project nay co **2 luong lien quan den getkey**:

1. **Luong duoc viet san trong `TechnicalAkash1.java`**
   - Hien hop thoai nhap key
   - Goi JNI `Check(...)` de xac thuc key
   - Neu hop le thi luu `USER_KEY` va start `Launcher`

2. **Luong dang duoc goi truc tiep khi app mo**
   - `MainActivity` -> `Main.Start(...)`
   - `Main.Start(...)` goi native `CheckOverlayPermission(...)`
   - Native nay dang `startService(Launcher)` ngay sau khi co quyen overlay

Quan trong: o code hien tai, minh **khong tim thay cho nao goi `TechnicalAkash1.Init(...)`**. Nghia la phan getkey da duoc code day du, nhung luong mo app hien tai co the dang bo qua buoc nhap/check key.

## 2. Diem vao cua app

### `MainActivity.java`

- `onCreate()` chi goi:
  - `Main.Start(this);`

### `Main.java`

- `Start(Context context)`:
  - khoi tao crash handler
  - goi native `CheckOverlayPermission(context)`

### `Menu/Setup.h`

- `CheckOverlayPermission(...)`:
  - kiem tra quyen overlay
  - neu chua co quyen thi mo man hinh xin quyen
  - neu da co quyen thi goi `startService(...)`
  - `startService(...)` tao `Intent` den `com.android.support.Launcher`

=> Theo luong dang chay thuc te, app vao thang `Launcher` va menu co the duoc mo ma khong can qua `TechnicalAkash1.Init(...)`.

## 3. Luong getkey duoc viet trong `TechnicalAkash1.java`

File nay moi la noi chua logic getkey/xac thuc key day du.

### 3.1. Khoi tao

- `static { System.loadLibrary("MyLibName"); }`
- `Init(Object object)`:
  - ep `object` thanh `Context` va `Activity`
  - neu Android >= 23 thi check quyen overlay
  - lay `SharedPreferences` theo package name

### 3.2. Neu chua co key da luu

Neu `m_Prefs` **khong chua** key `USER_KEY`:

- Tao `AlertDialog`
- Tao `EditText` de nguoi dung nhap key
- Nut:
  - `VAO GAME`
    - doc noi dung tu `input`
    - goi `Login(m_Context, userKey)`
  - `LAY KEY FREE`
    - mo URL `https://web1s.asia/Keyallsever`
  - `CACH LAY KEY`
    - mo URL `https://t.me/ytbduymmo`

### 3.3. Neu da co key da luu

Neu `SharedPreferences` da co `USER_KEY`:

- goi thang:
  - `Login(m_Context, m_Prefs.getString("USER_KEY", null));`

## 4. Ham `Login(...)` hoat dong ra sao

`Login(Context m_Context, String userKey)`:

1. Hien `ProgressDialog` voi noi dung dang kiem tra.
2. Tao `Handler` de nhan ket qua tra ve tren UI thread.
3. Tao `Thread` nen.
4. Trong thread:
   - goi native:
     - `String result = Check(m_Context, userKey);`
   - neu `result.equals("OK")`
     - gui message `what = 0`
   - nguoc lai
     - gui message `what = 1`
     - `obj = result`

### 4.1. Neu key hop le

Khi `msg.what == 0`:

- luu key:
  - `m_Prefs.edit().putString("USER_KEY", userKey).apply();`
- tao `Intent` toi `Launcher.class`
- goi:
  - `m_Context.startService(i);`

=> Day la buoc menu duoc mo sau khi key hop le.

### 4.2. Neu key khong hop le

Khi `msg.what == 1`:

- hien `AlertDialog` thong bao key het han / loi
- noi dung loi la chuoi tra ve tu native
- nut:
  - `OK`
    - `clear()` SharedPreferences
    - `finish()` Activity
  - `LAY KEY MOI`
    - mo `https://web1s.asia/Keyallsever`
  - `NHOM TELE`
    - mo `https://t.me/ytbduymmo`

## 5. Native `Check(...)` trong `Main.cpp`

Ham JNI:

- `Java_com_android_support_TechnicalAkash1_Check(JNIEnv *env, jclass clazz, jobject mContext, jstring mUserKey)`

Day la noi xac thuc key that su.

### 5.1. Lay `userKey`

- Dung:
  - `env->GetStringUTFChars(mUserKey, 0);`

### 5.2. Tao fingerprint may

Code tao chuoi `hwid` theo thu tu:

1. `userKey`
2. `GetAndroidID(env, mContext)`
3. `GetDeviceModel(env)`
4. `GetDeviceBrand(env)`

Sau do:

- `UUID = GetDeviceUniqueIdentifier(env, hwid.c_str());`

### 5.3. Cac helper dung de tao dinh danh

Trong `LicenseTools.h`:

- `GetAndroidID(...)`
  - doc `Settings.Secure.ANDROID_ID`
- `GetDeviceModel(...)`
  - doc `Build.MODEL`
- `GetDeviceBrand(...)`
  - doc `Build.BRAND`
- `GetDeviceUniqueIdentifier(...)`
  - bien chuoi dau vao thanh byte array
  - goi `UUID.nameUUIDFromBytes(...)`
  - doi sang string bang `toString()`

=> Nghia la dinh danh may khong chi dua vao thiet bi, ma con bi tron ca `userKey`.

## 6. Request mang de check key

Sau khi co `UUID`, native dung `libcurl` de gui request.

### 6.1. Cau hinh request

- Method: `POST`
- URL: `duymmo.io.vn/connect`
- Default protocol: `https`
- Header:
  - `Content-Type: application/x-www-form-urlencoded`

### 6.2. Du lieu gui di

Native format body theo mau:

- `game=PUBG&user_key=%s&serial=%s`

Gia tri thuc te:

- `user_key = userKey`
- `serial = UUID`

=> Server nhan duoc 3 thong tin chinh:

1. game = `PUBG`
2. key nguoi dung nhap
3. serial/UUID duoc sinh tu key + thong tin may

### 6.3. Nhan response

- `WriteMemoryCallback(...)` trong `LicenseTools.h`
  - cap phat lai bo dem bang `realloc`
  - ghi toan bo response vao `chunk.memory`

## 7. Parse response va dieu kien hop le

Native parse JSON bang `nlohmann::ordered_json`.

### 7.1. Dieu kien dau tien

Neu:

- `result["status"] == true`

thi doc tiep:

- `token = result["data"]["token"]`
- `rng = result["data"]["rng"]`
- `EXP = result["data"]["EXP"]`

### 7.2. Check thoi gian song cua response

Code yeu cau:

- `if (rng + 30 > time(0))`

=> Response chi duoc chap nhan neu gia tri `rng` cua server chua qua 30 giay so voi thoi diem hien tai.

### 7.3. Tao auth o phia client

Native ghep chuoi:

- `"PUBG" + "-" + userKey + "-" + UUID + "-" + "Vm8Lk7Uj2JmsjCPVPVjrLa7zgfx3uz9E"`

Sau do:

- `outputAuth = CalcMD5(auth)`

Roi:

- `g_Token = token`
- `g_Auth = outputAuth`
- `bValid = (g_Token == g_Auth)`

=> Key chi duoc xem la hop le neu token server tra ve bang dung chuoi MD5 do client tu tinh.

## 8. Neu hop le thi xay ra gi

Neu `bValid == true`:

- native tao them 1 `pthread` nua chay `hack_thread`

Sau do ham JNI tra ve:

- `"OK"`

Ben Java:

- `Login(...)` nhan `"OK"`
- luu `USER_KEY`
- start `Launcher`

## 9. Neu khong hop le thi xay ra gi

Ham JNI se tra ve chuoi loi:

### Truong hop A: server tra `status == false`

- `errMsg = result["reason"]`

### Truong hop B: loi parse JSON

- `errMsg` se gom:
  - exception message
  - noi dung response raw

### Truong hop C: loi curl

- `errMsg = curl_easy_strerror(res)`

Sau cung:

- neu `bValid` true -> tra `"OK"`
- nguoc lai -> tra `errMsg`

## 10. Bien `EXP` va ham `Time()`

Trong native:

- co bien global `static std::string EXP;`
- khi check key thanh cong, `EXP` duoc gan tu:
  - `result["data"]["EXP"]`

Ham:

- `Java_com_android_support_TechnicalAkash1_Time(...)`

chi lam:

- `Date += EXP.c_str();`
- `return Date`

Luu y:

1. `Time()` khong tu di check key.
2. Neu chua check key thanh cong thi `EXP` co the rong.
3. `Date += EXP` la noi chuoi lien tuc, nen neu goi `Time()` nhieu lan thi gia tri co the bi lap lai.

Trong `Menu.java`, subtitle dang dung:

- `TechnicalAkash1.Time()`

=> Subtitle "Thoi gian con lai" phu thuoc truc tiep vao bien `EXP` duoc nap trong luc `Check(...)`.

## 11. Van de logic can ghi nho

Day la phan quan trong nhat khi doc project nay:

### 11.1. Luong getkey da ton tai day du

`TechnicalAkash1.java` + JNI `Check(...)` da tao thanh mot he thong xac thuc key hoan chinh.

### 11.2. Nhung luong entry hien tai khong goi no

Tu nhung gi minh tim thay:

- `MainActivity` chi goi `Main.Start(this)`
- `Main.Start(...)` chi goi native `CheckOverlayPermission(...)`
- `CheckOverlayPermission(...)` lai `startService(Launcher)` truc tiep

Minh **khong tim thay**:

- `TechnicalAkash1.Init(...)` duoc goi tu `MainActivity`
- native goi nguoc sang `TechnicalAkash1.Init(...)`
- hay mot cho nao khac kich hoat dialog nhap key

=> Co kha nang:

1. luong getkey la code cu dang bi bo do
2. hoac project dang thieu mot buoc noi luong
3. hoac nguoi tao da sua de bo qua check key nhung chua xoa code cu

## 12. Tom tat ngan gon

Neu chi xet rieng **co che getkey** thi no hoat dong nhu sau:

1. Nguoi dung nhap key trong `TechnicalAkash1`.
2. Java goi native `Check(context, userKey)`.
3. Native tao `UUID` tu `userKey + android_id + model + brand`.
4. Native gui `POST https://duymmo.io.vn/connect`.
5. Body: `game=PUBG&user_key=<key>&serial=<UUID>`.
6. Native doc JSON tra ve: `status`, `data.token`, `data.rng`, `data.EXP`.
7. Native tu tinh `MD5("PUBG-userKey-UUID-secret")`.
8. Neu MD5 nay trung `token` va `rng` con han thi tra `"OK"`.
9. Java luu `USER_KEY` va start `Launcher`.

Neu xet theo **luong app dang mo thuc te**, thi hien tai service `Launcher` dang duoc start truc tiep tu `CheckOverlayPermission(...)`, nen getkey co ve chua duoc noi vao entrypoint hien tai.

## 13. File/chuc nang lien quan

- `app/src/main/java/com/android/support/MainActivity.java`
  - diem vao app
- `app/src/main/java/com/android/support/Main.java`
  - goi native check overlay
- `app/src/main/jni/Menu/Setup.h`
  - `CheckOverlayPermission(...)`, `startService(...)`
- `app/src/main/java/com/android/support/TechnicalAkash1.java`
  - dialog nhap key, luu key, goi native check
- `app/src/main/jni/Main.cpp`
  - `TechnicalAkash1_Check(...)`, `Time()`
- `app/src/main/jni/LicenseTools.h`
  - lay thong tin may, callback nhan du lieu HTTP
- `app/src/main/java/com/android/support/Launcher.java`
  - service tao menu sau khi duoc start

