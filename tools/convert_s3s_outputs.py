import json
import os
import sys


def main():
    if len(sys.argv) <= 1:
        print(
            f'Please specify the directory of s3s with "python3 {sys.argv[0]} <PATH>".'
        )
        return

    ids = set()
    battles = []
    coops = []
    if os.path.exists(f"{sys.argv[1]}/exports/results"):
        for file in os.listdir(f"{sys.argv[1]}/exports/results"):
            with open(f"{sys.argv[1]}/exports/results/{file}") as f:
                datum = json.loads(f.read())
                battle = datum["data"]
                id = battle["vsHistoryDetail"]["id"]
                if id not in ids:
                    ids.add(id)
                    battles.append(battle)
    if os.path.exists(f"{sys.argv[1]}/exports/coop_results"):
        for file in os.listdir(f"{sys.argv[1]}/exports/coop_results"):
            with open(f"{sys.argv[1]}/exports/coop_results/{file}") as f:
                datum = json.loads(f.read())
                coop = datum["data"]
                id = coop["coopHistoryDetail"]["id"]
                if id not in ids:
                    ids.add(id)
                    coops.append(coop)
    for dir in os.listdir(sys.argv[1]):
        if dir.startswith("export-"):
            with open(f"{sys.argv[1]}/{dir}/results.json") as f:
                data = json.loads(f.read())
                for datum in data:
                    battle = datum["data"]
                    id = battle["vsHistoryDetail"]["id"]
                    if id not in ids:
                        ids.add(id)
                        battles.append(battle)
            with open(f"{sys.argv[1]}/{dir}/coop_results.json") as f:
                data = json.loads(f.read())
                for datum in data:
                    coop = datum["data"]
                    id = coop["coopHistoryDetail"]["id"]
                    if id not in ids:
                        ids.add(id)
                        coops.append(coop)

    results = {"battles": battles, "coops": coops}
    with open("conch-bay-import.json", "w") as f:
        json.dump(results, f, ensure_ascii=False)
    print(f'Export {len(ids)} results to "conch-bay-import.json".')


if __name__ == "__main__":
    main()
