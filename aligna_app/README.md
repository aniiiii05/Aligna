# Aligna Flutter App

Cross-platform client for **iOS**, **Android**, and **Web**.

## First-time setup

```bash
cd aligna_app
flutter create . --project-name aligna_app
flutter pub get
```

## Run

```bash
# Web
flutter run -d chrome

# Android
flutter run -d android

# iOS (macOS only)
flutter run -d ios
```

## Production API

Mobile builds use `https://alignaa.org/api` by default. Web uses same-origin `/api` on Vercel.

Override:

```bash
flutter run --dart-define=API_BASE=https://alignaa.org/api
```

## Deep links (mobile)

Configure universal links / app links for `https://alignaa.org/auth/callback` after `flutter create` updates `android/` and `ios/` projects.
