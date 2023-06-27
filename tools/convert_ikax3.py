import json
import os
import stat
import subprocess
import sys
import tempfile
import urllib.request
import zipfile


def main():
    if len(sys.argv) <= 1:
        print(
            f'Please specify cblite tool and the IKAX3 database with "python3 {sys.argv[0]} <PATH_TO_IKAX3>".'
        )
        return

    agree = input(
        "You have to agree Couchbase Enterprise License (https://www.couchbase.com/ESLA01162020) before converting [Y/N]: "
    ).strip()
    if agree != "Y" and agree != "y":
        return

    dir = tempfile.mkdtemp()
    download = ""
    bin = ""
    if sys.platform == "linux" or sys.platform == "linux2":
        download = "linux"
        bin = "bin/cblite"
    elif sys.platform == "darwin":
        download = "macos"
        bin = "bin/cblite"
    elif sys.platform == "windows":
        download = "windows"
        bin = "cblite.exe"
    else:
        print(f'cblite does not support OS "{sys.platform}".')
        return
    urllib.request.urlretrieve(
        f"https://github.com/couchbaselabs/couchbase-mobile-tools/releases/download/cblite-3.0.0EE-alpha/{download}-x86_64.zip",
        f"{dir}/cblite.zip",
    )
    with zipfile.ZipFile(f"{dir}/cblite.zip", "r") as f:
        f.extractall(dir)
    st = os.stat(f"{dir}/{bin}")
    os.chmod(f"{dir}/{bin}", st.st_mode | stat.S_IEXEC)

    with zipfile.ZipFile(sys.argv[1], "r") as f:
        f.extractall(dir)
    id = ""
    with open(f"{dir}/account.json", "r", encoding="utf-8") as f:
        id = json.load(f)["id"]

    count = 0
    battles = []
    coops = []

    out = subprocess.run(
        [f"{dir}/{bin}", "cat", "--raw", f"{dir}/{id}/vsResult.cblite2", "*"],
        capture_output=True,
    )
    for line in out.stdout.splitlines():
        count = count + 1
        battles.append({"vsHistoryDetail": json.loads(line.decode("utf-8"))})

    out = subprocess.run(
        [f"{dir}/{bin}", "cat", "--raw", f"{dir}/{id}/coopResult.cblite2", "*"],
        capture_output=True,
    )
    for line in out.stdout.splitlines():
        count = count + 1
        coops.append({"coopHistoryDetail": json.loads(line.decode("utf-8"))})

    results = {"battles": battles, "coops": coops}
    with open("conch-bay-import.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False)
    print(f'Export {count} results to "conch-bay-import.json".')


if __name__ == "__main__":
    main()
