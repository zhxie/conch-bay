import datetime
import json
import os
import shutil
import tempfile


def write_out(path, battles, coops):
    dir = tempfile.mkdtemp()

    last_time = 0
    duplicate = 0
    os.mkdir(f"{dir}/battles")
    for battle in battles:
        date = datetime.datetime.fromisoformat(battle["vsHistoryDetail"]["playedTime"])
        time = int(date.timestamp() * 1000)
        if last_time == time:
            duplicate += 1
        else:
            duplicate = 0
        last_time = time
        with open(f"{dir}/battles/{time}{f"-{duplicate}.json" if duplicate else ""}.json", "w", encoding="utf-8") as f:
            json.dump(battle, f, ensure_ascii=False)
    last_time = 0
    duplicate = 0
    os.mkdir(f"{dir}/coops")
    for coop in coops:
        date = datetime.datetime.fromisoformat(coop["coopHistoryDetail"]["playedTime"])
        time = int(date.timestamp() * 1000)
        if last_time == time:
            duplicate += 1
        else:
            duplicate = 0
        last_time = time
        with open(f"{dir}/coops/{time}{f"-{duplicate}.json" if duplicate else ""}.json", "w", encoding="utf-8") as f:
            json.dump(coop, f, ensure_ascii=False)

    shutil.make_archive(path, "zip", dir)
