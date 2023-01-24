import json
import sys


def main():
    if len(sys.argv) <= 1:
        print(f'Please specify the results JSON with "python3 {sys.argv[0]} <PATH>".')
        return

    ids = set()
    battles = 0
    valid_battles = 0
    coops = 0
    valid_coops = 0
    with open(sys.argv[1], "r") as f:
        data = json.loads(f.read())
        battles = len(data["battles"])
        coops = len(data["coops"])
        for battle in data["battles"]:
            try:
                id = battle["vsHistoryDetail"]["id"]
                if id not in ids:
                    ids.add(id)
                    valid_battles = valid_battles + 1
            except:
                pass
        for coop in data["coops"]:
            try:
                id = coop["coopHistoryDetail"]["id"]
                if id not in ids:
                    ids.add(id)
                    valid_coops = valid_coops + 1
            except:
                pass

    print(
        f'"{sys.argv[1]}" contains {valid_battles} (of {battles}) valid battles and {valid_coops} (of {coops}) valid coops.'
    )


if __name__ == "__main__":
    main()
