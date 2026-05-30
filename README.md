# Conch Bay

**_Due to Nintendo's continued negative attitude toward third-party apps, use Conch Bay at your own risk._**

Conch Bay is a cross-platform schedule and battle statistics client for Splatoon 3.

You can test the beta app on iOS via [TestFlight](https://testflight.apple.com/join/JzrEy6eY), or download the unsigned beta APK from the [Pre-release](https://github.com/zhxie/conch-bay/releases/tag/beta).

## Build

Ensure you have `node`, `yarn`, `expo-cli`, `eas-cli`, and OS-related build tools installed. To build a deployable app, sign the package with valid certificates.

```sh
yarn

# Build the development build.
eas build --local --platform <ios|android> --profile development
# Run with the development build.
yarn start
# Build the native app.
eas build --local --platform <ios|android> --profile <production|internal|preview>
```

## FAQs

### Import data from s3s

Run the following command to merge all outputs into `conch-bay-import.zip`, then import it into Conch Bay.

```sh
python3 tools/convert_s3s_outputs.py <PATH_TO_S3S>
```

### Import Salmon Run data from stat.ink

_Importing Salmon Run data from stat.ink is not recommended because many fields are missing from stat.ink Salmon Run JSON._

Run the following command to convert stat.ink [Salmon Run JSON](https://stat.ink/user/download3?type=salmon-json) into `conch-bay-import.zip`, then import it into Conch Bay. Some fields, such as IDs, Splashtag banners, and badges, are missing after upload to stat.ink and will be replaced with dummy data.

```sh
python3 tools/convert_stat_ink_salmon_run_json.py <PATH_TO_EXTRACTED_STAT_INK_SALMON_RUN_JSON>
```

### Import data from ikawidget3

Run the following command to convert data from an ikawidget3 `IKAX3` database into `conch-bay-import.zip`, then import it into Conch Bay. Some information may be inaccurate because `IKAX3` contains encrypted data.

```sh
python3 tools/convert_ikax3.py <PATH_TO_IKAX3>
```

### Import data from salmdroidNW

Run the following command to convert data from a salmdroidNW backup into `conch-bay-import.zip`, then import it into Conch Bay.

```sh
python3 tools/convert_salmdroidnw_backup.py <PATH_TO_SALMDROIDNW_BACKUP>
```

### Import data from Salmonia3+

Run the following command to convert data from a Salmonia3+ backup into `conch-bay-import.zip`, then import it into Conch Bay. Some information may be missing because Salmonia3+ backups do not contain all result data.

```sh
python3 tools/convert_salmonia3+_backup.py <PATH_TO_SALMONIA3+_BACKUP>
```

### Rescue data from a Conch Bay database

Run the following command to convert data from a Conch Bay database into `conch-bay-import.zip`, then import it into Conch Bay.

```sh
python3 tools/convert_db.py <PATH_TO_DB>
```

### Validate data

Run the following command to validate a results ZIP.

```sh
python3 tools/validate.py <PATH_TO_ZIP>
```

### Export data to s3s and upload to stat.ink

Run the following command to convert a results ZIP into s3s outputs and upload them to stat.ink.

```sh
python3 tools/export_s3s_outputs.py <PATH_TO_ZIP>
python3 <PATH_TO_S3S>/s3s.py -i exports/results exports/overview.json
python3 <PATH_TO_S3S>/s3s.py -i exports/coop_results exports/overview.json
```

## License

Conch Bay is licensed under [the MIT License](/LICENSE).

## Acknowledgments

Conch Bay uses APIs from [Splatoon3.ink](https://splatoon3.ink/) for schedules and shifts, [imink f API](https://github.com/imink-app/f-API) and [nxapi znca API](https://github.com/samuelthomas2774/nxapi-znca-api/) for account authorization, and [Nintendo app versions](https://github.com/nintendoapis/nintendo-app-versions) for API version updates.

Conch Bay uses [splat3](https://github.com/Leanny/splat3) for data mapping and [Nintendo app versions](https://github.com/nintendoapis/nintendo-app-versions) for API version updates at build time.

Conch Bay uses [Splatoon3.ink](https://splatoon3.ink/) for images and [splat3](https://github.com/Leanny/splat3) for data mapping in data converters.

Conch Bay uses [sendou.ink](https://sendou.ink/) Build Analyzer and [splat.top](https://splat.top/) as external tools.

Special thanks to Splatoon-related open-source pioneers including [s3s](https://github.com/frozenpandaman/s3s) and [s3si.ts](https://github.com/spacemeowx2/s3si.ts), and to all open-source components listed in the [OSS Licenses](https://github.com/zhxie/conch-bay/wiki/OSS-Licenses).
