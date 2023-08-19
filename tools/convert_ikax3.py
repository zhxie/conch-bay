import json
import sqlite3
import struct
import sys
import tempfile
import zipfile


def parseFleece(blob, shared=None, i=None, w=False):
    if i is None:
        i = len(blob) - 2

    if blob[i] < 0b10000:
        # Small integer [0000iiii iiiiiiii].
        symbol = True if (blob[i] & 0b1000) >> 3 else False
        comp = ((blob[i] & 0b111) << 8) + blob[i + 1]
        if symbol:
            return -((comp ^ 0b111_11111111) + 1)
        return comp
    elif blob[i] < 0b100000:
        # Long integer [0001uccc iiiiiiii...].
        unsigned = True if (blob[i] & 0b1000) >> 3 else False
        count = (blob[i] & 0b111) + 1
        value = 0
        j = 0
        while j < count:
            if (not unsigned) and j == count - 1:
                symbol = True if (blob[i + 1 + j] & 0b10000000) >> 7 else False
                value = value + (blob[i + 1 + j] & 0b1111111) << 8 * j
                if symbol:
                    # Long integer with symbol set is not supported.
                    raise NotImplementedError()
            else:
                value = value + blob[i + 1 + j] << 8 * j
            j = j + 1
        return value
    elif blob[i] < 0b110000:
        # Floating point [0010s--- --------...].
        single = False if (blob[i] & 0b1000) >> 3 else True
        if single:
            return struct.unpack("f", blob[i + 2 : i + 2 + 4])[0]
        else:
            return struct.unpack("d", blob[i + 2 : i + 2 + 8])[0]
    elif blob[i] < 0b1000000:
        # Special [0011ss-- --------].
        sign = (blob[i] & 0b1100) >> 2
        if sign == 0:
            return None
        elif sign == 1:
            return False
        elif sign == 2:
            return True
        else:
            return None
    elif blob[i] < 0b1010000:
        # String [0100cccc ssssssss...].
        count = blob[i] & 0b1111
        if count == 0b1111:
            varlen = 0
            count = 0
            while True:
                end = False if (blob[i + 1 + varlen] & 0b10000000) >> 7 else True
                count = count + ((blob[i + 1 + varlen] & 0b1111111) << 7 * varlen)
                varlen = varlen + 1
                if end:
                    break
            return blob[i + 1 + varlen : i + 1 + varlen + count].decode("utf-8")
        else:
            return blob[i + 1 : i + 1 + count].decode("utf-8")
    elif blob[i] < 0b1100000:
        # Binary data [0101cccc dddddddd...].
        raise NotImplementedError()
    elif blob[i] < 0b1110000:
        # Array [0110wccc cccccccc...].
        wide = True if (blob[i] & 0b1000) >> 3 else False
        count = ((blob[i] & 0b111) << 8) + blob[i + 1]
        if count == 0b111_11111111:
            # Array with varint elements count.
            raise NotImplementedError()
        values = []
        j = 0
        while j < count:
            values.append(
                parseFleece(blob, shared, i + 2 + (4 if wide else 2) * j, wide)
            )
            j = j + 1
        return values
    elif blob[i] < 0b10000000:
        # Dictionary [0111wccc cccccccc...].
        wide = True if (blob[i] & 0b1000) >> 3 else False
        count = ((blob[i] & 0b111) << 8) + blob[i + 1]
        if count == 0b111_11111111:
            # Dictionary with varint elements count.
            raise NotImplementedError()
        values = {}
        j = 0
        while j < count:
            key = parseFleece(blob, shared, i + 2 + (8 if wide else 4) * j, wide)
            if type(key) == int:
                key = shared[key]
            values[key] = parseFleece(
                blob, shared, i + 2 + (8 if wide else 4) * j + (4 if wide else 2), wide
            )
            j = j + 1
        return values
    else:
        # Pointer [1ooooooo oooooooo].
        offset = 0
        if w:
            offset = 2 * (
                ((blob[i] & 0b1111111) << 24)
                + (blob[i + 1] << 16)
                + (blob[i + 2] << 8)
                + blob[i + 3]
            )
        else:
            offset = 2 * (((blob[i] & 0b1111111) << 8) + blob[i + 1])
        return parseFleece(blob, shared, i - offset, True)


def main():
    if len(sys.argv) <= 1:
        print(
            f'Please specify the IKAX3 database with "python3 {sys.argv[0]} <PATH_TO_IKAX3>".'
        )
        return

    dir = tempfile.mkdtemp()
    with zipfile.ZipFile(sys.argv[1], "r") as f:
        f.extractall(dir)
    id = ""
    with open(f"{dir}/account.json", "r", encoding="utf-8") as f:
        id = json.load(f)["id"]

    count = 0
    battles = []
    coops = []
    with sqlite3.connect(f"{dir}/{id}/vsResult.cblite2/db.sqlite3") as conn:
        cur = conn.cursor()
        shared = parseFleece(
            cur.execute(
                "SELECT body FROM kv_info WHERE `key` = 'SharedKeys'"
            ).fetchone()[0]
        )
        for row in cur.execute("SELECT body FROM kv_default"):
            battle = parseFleece(row[0], shared)
            battles.append({"vsHistoryDetail": battle})
            count = count + 1
    with sqlite3.connect(f"{dir}/{id}/coopResult.cblite2/db.sqlite3") as conn:
        cur = conn.cursor()
        shared = parseFleece(
            cur.execute(
                "SELECT body FROM kv_info WHERE `key` = 'SharedKeys'"
            ).fetchone()[0]
        )
        for row in cur.execute("SELECT body FROM kv_default"):
            coop = parseFleece(row[0], shared)
            coops.append({"coopHistoryDetail": coop})
            count = count + 1

    results = {"battles": battles, "coops": coops}
    with open("conch-bay-import.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False)
    print(f'Export {count} results to "conch-bay-import.json".')


if __name__ == "__main__":
    main()
