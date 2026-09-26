package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "liked_songs")
data class LikedSongEntity(
    @PrimaryKey val videoId: String,
    val title: String,
    val artist: String,
    val artistId: String?,
    val thumbnail: String?,
    val duration: Int,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "favorite_artists")
data class FavoriteArtistEntity(
    @PrimaryKey val artistId: String,
    val name: String,
    val thumbnail: String?,
    val region: String?,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "playlists")
data class PlaylistEntity(
    @PrimaryKey val id: String,
    val name: String,
    val description: String = "",
    val cover: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "playlist_items")
data class PlaylistItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val playlistId: String,
    val videoId: String,
    val title: String,
    val artist: String,
    val thumbnail: String?,
    val duration: Int,
    val position: Int = 0,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "history")
data class HistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val videoId: String,
    val title: String,
    val artist: String,
    val thumbnail: String?,
    val duration: Int,
    val playedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "downloads")
data class DownloadEntity(
    @PrimaryKey val videoId: String,
    val title: String,
    val artist: String,
    val thumbnail: String?,
    val duration: Int,
    val savedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "preferences")
data class UserPreferencesEntity(
    @PrimaryKey val id: Int = 1,
    val language: String = "en",
    val region: String = "GLOBAL",
    val country: String = "US",
    val genresCsv: String = "",
    val onboarded: Boolean = false
)
