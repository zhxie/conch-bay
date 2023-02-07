import json
import os
import subprocess
import sys
import tempfile
import zipfile


def main():
    if len(sys.argv) <= 2:
        print(
            f'Please specify cblite tool and the IKAX3 database with "python3 {sys.argv[0]} <PATH_TO_CBLITE_TOOL> <PATH_TO_IKAX3>".'
        )
        return

    dir = tempfile.mkdtemp()
    with zipfile.ZipFile(sys.argv[2], "r") as f:
        f.extractall(dir)
    id = next((id for id in os.listdir(dir) if id != "account.json"), None)

    count = 0
    battles = []
    coops = []

    out = subprocess.run(
        [sys.argv[1], "cat", "--raw", f"{dir}/{id}/vsResult.cblite2", "*"],
        capture_output=True,
    )
    for line in out.stdout.splitlines():
        count = count + 1
        battles.append({"vsHistoryDetail": json.loads(line.decode("utf-8"))})

    out = subprocess.run(
        [sys.argv[1], "cat", "--raw", f"{dir}/{id}/coopResult.cblite2", "*"],
        capture_output=True,
    )
    for line in out.stdout.splitlines():
        count = count + 1
        coops.append({"coopHistoryDetail": json.loads(line.decode("utf-8"))})

    results = {"battles": battles, "coops": coops}
    with open("conch-bay-import.json", "w") as f:
        json.dump(results, f, ensure_ascii=False)
    print(f'Export {count} results to "conch-bay-import.json".')


if __name__ == "__main__":
    main()
