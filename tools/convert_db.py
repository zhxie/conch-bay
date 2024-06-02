import json
import sqlite3
import sys
import utils


def main():
    if len(sys.argv) <= 1:
        print(f'Please specify the database with "python3 {sys.argv[0]} <PATH>".')
        return

    ids = set()
    battles = []
    coops = []
    with sqlite3.connect(sys.argv[1]) as conn:
        cur = conn.cursor()
        for row in cur.execute("SELECT id, mode, detail FROM detail"):
            if row[0] not in ids:
                ids.add(row[0])
                if row[1] == "salmon_run":
                    coops.append(json.loads(row[2]))
                else:
                    battles.append(json.loads(row[2]))

    utils.write_out("conch-bay-import", battles, coops)
    print(f'Export {len(ids)} results to "conch-bay-import.zip".')


if __name__ == "__main__":
    main()
