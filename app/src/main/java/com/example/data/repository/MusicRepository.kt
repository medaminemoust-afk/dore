package com.example.data.repository

import com.example.data.catalog.CatalogData
import com.example.data.local.AppDatabase
import com.example.data.local.DownloadEntity
import com.example.data.local.FavoriteArtistEntity
import com.example.data.local.HistoryEntity
import com.example.data.local.LikedSongEntity
import com.example.data.local.PlaylistEntity
import com.example.data.local.PlaylistItemEntity
import com.example.data.local.UserPreferencesEntity
import com.example.model.Album
import com.example.model.Artist
import com.example.model.Track
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.UUID

class MusicRepository(private val database: AppDatabase) {

    private val dao = database.musicDao()

    val likedSongs: Flow<List<Track>> = dao.getLikedSongs().map { entities ->
        entities.map {
            Track(
                videoId = it.videoId,
                title = it.title,
                artist = it.artist,
                artistId = it.artistId,
                thumbnail = it.thumbnail,
                duration = it.duration
            )
        }
    }

    val favoriteArtists: Flow<List<Artist>> = dao.getFavoriteArtists().map { entities ->
        entities.map {
            Artist(
                artistId = it.artistId,
                name = it.name,
                thumbnail = it.thumbnail,
                region = it.region
            )
        }
    }

    val playlists: Flow<List<PlaylistEntity>> = dao.getPlaylists()

    val history: Flow<List<Track>> = dao.getHistory().map { entities ->
        entities.map {
            Track(
                videoId = it.videoId,
                title = it.title,
                artist = it.artist,
                thumbnail = it.thumbnail,
                duration = it.duration
            )
        }
    }

    val downloads: Flow<List<Track>> = dao.getDownloads().map { entities ->
        entities.map {
            Track(
                videoId = it.videoId,
                title = it.title,
                artist = it.artist,
                thumbnail = it.thumbnail,
                duration = it.duration
            )
        }
    }

    val preferences: Flow<UserPreferencesEntity?> = dao.getPreferences()

    suspend fun toggleLike(track: Track, isCurrentlyLiked: Boolean) {
        if (isCurrentlyLiked) {
            dao.deleteLikedSong(track.videoId)
        } else {
            dao.insertLikedSong(
                LikedSongEntity(
                    videoId = track.videoId,
                    title = track.title,
                    artist = track.artist,
                    artistId = track.artistId,
                    thumbnail = track.thumbnail,
                    duration = track.duration
                )
            )
        }
    }

    suspend fun toggleFavorite(artist: Artist, isCurrentlyFavorite: Boolean) {
        if (isCurrentlyFavorite) {
            dao.deleteFavoriteArtist(artist.artistId)
        } else {
            dao.insertFavoriteArtist(
                FavoriteArtistEntity(
                    artistId = artist.artistId,
                    name = artist.name,
                    thumbnail = artist.thumbnail,
                    region = artist.region
                )
            )
        }
    }

    suspend fun createPlaylist(name: String, description: String = ""): String {
        val id = UUID.randomUUID().toString()
        dao.insertPlaylist(
            PlaylistEntity(
                id = id,
                name = name,
                description = description,
                cover = CatalogData.TRACKS.randomOrNull()?.thumbnail
            )
        )
        return id
    }

    suspend fun deletePlaylist(playlistId: String) {
        dao.deletePlaylist(playlistId)
        dao.deleteAllPlaylistItems(playlistId)
    }

    fun getPlaylistTracks(playlistId: String): Flow<List<Track>> {
        return dao.getPlaylistItems(playlistId).map { items ->
            items.map {
                Track(
                    videoId = it.videoId,
                    title = it.title,
                    artist = it.artist,
                    thumbnail = it.thumbnail,
                    duration = it.duration
                )
            }
        }
    }

    suspend fun addToPlaylist(playlistId: String, track: Track) {
        dao.insertPlaylistItem(
            PlaylistItemEntity(
                playlistId = playlistId,
                videoId = track.videoId,
                title = track.title,
                artist = track.artist,
                thumbnail = track.thumbnail,
                duration = track.duration
            )
        )
    }

    suspend fun removeFromPlaylist(playlistId: String, videoId: String) {
        dao.deletePlaylistItem(playlistId, videoId)
    }

    suspend fun logHistory(track: Track) {
        dao.insertHistory(
            HistoryEntity(
                videoId = track.videoId,
                title = track.title,
                artist = track.artist,
                thumbnail = track.thumbnail,
                duration = track.duration
            )
        )
    }

    suspend fun toggleDownload(track: Track, isDownloaded: Boolean) {
        if (isDownloaded) {
            dao.deleteDownload(track.videoId)
        } else {
            dao.insertDownload(
                DownloadEntity(
                    videoId = track.videoId,
                    title = track.title,
                    artist = track.artist,
                    thumbnail = track.thumbnail,
                    duration = track.duration
                )
            )
        }
    }

    suspend fun savePreferences(
        language: String,
        region: String,
        genres: List<String>,
        onboarded: Boolean
    ) {
        dao.savePreferences(
            UserPreferencesEntity(
                id = 1,
                language = language,
                region = region,
                country = if (region == "USA") "US" else if (region == "EUROPE") "FR" else if (region == "LATIN") "MX" else "GLOBAL",
                genresCsv = genres.joinToString(","),
                onboarded = onboarded
            )
        )
    }

    fun search(query: String): Triple<List<Track>, List<Artist>, List<Album>> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) {
            return Triple(CatalogData.TRACKS, CatalogData.ARTISTS, CatalogData.ALBUMS)
        }

        val matchedSongs = CatalogData.TRACKS.filter {
            it.title.lowercase().contains(q) || it.artist.lowercase().contains(q) || (it.album?.lowercase()?.contains(q) == true)
        }
        val matchedArtists = CatalogData.ARTISTS.filter {
            it.name.lowercase().contains(q) || it.region?.lowercase()?.contains(q) == true
        }
        val matchedAlbums = CatalogData.ALBUMS.filter {
            it.title.lowercase().contains(q) || it.subtitle.lowercase().contains(q)
        }
        return Triple(matchedSongs, matchedArtists, matchedAlbums)
    }
}
