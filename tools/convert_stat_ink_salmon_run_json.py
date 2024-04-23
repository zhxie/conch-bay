from base64 import b64encode
from datetime import datetime
from hashlib import sha256
import json
import requests
import sys
import utils

VERSION = "700"
DUMMY_NPLN_USER_ID = "statinksalmonrunjson"
WATER_LEVEL_MAP = {"low": 0, "normal": 1, "high": 2}
EVENT_WAVE_MAP = {
    "rush": 1,
    "goldie_seeking": 2,
    "griller": 3,
    "mothership": 4,
    "fog": 5,
    "cohock_charge": 6,
    "giant_tornado": 7,
    "mudmouth_eruption": 8,
}
SPECIAL_WEAPON_MAP = {
    "nicedama": 20006,
    "hopsonar": 20007,
    "megaphone51": 20009,
    "jetpack": 20010,
    "kanitank": 20012,
    "sameride": 20013,
    "tripletornado": 20014,
    "teioika": 20017,
    "ultra_chakuchi": 20018,
}

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
}
COOP_STAGE_IMAGE = {}


def get_id_in_aliases(obj):
    m = 0
    for alias in obj["aliases"]:
        try:
            result = int(alias)
            if result > m:
                m = result
        except:
            continue
    return m


def construct_id(path, play_time, uuid, suffix=""):
    time = datetime.fromtimestamp(play_time).strftime("%Y%m%dT%H%M%S")
    return b64encode(
        f"{path}-u-{DUMMY_NPLN_USER_ID}:{time}_{uuid.lower()}{suffix}".encode("utf-8")
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
        -1,
        "",
        False,
    )
    background["textColor"] = {
        "a": 1,
        "b": 0.67,
        "g": 0.63,
        "r": 0.63,
    }
    special_weapon = (
        construct_weapon(
            SPECIAL_WEAPON_IMAGE[SPECIAL_WEAPON_MAP[player["special"]["key"]]]
        )
        if player["special"] != None
        else None
    )
    if special_weapon != None:
        special_weapon["weaponId"] = SPECIAL_WEAPON_MAP[player["special"]["key"]]
    return {
        "player": {
            "__isPlayer": "CoopPlayer",
            "byname": player["splashtag_title"],
            "name": player["name"],
            "nameId": player["number"],
            "nameplate": {
                "badges": [None, None, None],
                "background": background,
            },
            "uniform": construct_image_obj(
                "CoopUniform",
                get_id_in_aliases(player["uniform"]),
                UNIFORM_IMAGE[get_id_in_aliases(player["uniform"])],
            ),
            "id": construct_id(
                "CoopPlayer",
                result["start_at"]["time"],
                result["uuid"],
                f":u-{DUMMY_NPLN_USER_ID}",
            ),
            "species": "INKLING",
        },
        "weapons": list(
            map(
                lambda x: (
                    construct_weapon(WEAPON_IMAGE[get_id_in_aliases(x)])
                    if x != None
                    else construct_weapon(WEAPON_IMAGE[-1])
                ),
                player["weapons"],
            )
        ),
        "specialWeapon": special_weapon,
        "defeatEnemyCount": player["defeat_boss"],
        "deliverCount": player["power_eggs"],
        "goldenAssistCount": player["golden_assist"],
        "goldenDeliverCount": player["golden_eggs"],
        "rescueCount": player["rescue"],
        "rescuedCount": player["rescued"],
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


def fetch_resource(path):
    return requests.get(
        f"https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/{VERSION}/{path}.json"
    ).json()


def warmup():
    global UNIFORM_IMAGE, WEAPON_IMAGE, SPECIAL_WEAPON_IMAGE, COOP_STAGE_IMAGE
    uniforms = fetch_resource("CoopSkinInfo")
    for uniform in uniforms:
        format_map(UNIFORM_IMAGE, uniform, "coop_skin_img")

    weapons = fetch_resource("WeaponInfoMain")
    for weapon in weapons:
        format_map(WEAPON_IMAGE, weapon, "weapon_illust", not weapon["IsCoopRare"])

    special_weapons = fetch_resource("WeaponInfoSpecial")
    for special_weapon in special_weapons:
        format_map(
            SPECIAL_WEAPON_IMAGE,
            special_weapon,
            "special_img/blue",
            name_decorator=lambda x: x.replace("_Coop", ""),
        )

    coop_stages = fetch_resource("CoopSceneInfo")
    for coop_stage in coop_stages:
        format_map(
            COOP_STAGE_IMAGE, coop_stage, "stage_img/banner/high_resolution", False
        )


def main():
    if len(sys.argv) <= 1:
        print(
            f'Please specify the stat.ink Salmon Run JSON with "python3 {sys.argv[0]} <PATH>".'
        )
        return
    warmup()

    coops = []
    with open(f"{sys.argv[1]}", encoding="utf-8") as f:
        while data := f.readline():
            result = json.loads(data)
            specialWeapons = []
            for i in range(0, len(result["waves"])):
                specialWeapon = []
                if type(result["waves"][i]["special_uses"]) is dict:
                    for use in result["waves"][i]["special_uses"].values():
                        for _ in range(0, use["count"]):
                            specialWeapon.append(
                                construct_image_obj(
                                    "SpecialWeapon",
                                    SPECIAL_WEAPON_MAP[use["special"]["key"]],
                                    SPECIAL_WEAPON_IMAGE[
                                        SPECIAL_WEAPON_MAP[use["special"]["key"]]
                                    ],
                                )
                            )
                specialWeapons.append(specialWeapon)

            coops.append(
                {
                    "coopHistoryDetail": {
                        "__typename": "CoopHistoryDetail",
                        "id": construct_id(
                            "CoopHistoryDetail",
                            result["start_at"]["time"],
                            result["uuid"],
                        ),
                        "afterGrade": (
                            construct_obj(
                                "CoopGrade",
                                get_id_in_aliases(result["title_after"]),
                            )
                            if result["title_after"] != None
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
                                    get_id_in_aliases(result["king_salmonid"]),
                                    ENEMY_IMAGE[
                                        get_id_in_aliases(result["king_salmonid"])
                                    ],
                                ),
                                "hasDefeatBoss": result["clear_extra"],
                            }
                            if result["king_salmonid"] != None
                            else None
                        ),
                        "enemyResults": (
                            list(
                                map(
                                    lambda x: {
                                        "defeatCount": x["defeated_by_me"],
                                        "teamDefeatCount": x["defeated"],
                                        "popCount": x["appearances"],
                                        "enemy": construct_image_obj(
                                            "CoopEnemy",
                                            get_id_in_aliases(x["boss"]),
                                            ENEMY_IMAGE[get_id_in_aliases(x["boss"])],
                                        ),
                                    },
                                    result["bosses"].values(),
                                )
                            )
                            if type(result["bosses"]) is dict
                            else []
                        ),
                        "waveResults": list(
                            map(
                                lambda x: {
                                    "waveNumber": x[0] + 1,
                                    "waterLevel": WATER_LEVEL_MAP[x[1]["tide"]["key"]],
                                    "eventWave": (
                                        construct_obj(
                                            "CoopEventWave",
                                            EVENT_WAVE_MAP[x[1]["event"]["key"]],
                                        )
                                        if x[1]["event"] != None
                                        else None
                                    ),
                                    "deliverNorm": x[1]["golden_quota"],
                                    "goldenPopCount": x[1]["golden_appearances"],
                                    "teamDeliverCount": x[1]["golden_delivered"],
                                    "specialWeapons": specialWeapons[x[0]],
                                },
                                enumerate(result["waves"]),
                            )
                        ),
                        "resultWave": (
                            (
                                result["clear_waves"] + 1
                                if result["clear_waves"]
                                is not (3 if not result.get("eggstra_work") else 5)
                                else 0
                            )
                            if not result["players"][0]["disconnected"]
                            else -1
                        ),
                        "playedTime": result["start_at"]["iso8601"].replace(
                            "+00:00", "Z"
                        ),
                        "rule": (
                            "TEAM_CONTEST"
                            if result.get("eggstra_work")
                            else ("BIG_RUN" if result["big_run"] else "REGULAR")
                        ),
                        "coopStage": construct_image_obj(
                            "CoopStage",
                            get_id_in_aliases(result["stage"]),
                            COOP_STAGE_IMAGE[get_id_in_aliases(result["stage"])],
                        ),
                        "dangerRate": (
                            (
                                result["danger_rate"] / 100
                                if result["danger_rate"] != None
                                else result["waves"][-1]["danger_rate"] / 100
                            )
                            if not result["players"][0]["disconnected"]
                            else 0
                        ),
                        "scenarioCode": None,
                        "smellMeter": result["king_smell"],
                        "weapons": [],
                        "afterGradePoint": result["title_exp_after"],
                        "scale": (
                            {
                                "gold": result["gold_scale"],
                                "silver": result["silver_scale"],
                                "bronze": result["bronze_scale"],
                            }
                            if result["gold_scale"] != None
                            else None
                        ),
                        "jobPoint": result["job_point"],
                        "jobScore": result["job_score"],
                        "jobRate": result["job_rate"],
                        "jobBonus": result["job_bonus"],
                        "nextHistoryDetail": None,
                        "previousHistoryDetail": None,
                    }
                }
            )

    utils.write_out("conch-bay-import", [], coops)
    print(f'Export {len(coops)} coops to "conch-bay-import.zip".')


if __name__ == "__main__":
    main()
