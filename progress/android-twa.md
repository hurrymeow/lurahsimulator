# Android TWA bundle

- `android/twa-manifest.json`: Bubblewrap config. Package `io.github.hurrymeow.pakpejabat`, start URL `/lurahsimulator/?src=twa`, target API 36.
- `.github/workflows/android.yml`: manual run builds the signed AAB and uploads it as an artifact. Needs secrets `ANDROID_KEYSTORE_B64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_PASSWORD`.
- `src/pwa/install.ts`: install button stays hidden when opened with `?src=twa` (remembered in sessionStorage).
- `public/privacy.html`: EN and ID privacy policy. The code has no analytics or network calls, only local storage.
- Digital Asset Links live in `hurrymeow/hurrymeow.github.io` (`.well-known/assetlinks.json`).
