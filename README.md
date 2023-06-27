# Conch Bay

Conch Bay is a cross-platform schedule and battle statistic client for Splatoon 3.

[<img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1673308800?h=f4afffb19e486060195b9cc0bf3fd5f9" alt="Download on the App Store">](https://apps.apple.com/us/app/conch-bay/id1659268579) [<img src="assets/download-for-android.svg" alt="Download for Android">](https://github.com/zhxie/conch-bay/releases/download/v1.6.1/conch-bay-1.6.1-android-unsigned.apk)

You may also test the latest app within [TestFlight](https://testflight.apple.com/join/JzrEy6eY) on iOS, or download unsigned APK directly in [Actions](https://github.com/zhxie/conch-bay/actions/workflows/build.yaml).

## FAQs

### Import data from s3s

Run the following command and all outputs will be merged into `conch-bay-import.json`. You can then import it in Conch Bay.

```sh
python3 tools/convert_s3s_outputs.py <PATH_TO_S3S>
```

### Import data from ikawidget3

Run the following command to extract data from a ikawidget3 database IKAX3 into `conch-bay-import.json`. You can then import it in Conch Bay. You have to acquire [cblite tool 3.0.0](https://github.com/couchbaselabs/couchbase-mobile-tools/releases/tag/cblite-3.0.0EE-alpha) before converting.

```sh
python3 tools/convert_ikax3.py <PATH_TO_CBLITE_TOOL> <PATH_TO_IKAX3>
```

### Import data from salmdroidNW

Run the following command to extract data from a salmdroidNW backup into `conch-bay-import.json`. You can then import it in Conch Bay.

```sh
python3 tools/convert_salmdroidnw_backup.py <PATH_TO_EXTRACTED_SALMDROIDNW_BACKUP>
```

### Import data from Salmonia3+

Run the following command to extract data from a Salmonia3+ backup into `conch-bay-import.json`. You can then import it in Conch Bay.

```sh
python3 tools/convert_salmonia3+_backup.py <PATH_TO_SALMONIA3+_PLAIN_JSON_BACKUP>
```

### Rescue data from a Conch Bay database

Run the following command to extract data from a Conch Bay database into `conch-bay-import.json`. You can then import it in Conch Bay.

```sh
python3 tools/convert_db.py <PATH_TO_DB>
```

### Split data

Run the following command to split a results JSON.

```sh
python3 tools/split.py <PATH_TO_JSON>
```

### Validate data

Run the following command to validate a results JSON.

```sh
python3 tools/validate.py <PATH_TO_JSON>
```

## License

Conch Bay is licensed under [the MIT License](/LICENSE).

Conch Bay uses API provided by [Splatoon3.ink](https://splatoon3.ink/) for schedules and shifts information, [imink f API](https://github.com/imink-app/f-API) for account authorization and [Nintendo app versions](https://github.com/nintendoapis/nintendo-app-versions) for API version update.

Conch Bay uses [splat3](https://github.com/Leanny/splat3) for mapping weapons in build time.

Conch Bay is grateful for Splatoon-related open source pioneers including [s3s](https://github.com/frozenpandaman/s3s) and [s3si.ts](https://github.com/spacemeowx2/s3si.ts), and all open source components listed in the [OSS Licenses](https://github.com/zhxie/conch-bay/wiki/OSS-Licenses).
