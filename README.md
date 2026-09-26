# InnerSound (Android)

InnerSound is a modern Android music streaming application built natively with Kotlin and Jetpack Compose.

## Features
- **Region-Aware Streaming**: Explore trending hits and top artists tailored to 7 distinct regions (Global, USA & Canada, Latin America, Europe, Africa, North Africa & Middle East, Asia).
- **Audio Playback Engine**: Persistent now-playing bar and full-screen player sheet with seekbar scrubber, play/pause, skip, shuffle, repeat (all/one), synced lyrics view, and interactive playing queue.
- **Offline Library & Persistence**: Local Room database for persistent Liked Songs, Custom Playlists, Favorite Artists, Listening History, and Offline Downloaded Tracks.
- **Dynamic Exploration & Search**: Live multi-category search across Songs, Artists, and Albums with style and genre browsing.
- **Onboarding & Localization**: Guided onboarding setup with region selection, favorite styles/artists, and multi-language support (English, Arabic with RTL, French, Spanish).
- **Material 3 Design**: Dark mode aesthetic (#0B0812) with neon violet & fuchsia accents, smooth animations, and accessibility compliance.

## Tech Stack
- **Language**: Kotlin 2.0
- **UI**: Jetpack Compose with Material 3
- **Architecture**: MVVM with Kotlin Coroutines & StateFlow
- **Database**: Room Persistence Library with KSP
- **Image Loading**: Coil Compose
- **Media**: AndroidX Media3
