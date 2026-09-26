package com.example.model

data class Track(
    val videoId: String,
    val title: String,
    val artist: String,
    val artistId: String? = null,
    val thumbnail: String? = null,
    val duration: Int = 180, // duration in seconds
    val album: String? = null
)

data class Artist(
    val artistId: String,
    val name: String,
    val thumbnail: String? = null,
    val region: String? = null,
    val subtitle: String? = null,
    val bio: String? = null
)

data class Album(
    val albumId: String,
    val title: String,
    val subtitle: String,
    val thumbnail: String? = null,
    val tracks: List<Track> = emptyList(),
    val year: String? = "2024"
)

data class RegionInfo(
    val id: String,
    val label: String,
    val emoji: String,
    val trendingQuery: String,
    val artists: List<String>
)

data class GenreInfo(
    val id: String,
    val label: String,
    val query: String,
    val emoji: String
)

enum class RepeatMode {
    OFF, ALL, ONE
}

data class LyricsLine(
    val timestampMs: Long,
    val text: String
)
