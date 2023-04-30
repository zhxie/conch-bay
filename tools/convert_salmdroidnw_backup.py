import json
import sys

GRIZZCO_WEAPON_IMAGE = [
    "0962405d6aecff4a075c46e895c42984e33b26c4b2b4b25c5058366db3c35ba4_0.png",
    "3380019464e3111a0f40e633be25f73ad34ec1844d2dc7852a349b29b238932b_0.png",
    "5cc158250a207241f51d767a47bbb6139fe1c4fb652cc182b73aac93baa659c5_0.png",
    "bf89bcf3d3a51badd78b436266e6b7927d99ac386e083023df3551da6b39e412_0.png",
    "36e03d8d1e6bc4f7449c5450f4410c6c8449cde0548797d22ab641cd488d2060_0.png",
    "480bc1dfb0beed1ce4625a6a6b035e4bac711de019bb9b0e5125e4e7e39e0719_0.png",
]
RANDOM_IMAGE = [
    "473fffb2442075078d8bb7125744905abdeae651b6a5b7453ae295582e45f7d1_0.png",
    "9d7272733ae2f2282938da17d69f13419a935eef42239132a02fcf37d8678f10_0.png",
]


def format_image_obj(obj, path):
    obj["image"][
        "url"
    ] = f"https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v1/{path}/{obj['image']['url']}"


def format_member_result(member_result):
    for badge in member_result["player"]["nameplate"]["badges"]:
        if badge != None:
            format_image_obj(badge, "badge_img")
    format_image_obj(member_result["player"]["nameplate"]["background"], "npl_img")
    format_image_obj(member_result["player"]["uniform"], "coop_skin_img")
    for weapon in member_result["weapons"]:
        if weapon["image"]["url"] in GRIZZCO_WEAPON_IMAGE:
            format_image_obj(weapon, "weapon_illust")
        else:
            weapon["image"][
                "url"
            ] = f"https://splatoon3.ink/assets/splatnet/v1/weapon_illust/{weapon['image']['url']}"
    format_image_obj(member_result["specialWeapon"], "special_img/blue")


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
            obj = json.loads(result["coopHistory"])

            format_member_result(obj["myResult"])
            for member_result in obj["memberResults"]:
                format_member_result(member_result)
            if obj["bossResult"] != None:
                format_image_obj(obj["bossResult"]["boss"], "coop_enemy_img")
            for enemy_result in obj["enemyResults"]:
                format_image_obj(enemy_result["enemy"], "coop_enemy_img")
            for wave_result in obj["waveResults"]:
                for special_weapon in wave_result["specialWeapons"]:
                    format_image_obj(special_weapon, "special_img/blue")
            obj["coopStage"]["image"][
                "url"
            ] = f"https://splatoon3.ink/assets/splatnet/v1/stage_img/icon/high_resolution/{obj['coopStage']['image']['url'].replace('_3', '_0')}"
            for weapon in obj["weapons"]:
                if weapon["image"]["url"] in RANDOM_IMAGE:
                    weapon["image"][
                        "url"
                    ] = f"https://splatoon3.ink/assets/splatnet/v1/ui_img/{weapon['image']['url']}"
                else:
                    weapon["image"][
                        "url"
                    ] = f"https://splatoon3.ink/assets/splatnet/v1/weapon_illust/{weapon['image']['url']}"

            coops.append({"coopHistoryDetail": obj})

    results = {"battles": [], "coops": coops}
    with open("conch-bay-import.json", "w") as f:
        json.dump(results, f, ensure_ascii=False)
    print(f'Export {len(coops)} coops to "conch-bay-import.json".')


if __name__ == "__main__":
    main()
