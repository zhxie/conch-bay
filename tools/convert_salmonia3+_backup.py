from base64 import b64encode
from dateutil import parser
from hashlib import sha256
import json
import os
import requests
import sys
import tempfile
import utils
import zipfile

ENEMY_MAP = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 20]

BACKGROUND_IMAGE = {}
BADGE_IMAGE = {}
UNIFORM_IMAGE = {}
WEAPON_IMAGE = {
    -1: "https://splatoon3.ink/assets/splatnet/v2/ui_img/473fffb2442075078d8bb7125744905abdeae651b6a5b7453ae295582e45f7d1_0.png",
    -2: "https://splatoon3.ink/assets/splatnet/v2/ui_img/9d7272733ae2f2282938da17d69f13419a935eef42239132a02fcf37d8678f10_0.png",
}
SPECIAL_WEAPON_IMAGE = {
    -1: "https://splatoon3.ink/assets/splatnet/v2/ui_img/473fffb2442075078d8bb7125744905abdeae651b6a5b7453ae295582e45f7d1_0.png",
}
ENEMY_IMAGE = {
    4: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/f59fe344bd941f90dc8d3458ffd29b6586c1cffd00864967e7766a5a931dc4f6_0.png",
    5: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/03c31763738c5628db6d8e7dd3ba0fd2fcb79a1f47694488b51969375148edde_0.png",
    6: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/3a3e2c87b96b92e31ffc59a273b7d6aca20f9941e05ad84d6ae26092a627aa34_0.png",
    7: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/999097a0908a4560f05a16e3f97c07b5d10bed22bee6d2ce0eedb2e6a6dcb9d0_0.png",
    8: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/2d740da6f03364c3c289625455374f734fd8a96b25c26fde13912e90f3aea68c_0.png",
    9: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/fd5abb7a9087c528e45a7a4e29c9c03d673b69d6f0ba2f424f6df8b732d9919a_0.png",
    10: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/faed7977b2144ac5979de0ca7d23aefd507e517c3fbe19431054ac5a6ba300fa_0.png",
    11: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/fb4851c75f62b8b50d9bac2128d6ef1c703c7884b63402762ddf78c1555e364a_0.png",
    12: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/dbbf89da359fd880db49730ecc4f66150b148274aa005e22c1152cbf1a45e378_0.png",
    13: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/2c7a648b4c73f291b5ede9c55f33d4e3f99c263d3a27ef3d2eb2a96d328d66ac_0.png",
    14: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/2185696079cc39328cd69f0570e219f09b61d4a56508260fe97b16347ae8a55f_0.png",
    15: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/a35aa2982499e9a404fdb81f72fbaf553bc47f7682cc67f9b8c32ca9910e2cbf_0.png",
    17: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/8cd6dd3e1bb480e2897afdb434315bc78876204a0995c1552084e1d3edfe0536_0.png",
    20: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/f0dd8c7eb5c2e96f347564cac71affe055f6c45a3339145ecc81287f800759d2_0.png",
    23: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/75f39ca054c76c0c33cd71177780708e679d088c874a66101e9b76b001df8254_0.png",
    24: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/0ee5853c43ebbef00ee2faecbd6c74f8a2d5e5b62b2cfa96d3838894b71381cb_0.png",
    25: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/82905ebab16b4790142de406c78b1bf68a84056b366d9e19ae3360fb432fe0a9_0.png",
    30: "https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/coop_enemy_img/a29cdb61df1464ef45ddedc7a042fd8f4fab0fd1c7c0c694df708d0b61e21222_0.png",
}
COOP_STAGE_IMAGE = {}


def construct_id(path, npln_user_id, play_time, uuid, suffix=""):
    time = parser.parse(play_time).strftime("%Y%m%dT%H%M%S")
    return b64encode(
        f"{path}-u-{npln_user_id}:{time}_{uuid.lower()}{suffix}".encode("utf-8")
    ).decode("utf-8")


def construct_obj(path, id, with_name=True):
    formatted_id = f"{path}-{id}".encode("utf-8")
    if with_name:
        return {"name": "", "id": b64encode(formatted_id).decode("utf-8")}
    else:
        return {"id": b64encode(formatted_id).decode("utf-8")}


def construct_image_obj(path, id, url, with_name=True):
    obj = construct_obj(path, id, with_name)
    obj["image"] = {"url": url}
    return obj


def construct_weapon(url):
    return {"name": "", "image": {"url": url}}


