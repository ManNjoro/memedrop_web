// src/lib/constants.ts

/**
 * TODO: replace with the real App Store URL once MemeDrop is published —
 * the numeric app ID doesn't exist until then. Format once live:
 * https://apps.apple.com/app/idXXXXXXXXXX
 */
export const APP_STORE_URL: string | null = null;

/**
 * This URL format is valid even pre-launch (it's keyed by package name,
 * matching `android.package` in app.json), but will show Google Play's
 * "not found" page publicly until the app is actually published there.
 */
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.mannjoro.memedrop';