import json
import sys


def main():
    if len(sys.argv) <= 1:
        print(f'Please specify the results JSON with "python3 {sys.argv[0]} <PATH>".')
        return

    count = 0
    battles = []
    coops = []
    results = []

    with open(sys.argv[1], encoding="utf-8") as f:
        data = json.loads(f.read())
        for battle in data["battles"]:
            battles.append(battle)
            count += 1
            if (len(battles) + len(coops)) % 500 == 0:
                results.append(
                    json.dumps({"battles": battles, "coops": coops}, ensure_ascii=False)
                )
                battles = []
                coops = []
        for coop in data["coops"]:
            coops.append(coop)
            count += 1
            if (len(battles) + len(coops)) % 500 == 0:
                results.append(
                    json.dumps({"battles": battles, "coops": coops}, ensure_ascii=False)
                )
                battles = []
                coops = []

    if len(battles) + len(coops) > 0:
        results.append(
            json.dumps({"battles": battles, "coops": coops}, ensure_ascii=False)
        )
        battles = []
        coops = []

    for i in range(len(results)):
        with open(f"conch-bay-import-{i}.json", "w", encoding="utf-8") as f:
            f.write(results[i])
    print(
        f'Split {count} results into "conch-bay-import-<N>.json", {len(results)} file(s) in total.'
    )


if __name__ == "__main__":
    main()