def construct_member_result(result, player):
    background = construct_image_obj(
        "NameplateBackground",
        player["background"],
        BACKGROUND_IMAGE[player["background"]],
        False,
    )
    background["textColor"] = {
        "a": float(player["textColor"][3]),
        "b": float(player["textColor"][2]),
        "g": float(player["textColor"][1]),
        "r": float(player["textColor"][0]),
    }
    special_weapon = (
        construct_weapon(SPECIAL_WEAPON_IMAGE[player["specialId"]])
        if player["specialId"] != None
        else None
    )
    if special_weapon != None:
        special_weapon["weaponId"] = player["specialId"]
    return {
        "player": {
            "__isPlayer": "CoopPlayer",
            "byname": player["byname"],
            "name": player["name"],
            "nameId": player["nameId"],
            "nameplate": {
                "badges": list(
                    map(
                        lambda x: (
                            construct_image_obj("Badge", x, BADGE_IMAGE[x], False)
                            if x != None
                            else None
                        ),
                        player["badges"],
                    )
                ),
                "background": background,
            },
            "uniform": construct_image_obj(
                "CoopUniform", player["uniform"], UNIFORM_IMAGE[player["uniform"]]
            ),
            "id": construct_id(
                "CoopPlayer",
                result["nplnUserId"],
                result["playTime"],
                result["uuid"],
                f":u-{player['nplnUserId']}",
            ),
            "species": player["species"],
        },
        "weapons": list(
            map(
                lambda x: construct_weapon(WEAPON_IMAGE[x]),
                player["weaponList"],
            )
        ),
        "specialWeapon": special_weapon,
        "defeatEnemyCount": player["bossKillCountsTotal"],
        "deliverCount": player["ikuraNum"],
        "goldenAssistCount": player["goldenIkuraAssistNum"],
        "goldenDeliverCount": player["goldenIkuraNum"],
        "rescueCount": player["helpCount"],
        "rescuedCount": player["deadCount"],
    }


def format_image(path, name, is_splatoon3_ink=False):
    sha = sha256(name.encode("utf-8")).hexdigest()
    if is_splatoon3_ink:
        return f"https://splatoon3.ink/assets/splatnet/v2/{path}/{sha}_0.png"
    else:
        return f"https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/{path}/{sha}_0.png"


def format_map(map, obj, path, is_splatoon3_ink=False, name_decorator=lambda x: x):
    map[obj["Id"]] = format_image(
        path, name_decorator(obj["__RowId"]), is_splatoon3_ink
    )


def fetch_resource(version, path):
    return requests.get(
        f"https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/{version}/{path}.json"
    ).json()


def warmup():
    global BACKGROUND_IMAGE, BADGE_IMAGE, UNIFORM_IMAGE, WEAPON_IMAGE, SPECIAL_WEAPON_IMAGE, COOP_STAGE_IMAGE
    version = requests.get(
        "https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/latest"
    ).text

    backgrounds = fetch_resource(version, "NamePlateBgInfo")
    for background in backgrounds:
        format_map(BACKGROUND_IMAGE, background, "npl_img")

    badges = fetch_resource(version, "BadgeInfo")
    for badge in badges:
        BADGE_IMAGE[badge["Id"]] = format_image("badge_img", badge["Name"])

    uniforms = fetch_resource(version, "CoopSkinInfo")
    for uniform in uniforms:
        format_map(UNIFORM_IMAGE, uniform, "coop_skin_img")

    weapons = fetch_resource(version, "WeaponInfoMain")
    for weapon in weapons:
        format_map(WEAPON_IMAGE, weapon, "weapon_illust", not weapon["IsCoopRare"])

    special_weapons = fetch_resource(version, "WeaponInfoSpecial")
    for special_weapon in special_weapons:
        format_map(
            SPECIAL_WEAPON_IMAGE,
            special_weapon,
            "special_img/blue",
            name_decorator=lambda x: x.replace("_Coop", ""),
        )

    coop_stages = fetch_resource(version, "CoopSceneInfo")
    for coop_stage in coop_stages:
        format_map(
            COOP_STAGE_IMAGE, coop_stage, "stage_img/banner/high_resolution", False
        )


