package com.example.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface MusicDao {

    // Liked songs
    @Query("SELECT * FROM liked_songs ORDER BY createdAt DESC")
    fun getLikedSongs(): Flow<List<LikedSongEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLikedSong(song: LikedSongEntity)

    @Query("DELETE FROM liked_songs WHERE videoId = :videoId")
    suspend fun deleteLikedSong(videoId: String)

    @Query("SELECT EXISTS(SELECT 1 FROM liked_songs WHERE videoId = :videoId)")
    fun isLiked(videoId: String): Flow<Boolean>

    // Favorite artists
    @Query("SELECT * FROM favorite_artists ORDER BY createdAt DESC")
    fun getFavoriteArtists(): Flow<List<FavoriteArtistEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFavoriteArtist(artist: FavoriteArtistEntity)

    @Query("DELETE FROM favorite_artists WHERE artistId = :artistId")
    suspend fun deleteFavoriteArtist(artistId: String)

    @Query("SELECT EXISTS(SELECT 1 FROM favorite_artists WHERE artistId = :artistId)")
    fun isFavorite(artistId: String): Flow<Boolean>

    // Playlists
    @Query("SELECT * FROM playlists ORDER BY createdAt DESC")
    fun getPlaylists(): Flow<List<PlaylistEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlaylist(playlist: PlaylistEntity)

    @Query("DELETE FROM playlists WHERE id = :playlistId")
    suspend fun deletePlaylist(playlistId: String)

    @Query("SELECT * FROM playlist_items WHERE playlistId = :playlistId ORDER BY position ASC, id ASC")
    fun getPlaylistItems(playlistId: String): Flow<List<PlaylistItemEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlaylistItem(item: PlaylistItemEntity)

    @Query("DELETE FROM playlist_items WHERE playlistId = :playlistId AND videoId = :videoId")
    suspend fun deletePlaylistItem(playlistId: String, videoId: String)

    @Query("DELETE FROM playlist_items WHERE playlistId = :playlistId")
    suspend fun deleteAllPlaylistItems(playlistId: String)

    // History
    @Query("SELECT * FROM history ORDER BY playedAt DESC LIMIT 50")
    fun getHistory(): Flow<List<HistoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHistory(item: HistoryEntity)

    @Query("DELETE FROM history")
    suspend fun clearHistory()

    // Downloads
    @Query("SELECT * FROM downloads ORDER BY savedAt DESC")
    fun getDownloads(): Flow<List<DownloadEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDownload(download: DownloadEntity)

    @Query("DELETE FROM downloads WHERE videoId = :videoId")
    suspend fun deleteDownload(videoId: String)

    @Query("SELECT EXISTS(SELECT 1 FROM downloads WHERE videoId = :videoId)")
    fun isDownloaded(videoId: String): Flow<Boolean>

    // Preferences
    @Query("SELECT * FROM preferences WHERE id = 1")
    fun getPreferences(): Flow<UserPreferencesEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun savePreferences(prefs: UserPreferencesEntity)
}
