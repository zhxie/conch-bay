from hashlib import sha256
import json
import os
import requests
import sys
import tempfile
import utils
import zipfile

RANDOM_IMAGE = [
    "473fffb2442075078d8bb7125744905abdeae651b6a5b7453ae295582e45f7d1_0.png",
    "9d7272733ae2f2282938da17d69f13419a935eef42239132a02fcf37d8678f10_0.png",
]

GRIZZCO_WEAPON_IMAGE = []


def decorate_image_obj(obj, path, is_splatoon3_ink=False):
    if is_splatoon3_ink:
        obj["image"][
            "url"
        ] = f"https://splatoon3.ink/assets/splatnet/v2/{path}/{obj['image']['url']}"
    else:
        obj["image"][
            "url"
        ] = f"https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/{path}/{obj['image']['url']}"


def format_member_result(member_result):
    for badge in member_result["player"]["nameplate"]["badges"]:
        if badge != None:
            decorate_image_obj(badge, "badge_img")
    decorate_image_obj(member_result["player"]["nameplate"]["background"], "npl_img")
    decorate_image_obj(member_result["player"]["uniform"], "coop_skin_img")
    for weapon in member_result["weapons"]:
        decorate_image_obj(
            weapon, "weapon_illust", weapon["image"]["url"] not in GRIZZCO_WEAPON_IMAGE
        )
    if member_result["specialWeapon"] != None:
        if member_result["specialWeapon"]["image"]["url"] in RANDOM_IMAGE:
            decorate_image_obj(member_result["specialWeapon"], "ui_img", True)
        else:
            decorate_image_obj(member_result["specialWeapon"], "special_img/blue")


def warmup():
    global GRIZZCO_WEAPON_IMAGE
    version = requests.get(
        "https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/latest"
    ).text
    weapons = requests.get(
        f"https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/{version}/WeaponInfoMain.json"
    ).json()
    coop_weapons = [
        sha256(weapon["__RowId"].encode("utf-8")).hexdigest()
        for weapon in weapons
        if weapon["IsCoopRare"]
    ]
    GRIZZCO_WEAPON_IMAGE = [f"{weapon}_0.png" for weapon in coop_weapons]


def main():
    if len(sys.argv) <= 1:
        print(
            f'Please specify the salmdroidNW backup with "python3 {sys.argv[0]} <PATH>".'
        )
        return
    warmup()

    dir = tempfile.mkdtemp()
    with zipfile.ZipFile(sys.argv[1], "r") as f:
        f.extractall(dir)

    coops = []
    n = 1
    while os.path.exists(f"{dir}/{n}"):
        with open(f"{dir}/{n}", encoding="utf-8") as f:
            data = json.loads(f.read())
            results = json.loads(data["results"])
            for result in results:
                obj = json.loads(result["coopHistory"])

                format_member_result(obj["myResult"])
                for member_result in obj["memberResults"]:
                    format_member_result(member_result)
                if obj["bossResult"] != None:
                    decorate_image_obj(obj["bossResult"]["boss"], "coop_enemy_img")
                for enemy_result in obj["enemyResults"]:
                    decorate_image_obj(enemy_result["enemy"], "coop_enemy_img")
                for wave_result in obj["waveResults"]:
                    for special_weapon in wave_result["specialWeapons"]:
                        decorate_image_obj(special_weapon, "special_img/blue")
                decorate_image_obj(
                    obj["coopStage"], "stage_img/banner/high_resolution", False
                )
                for weapon in obj["weapons"]:
                    if weapon["image"]["url"] in RANDOM_IMAGE:
                        decorate_image_obj(weapon, "ui_img", True)
                    else:
                        decorate_image_obj(weapon, "weapon_illust", True)

                coops.append({"coopHistoryDetail": obj})
        n += 1

    utils.write_out("conch-bay-import", [], coops)
    print(f'Export {len(coops)} coops to "conch-bay-import.zip".')


if __name__ == "__main__":
    main()