def main():
    if len(sys.argv) <= 1:
        print(
            f'Please specify the Salmonia3+ backup with "python3 {sys.argv[0]} <PATH>".'
        )
        return
    warmup()

    dir = tempfile.mkdtemp()
    with zipfile.ZipFile(sys.argv[1], "r") as f:
        f.extractall(dir)

    coops = []
    with open(f"{dir}/{os.listdir(dir)[0]}", encoding="utf-8") as f:
        data = json.loads(f.read())
        for schedule in data["schedules"]:
            for result in schedule["results"]:
                enemyResults = []
                for i in range(0, 14):
                    if result["bossCounts"][i] != 0:
                        enemyResults.append(
                            {
                                "defeatCount": result["players"][0]["bossKillCounts"][
                                    i
                                ],
                                "teamDefeatCount": result["bossKillCounts"][i],
                                "popCount": result["bossCounts"][i],
                                "enemy": construct_image_obj(
                                    "CoopEnemy", ENEMY_MAP[i], ENEMY_IMAGE[ENEMY_MAP[i]]
                                ),
                            }
                        )
                specialWeapons = []
                for i in range(0, len(result["waves"])):
                    specialWeapon = []
                    for player in result["players"]:
                        for _ in range(0, player["specialCounts"][i]):
                            specialWeapon.append(
                                construct_image_obj(
                                    "SpecialWeapon",
                                    player["specialId"],
                                    SPECIAL_WEAPON_IMAGE[player["specialId"]],
                                )
                            )
                        specialWeapons.append(specialWeapon)
                coops.append(
                    {
                        "coopHistoryDetail": {
                            "__typename": "CoopHistoryDetail",
                            "id": construct_id(
                                "CoopHistoryDetail",
                                result["nplnUserId"],
                                result["playTime"],
                                result["uuid"],
                            ),
                            "afterGrade": (
                                construct_obj("CoopGrade", result["gradeId"])
                                if result["gradeId"] != None
                                else None
                            ),
                            "myResult": construct_member_result(
                                result, result["players"][0]
                            ),
                            "memberResults": list(
                                map(
                                    lambda x: construct_member_result(result, x),
                                    result["players"][1:],
                                )
                            ),
                            "bossResult": (
                                {
                                    "boss": construct_image_obj(
                                        "CoopEnemy",
                                        result["bossId"],
                                        ENEMY_IMAGE[result["bossId"]],
                                    ),
                                    "hasDefeatBoss": result["isBossDefeated"],
                                }
                                if result["bossId"] != None
                                else None
                            ),
                            "enemyResults": enemyResults,
                            "waveResults": list(
                                map(
                                    lambda x: {
                                        "waveNumber": x["waveId"],
                                        "waterLevel": x["waterLevel"],
                                        "eventWave": (
                                            construct_obj(
                                                "CoopEventWave", x["eventType"]
                                            )
                                            if x["eventType"] != 0
                                            else None
                                        ),
                                        "deliverNorm": x["quotaNum"],
                                        "goldenPopCount": x["goldenIkuraPopNum"],
                                        "teamDeliverCount": x["goldenIkuraNum"],
                                        "specialWeapons": specialWeapons[
                                            x["waveId"] - 1
                                        ],
                                    },
                                    result["waves"],
                                )
                            ),
                            "resultWave": (
                                result["failureWave"]
                                if result["failureWave"] != None
                                else 0
                            ),
                            "playedTime": result["playTime"],
                            "rule": schedule["rule"],
                            "coopStage": construct_image_obj(
                                "CoopStage",
                                schedule["stageId"],
                                COOP_STAGE_IMAGE[schedule["stageId"]],
                            ),
                            "dangerRate": float(result["dangerRate"]),
                            "scenarioCode": result["scenarioCode"],
                            "smellMeter": result["smellMeter"],
                            "weapons": list(
                                map(
                                    lambda x: construct_weapon(WEAPON_IMAGE[x]),
                                    schedule["weaponList"],
                                )
                            ),
                            "afterGradePoint": result["gradePoint"],
                            "scale": (
                                {
                                    "gold": result["scale"][2],
                                    "silver": result["scale"][1],
                                    "bronze": result["scale"][0],
                                }
                                if result["scale"][0] != None
                                else None
                            ),
                            "jobPoint": result["kumaPoint"],
                            "jobScore": result["jobScore"],
                            "jobRate": (
                                float(result["jobRate"])
                                if result["jobRate"] != None
                                else None
                            ),
                            "jobBonus": result["jobBonus"],
                            "nextHistoryDetail": None,
                            "previousHistoryDetail": None,
                        }
                    }
                )

    utils.write_out("conch-bay-import", [], coops)
    print(f'Export {len(coops)} coops to "conch-bay-import.zip".')


if __name__ == "__main__":
    main()
