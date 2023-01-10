# Conch Bay

Conch Bay is a cross-platform schedule and battle statistic client for Splatoon 3.

[<img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1673308800?h=f4afffb19e486060195b9cc0bf3fd5f9" alt="Download on the App Store">](https://apps.apple.com/us/app/conch-bay/id1659268579)

or download unsigned APK directly in [Releases](https://github.com/zhxie/conch-bay/releases).

## FAQs

### Import data from s3s

Run the following command and all outputs will be merged into `conch-bay-import.json`. You can then import it in Conch Bay.

```sh
python3 tools/convert_s3s_outputs.py <PATH_TO_S3S>
```

### Analyze data

Run the following command to validate a results JSON.

```sh
python3 tools/analyze.py <PATH_TO_JSON>
```

## License

Conch Bay is licensed under [the MIT License](/LICENSE).

Conch Bay uses API provided by [Splatoon3.ink](https://splatoon3.ink/) for schedules and shifts information and [imink f API](https://github.com/imink-app/f-API) for account authorization.

Conch Bay is grateful for open source pioneers including [s3s](https://github.com/frozenpandaman/s3s) and [s3si.ts](https://github.com/spacemeowx2/s3si.ts).
