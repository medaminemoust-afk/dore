package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.catalog.CatalogData
import com.example.data.local.AppDatabase
import com.example.data.local.PlaylistEntity
import com.example.data.local.UserPreferencesEntity
import com.example.data.repository.MusicRepository
import com.example.model.Album
import com.example.model.Artist
import com.example.model.RepeatMode
import com.example.model.Track
import com.example.player.MusicPlayerController
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getInstance(application)
    private val repository = MusicRepository(db)

    val playerController = MusicPlayerController(viewModelScope) { playedTrack ->
        viewModelScope.launch {
            repository.logHistory(playedTrack)
        }
    }

    // Database Flows
    val likedSongs: StateFlow<List<Track>> = repository.likedSongs
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val favoriteArtists: StateFlow<List<Artist>> = repository.favoriteArtists
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val playlists: StateFlow<List<PlaylistEntity>> = repository.playlists
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val history: StateFlow<List<Track>> = repository.history
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val downloads: StateFlow<List<Track>> = repository.downloads
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val preferences: StateFlow<UserPreferencesEntity?> = repository.preferences
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    // Player state mirrors
    val currentTrack = playerController.currentTrack
    val isPlaying = playerController.isPlaying
    val playbackPosition = playerController.playbackPosition
    val duration = playerController.duration
    val queue = playerController.queue
    val currentIndex = playerController.currentIndex
    val shuffle = playerController.shuffle
    val repeatMode = playerController.repeatMode
    val lyrics = playerController.lyrics

    // Region State for Home
    private val _selectedRegion = MutableStateFlow("GLOBAL")
    val selectedRegion: StateFlow<String> = _selectedRegion.asStateFlow()

    // Search State
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _searchTab = MutableStateFlow("all")
    val searchTab: StateFlow<String> = _searchTab.asStateFlow()

    private val _searchResults = MutableStateFlow<Triple<List<Track>, List<Artist>, List<Album>>>(
        Triple(CatalogData.TRACKS, CatalogData.ARTISTS, CatalogData.ALBUMS)
    )
    val searchResults: StateFlow<Triple<List<Track>, List<Artist>, List<Album>>> = _searchResults.asStateFlow()

    // Dialog & Sheet States
    var showExpandedPlayer = MutableStateFlow(false)
    var showQueueSheet = MutableStateFlow(false)
    var showLyricsSheet = MutableStateFlow(false)
    var showCreatePlaylistDialog = MutableStateFlow(false)
    var trackForAddToPlaylist = MutableStateFlow<Track?>(null)

    // Toast message
    private val _toastMessage = MutableStateFlow<String?>(null)
    val toastMessage: StateFlow<String?> = _toastMessage.asStateFlow()

    init {
        // Set initial region from preferences if available
        viewModelScope.launch {
            preferences.collect { pref ->
                if (pref != null) {
                    _selectedRegion.value = pref.region
                }
            }
        }
    }

    fun setRegion(regionId: String) {
        _selectedRegion.value = regionId
    }

    fun onSearchQueryChanged(q: String) {
        _searchQuery.value = q
        _searchResults.value = repository.search(q)
    }

    fun setSearchTab(tab: String) {
        _searchTab.value = tab
    }

    fun toggleLike(track: Track) {
        viewModelScope.launch {
            val isCurrentlyLiked = likedSongs.value.any { it.videoId == track.videoId }
            repository.toggleLike(track, isCurrentlyLiked)
            _toastMessage.value = if (isCurrentlyLiked) "Removed from Liked Songs" else "Added to Liked Songs"
        }
    }

    fun isLiked(videoId: String): Boolean {
        return likedSongs.value.any { it.videoId == videoId }
    }

    fun toggleFavorite(artist: Artist) {
        viewModelScope.launch {
            val isCurrentlyFavorite = favoriteArtists.value.any { it.artistId == artist.artistId }
            repository.toggleFavorite(artist, isCurrentlyFavorite)
            _toastMessage.value = if (isCurrentlyFavorite) "Removed from Favorites" else "Added to Favorites"
        }
    }

    fun isFavorite(artistId: String): Boolean {
        return favoriteArtists.value.any { it.artistId == artistId }
    }

    fun toggleDownload(track: Track) {
        viewModelScope.launch {
            val isCurrentlyDownloaded = downloads.value.any { it.videoId == track.videoId }
            repository.toggleDownload(track, isCurrentlyDownloaded)
            _toastMessage.value = if (isCurrentlyDownloaded) "Removed from Downloads" else "Saved for Offline"
        }
    }

    fun isDownloaded(videoId: String): Boolean {
        return downloads.value.any { it.videoId == videoId }
    }

    fun createPlaylist(name: String, desc: String = "") {
        viewModelScope.launch {
            repository.createPlaylist(name, desc)
            _toastMessage.value = "Playlist created"
        }
    }

    fun deletePlaylist(playlistId: String) {
        viewModelScope.launch {
            repository.deletePlaylist(playlistId)
            _toastMessage.value = "Playlist deleted"
        }
    }

    fun addToPlaylist(playlistId: String, track: Track) {
        viewModelScope.launch {
            repository.addToPlaylist(playlistId, track)
            _toastMessage.value = "Added to playlist"
        }
    }

    fun removeFromPlaylist(playlistId: String, videoId: String) {
        viewModelScope.launch {
            repository.removeFromPlaylist(playlistId, videoId)
            _toastMessage.value = "Removed from playlist"
        }
    }

    fun getPlaylistTracks(playlistId: String): Flow<List<Track>> {
        return repository.getPlaylistTracks(playlistId)
    }

    fun savePreferences(language: String, region: String, genres: List<String>, onboarded: Boolean) {
        viewModelScope.launch {
            repository.savePreferences(language, region, genres, onboarded)
        }
    }

    fun clearToast() {
        _toastMessage.value = null
    }

    // Playback helpers
    fun playTrack(track: Track) {
        playerController.playTrack(track)
    }

    fun playTracks(tracks: List<Track>, startIndex: Int = 0) {
        playerController.playTracks(tracks, startIndex)
    }

    fun shufflePlay(tracks: List<Track>) {
        if (tracks.isEmpty()) return
        val shuffled = tracks.shuffled()
        playerController.playTracks(shuffled, 0)
    }
}
