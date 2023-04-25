import json
import sys


def main():
    if len(sys.argv) <= 1:
        print(
            f'Please specify the directory of salmdroidNW backup with "python3 {sys.argv[0]} <PATH>".'
        )
        return

    coops = []
    with open(f"{sys.argv[1]}/1") as f:
        data = json.loads(f.read())
        results = json.loads(data["results"])
        for result in results:
            coops.append({"coopHistoryDetail": json.loads(result["coopHistory"])})

    results = {"battles": [], "coops": coops}
    with open("conch-bay-import.json", "w") as f:
        json.dump(results, f, ensure_ascii=False)
    print(f'Export {len(coops)} coops to "conch-bay-import.json".')


if __name__ == "__main__":
    main()
