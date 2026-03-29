import os
import subprocess
import sys
import threading
import time
import uuid
import hashlib

import requests


def install_if_missing(module, package=None):
    try:
        __import__(module)
    except ImportError:
        pkg = package if package else module
        print(f"Thieu thu vien '{module}', dang cai dat...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])
        print(f"Da cai {pkg} xong")


install_if_missing("uiautomator2")
install_if_missing("requests")
install_if_missing("adbutils")
install_if_missing("urllib3")

import uiautomator2 as u2


API_URL = os.getenv("LICENSE_API_URL", "https://hheeheheh-u5na.vercel.app")


def get_machine_code():
    mac = uuid.getnode()
    return hashlib.sha256(str(mac).encode()).hexdigest()[:32]


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
        sys.exit(1)

    try:
        data = response.json()
    except ValueError:
        print("Server tra ve du lieu khong hop le")
        sys.exit(1)

    if not response.ok or not data.get("valid"):
        print(data.get("message", "Xac minh license that bai"))
        sys.exit(1)

    print("Key kha dung. Bat dau chay tool...")
    return True


def auth_key():
    print(
        r"""
 ____  __.__                  .__    ________
|    |/ _|  |__ _____    ____ |  |__ \______ \  __ __ ___.__.
|      < |  |  \\__  \  /    \|  |  \ |    |  \|  |  <   |  |
|    |  \|   Y  \/ __ \|   |  \   Y  \|    `   \  |  /\___  |
|____|__ \___|  (____  /___|  /___|  /_______  /____/ / ____|
        \/    \/     \/     \/     \/        \/       \/
"""
    )

    license_key = input("Nhap Auth Key: ").strip()
    if not license_key:
        print("Ban chua nhap key")
        sys.exit(1)

    verify_license(API_URL, license_key)


class Auto:
    def __init__(self, handle):
        self.handle = handle

    def click(self, x, y):
        subprocess.call(
            f"adb -s {self.handle} shell input tap {x} {y}",
            stdout=subprocess.DEVNULL,
            stderr=subprocess.STDOUT,
        )


def get_devices():
    try:
        devices_output = subprocess.check_output("adb devices")
    except subprocess.CalledProcessError:
        return []

    parsed = (
        str(devices_output)
        .replace("b'List of devices attached", "")
        .replace("\\r\\n", "")
        .replace(" ", "")
        .replace("'", "")
        .replace(
            "b*daemonnotrunning.startingitnowonport5037**daemonstartedsuccessfully*Listofdevicesattached",
            "",
        )
    )

    if not parsed:
        return []

    list_devices = parsed.split("\\tdevice")
    list_devices.pop()
    return list_devices


def load_accounts():
    accounts = []
    with open("acc.txt", "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if "|" not in line:
                continue

            parts = line.split("|")
            if len(parts) != 3:
                continue

            accounts.append(
                {
                    "raw": line,
                    "username": parts[0],
                    "password": parts[1],
                    "email": parts[2],
                }
            )
    return accounts


def save_used(raw_line):
    with open("used.txt", "a", encoding="utf-8") as file:
        file.write(raw_line + "\n")


def remove_account(raw_line):
    try:
        with open("acc.txt", "r", encoding="utf-8") as file:
            lines = file.readlines()

        with open("acc.txt", "w", encoding="utf-8") as file:
            for line in lines:
                if line.strip() != raw_line.strip():
                    file.write(line)
    except Exception as exc:
        print(f"Loi khi xoa account: {exc}")


def wait_login_screen(device_client):
    print("Dang cho man hinh LOGIN Garena xuat hien...")

    for _ in range(300):
        if (
            device_client(resourceId="com.garena.gaslite:id/et_identity").exists
            and device_client(resourceId="com.garena.gaslite:id/et_password").exists
        ):
            print("Da phat hien man hinh dang nhap")
            return True
        time.sleep(1)

    print("Khong thay man hinh login sau 5 phut")
    return False


class StartLogin(threading.Thread):
    def __init__(self, device, account):
        super().__init__()
        self.device = device
        self.account = account

    def run(self):
        device = self.device
        account = self.account

        print(
            f"[{device}] Dang login: {account['username']} | "
            f"{account['password']} | {account['email']}"
        )

        device_client = u2.connect(device)
        if not wait_login_screen(device_client):
            return

        try:
            device_client(
                resourceId="com.garena.gaslite:id/et_identity"
            ).clear_text()
            device_client(
                resourceId="com.garena.gaslite:id/et_identity"
            ).click()
            device_client.send_keys(account["username"])

            device_client(
                resourceId="com.garena.gaslite:id/et_password"
            ).clear_text()
            device_client(
                resourceId="com.garena.gaslite:id/et_password"
            ).click()
            device_client.send_keys(account["password"])

            device_client(resourceId="com.garena.gaslite:id/tv_btn_login").click()
            time.sleep(3)
        except Exception as exc:
            print(f"[{device}] ERROR: {exc}")

        save_used(account["raw"])
        remove_account(account["raw"])
        print(f"[{device}] Da luu: {account['raw']}")
        print(f"[{device}] Da xoa khoi acc.txt")


def main():
    auth_key()

    devices = get_devices()
    if not devices:
        print("Khong tim thay thiet bi ADB nao")
        sys.exit(1)

    accounts = load_accounts()
    if not accounts:
        print("Khong co account hop le trong acc.txt")
        sys.exit(1)

    acc_index = 0
    lock = threading.Lock()

    def worker(device):
        nonlocal acc_index

        while True:
            with lock:
                if acc_index >= len(accounts):
                    return
                account = accounts[acc_index]
                acc_index += 1

            run = StartLogin(device, account)
            run.start()
            run.join()

    threads = []
    for device in devices:
        thread = threading.Thread(target=worker, args=(device,))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()


if __name__ == "__main__":
    main()
