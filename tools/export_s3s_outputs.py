from base64 import b64decode
import json
import os
import sys
import tempfile
import zipfile


def main():
    if len(sys.argv) <= 1:
        print(f'Please specify the results ZIP with "python3 {sys.argv[0]} <PATH>".')
        return

    if not os.path.exists("exports"):
        os.mkdir("exports")
    if len(os.listdir("exports")) != 0:
        print('Folder "exports" is not empty. Aborted.')
        return
    os.mkdir("exports/results")
    os.mkdir("exports/coop_results")
    with open("exports/overview.json", "a", encoding="utf-8") as f:
        f.write("[]\n")

    dir = tempfile.mkdtemp()
    with zipfile.ZipFile(sys.argv[1], "r") as f:
        f.extractall(dir)

    count = 0
    for path in os.listdir(f"{dir}/battles"):
        with open(f"{dir}/battles/{path}", "r", encoding="utf-8") as f:
            battle = json.loads(f.read())
            time = (
                b64decode(battle["vsHistoryDetail"]["id"])
                .decode("utf-8")
                .split(":")[2]
                .split("_")[0]
            )
            result = {"data": battle}
            with open(f"exports/results/{time}.json", "w", encoding="utf-8") as f2:
                json.dump(result, f2, ensure_ascii=False)
            count += 1
    for path in os.listdir(f"{dir}/coops"):
        with open(f"{dir}/coops/{path}", "r", encoding="utf-8") as f:
            coop = json.loads(f.read())
            time = (
                b64decode(coop["coopHistoryDetail"]["id"])
                .decode("utf-8")
                .split(":")[1]
                .split("_")[0]
            )
            result = {"data": coop}
            with open(f"exports/coop_results/{time}.json", "w", encoding="utf-8") as f2:
                json.dump(result, f2, ensure_ascii=False)
            count += 1

    print(f'Export {count} results to "exports".')


if __name__ == "__main__":
    main()
