import json
import os
import sys
import tempfile
import zipfile


def main():
    if len(sys.argv) <= 1:
        print(f'Please specify the results JSON with "python3 {sys.argv[0]} <PATH>".')
        return

    dir = tempfile.mkdtemp()
    with zipfile.ZipFile(sys.argv[1], "r") as f:
        f.extractall(dir)

    ids = set()
    battles = 0
    valid_battles = 0
    coops = 0
    valid_coops = 0
    for path in os.listdir(f"{dir}/battles"):
        with open(f"{dir}/battles/{path}", "r", encoding="utf-8") as f:
            battle = json.loads(f.read())
            battles += 1
            try:
                id = battle["vsHistoryDetail"]["id"]
                if id not in ids:
                    ids.add(id)
                    valid_battles += 1
            except:
                pass
    for path in os.listdir(f"{dir}/coops"):
        with open(f"{dir}/coops/{path}", "r", encoding="utf-8") as f:
            coop = json.loads(f.read())
            coops += 1
            try:
                id = coop["coopHistoryDetail"]["id"]
                if id not in ids:
                    ids.add(id)
                    valid_coops += 1
            except:
                pass

    print(
        f'"{sys.argv[1]}" contains {valid_battles} (of {battles}) valid battles and {valid_coops} (of {coops}) valid coops.'
    )


if __name__ == "__main__":
    main()
