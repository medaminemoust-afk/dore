# InnerSound background playback fix

## What changed
- Online playback now prefers the app's `/api/audio/[videoId]` stream through a real HTML `<audio>` element.
- The existing YouTube iframe remains as a fallback when the audio resolver cannot provide a stream.
- Media Session metadata and playback state are updated.
- Notification/lock-screen controls support play, pause, next, previous, seek forward/backward and seek-to where supported.
- Offline downloaded audio continues to use the same HTML audio element.

## Important
The `/api/audio/[videoId]` endpoint must be reachable from the installed app. The app is a Next.js application and needs its server/API deployed; it is not a fully static APK by itself.

## Build
Install dependencies with `npm install`, then run `npm run build`.
If packaging with Capacitor, point the WebView to the deployed Next.js app/API so `/api/audio/...` remains available.

## Verification
1. Start the app and play a song.
2. Confirm the Android media notification appears.
3. Lock the phone and confirm playback continues.
4. Leave the app and confirm playback continues.
5. Test play/pause/next/previous from the notification.
