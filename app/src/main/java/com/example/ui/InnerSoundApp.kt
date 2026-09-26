package com.example.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.model.Track
import com.example.ui.components.*
import com.example.ui.screens.*
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.PrimaryNeon
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Search : Screen("search")
    object Library : Screen("library")
    object Downloads : Screen("downloads")
    object Settings : Screen("settings")
    data class ArtistDetail(val artistId: String) : Screen("artist/$artistId")
    data class AlbumDetail(val albumId: String) : Screen("album/$albumId")
    data class PlaylistDetail(val playlistId: String) : Screen("playlist/$playlistId")
    object Onboarding : Screen("onboarding")
}

@Composable
fun InnerSoundApp(
    viewModel: MainViewModel = viewModel()
) {
    val preferences by viewModel.preferences.collectAsState()
    val currentTrack by viewModel.currentTrack.collectAsState()
    val isPlaying by viewModel.isPlaying.collectAsState()
    val position by viewModel.playbackPosition.collectAsState()
    val duration by viewModel.duration.collectAsState()
    val queue by viewModel.queue.collectAsState()
    val currentIndex by viewModel.currentIndex.collectAsState()
    val shuffle by viewModel.shuffle.collectAsState()
    val repeatMode by viewModel.repeatMode.collectAsState()
    val lyrics by viewModel.lyrics.collectAsState()
    val playlists by viewModel.playlists.collectAsState()
    val toastMessage by viewModel.toastMessage.collectAsState()

    var currentScreen by remember { mutableStateOf<Screen>(Screen.Home) }
    var searchInitialQuery by remember { mutableStateOf("") }

    val showExpandedPlayer by viewModel.showExpandedPlayer.collectAsState()
    val showQueueSheet by viewModel.showQueueSheet.collectAsState()
    val showLyricsSheet by viewModel.showLyricsSheet.collectAsState()
    val showCreatePlaylistDialog by viewModel.showCreatePlaylistDialog.collectAsState()
    val trackForAddToPlaylist by viewModel.trackForAddToPlaylist.collectAsState()

    // Show onboarding if not yet onboarded
    LaunchedEffect(preferences) {
        if (preferences != null && !preferences!!.onboarded && currentScreen !is Screen.Onboarding) {
            currentScreen = Screen.Onboarding
        }
    }

    // Snackbar for toast notifications
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(toastMessage) {
        toastMessage?.let {
            snackbarHostState.showSnackbar(it, duration = SnackbarDuration.Short)
            viewModel.clearToast()
        }
    }

    // Back handling for sub screens
    if (currentScreen !is Screen.Home && currentScreen !is Screen.Search && currentScreen !is Screen.Library && currentScreen !is Screen.Downloads && currentScreen !is Screen.Settings) {
        BackHandler {
            currentScreen = Screen.Home
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            if (currentScreen !is Screen.Onboarding) {
                Column {
                    // Mini player bar
                    if (currentTrack != null) {
                        val dur = if (duration > 0) duration else 180
                        val progress = position.toFloat() / dur.toFloat()
                        MiniPlayerBar(
                            track = currentTrack!!,
                            isPlaying = isPlaying,
                            progressPercent = progress,
                            onClick = { viewModel.showExpandedPlayer.value = true },
                            onPlayPause = { viewModel.playerController.togglePlayPause() },
                            onNext = { viewModel.playerController.next() }
                        )
                    }

                    // Navigation bar
                    NavigationBar(
                        containerColor = SurfaceDark,
                        contentColor = TextPrimary,
                        tonalElevation = 8.dp
                    ) {
                        val items = listOf(
                            Triple(Screen.Home, "Home", Icons.Default.Home to Icons.Outlined.Home),
                            Triple(Screen.Search, "Search", Icons.Default.Search to Icons.Outlined.Search),
                            Triple(Screen.Library, "Library", Icons.Default.VideoLibrary to Icons.Outlined.VideoLibrary),
                            Triple(Screen.Downloads, "Downloads", Icons.Default.Download to Icons.Outlined.Download),
                            Triple(Screen.Settings, "Settings", Icons.Default.Settings to Icons.Outlined.Settings)
                        )

                        items.forEach { (screen, label, icons) ->
                            val isSelected = currentScreen::class == screen::class
                            NavigationBarItem(
                                selected = isSelected,
                                onClick = { currentScreen = screen },
                                icon = {
                                    Icon(
                                        imageVector = if (isSelected) icons.first else icons.second,
                                        contentDescription = label
                                    )
                                },
                                label = { Text(label) },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = PrimaryNeon,
                                    selectedTextColor = PrimaryNeon,
                                    unselectedIconColor = TextSecondary,
                                    unselectedTextColor = TextSecondary,
                                    indicatorColor = SurfaceDark
                                ),
                                modifier = Modifier.testTag("nav_item_${label.lowercase()}")
                            )
                        }
                    }
                }
            }
        },
        containerColor = BackgroundDark
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (val screen = currentScreen) {
                is Screen.Home -> HomeScreen(
                    viewModel = viewModel,
                    onNavigateToArtist = { id -> currentScreen = Screen.ArtistDetail(id) },
                    onNavigateToAlbum = { id -> currentScreen = Screen.AlbumDetail(id) },
                    onNavigateToSearchWithGenre = { genre ->
                        searchInitialQuery = genre
                        currentScreen = Screen.Search
                    }
                )
                is Screen.Search -> SearchScreen(
                    viewModel = viewModel,
                    initialQuery = searchInitialQuery,
                    onNavigateToArtist = { id -> currentScreen = Screen.ArtistDetail(id) },
                    onNavigateToAlbum = { id -> currentScreen = Screen.AlbumDetail(id) }
                )
                is Screen.Library -> LibraryScreen(
                    viewModel = viewModel,
                    onNavigateToPlaylist = { id -> currentScreen = Screen.PlaylistDetail(id) },
                    onNavigateToArtist = { id -> currentScreen = Screen.ArtistDetail(id) }
                )
                is Screen.Downloads -> DownloadsScreen(
                    viewModel = viewModel
                )
                is Screen.Settings -> SettingsScreen(
                    viewModel = viewModel,
                    onRestartOnboarding = { currentScreen = Screen.Onboarding }
                )
                is Screen.ArtistDetail -> ArtistDetailScreen(
                    artistId = screen.artistId,
                    viewModel = viewModel,
                    onBack = { currentScreen = Screen.Home },
                    onNavigateToAlbum = { id -> currentScreen = Screen.AlbumDetail(id) }
                )
                is Screen.AlbumDetail -> AlbumDetailScreen(
                    albumId = screen.albumId,
                    viewModel = viewModel,
                    onBack = { currentScreen = Screen.Home }
                )
                is Screen.PlaylistDetail -> PlaylistDetailScreen(
                    playlistId = screen.playlistId,
                    viewModel = viewModel,
                    onBack = { currentScreen = Screen.Library }
                )
                is Screen.Onboarding -> OnboardingScreen(
                    viewModel = viewModel,
                    onFinish = { currentScreen = Screen.Home }
                )
            }
        }
    }

    // Modal Sheets & Dialogs
    if (showExpandedPlayer && currentTrack != null) {
        val t = currentTrack!!
        ExpandedPlayerSheet(
            track = t,
            isPlaying = isPlaying,
            positionSeconds = position,
            durationSeconds = duration,
            isLiked = viewModel.isLiked(t.videoId),
            isDownloaded = viewModel.isDownloaded(t.videoId),
            shuffle = shuffle,
            repeatMode = repeatMode,
            onDismiss = { viewModel.showExpandedPlayer.value = false },
            onPlayPause = { viewModel.playerController.togglePlayPause() },
            onNext = { viewModel.playerController.next() },
            onPrevious = { viewModel.playerController.previous() },
            onSeek = { viewModel.playerController.seekTo(it) },
            onToggleLike = { viewModel.toggleLike(t) },
            onToggleDownload = { viewModel.toggleDownload(t) },
            onToggleShuffle = { viewModel.playerController.toggleShuffle() },
            onCycleRepeat = { viewModel.playerController.cycleRepeat() },
            onOpenQueue = { viewModel.showQueueSheet.value = true },
            onOpenLyrics = { viewModel.showLyricsSheet.value = true },
            onAddToPlaylist = { viewModel.trackForAddToPlaylist.value = t }
        )
    }

    if (showQueueSheet) {
        QueueSheet(
            queue = queue,
            currentIndex = currentIndex,
            onTrackClick = { idx -> viewModel.playerController.playTracks(queue, idx) },
            onRemoveTrack = { idx -> viewModel.playerController.removeFromQueue(idx) },
            onDismiss = { viewModel.showQueueSheet.value = false }
        )
    }

    if (showLyricsSheet && currentTrack != null) {
        LyricsSheet(
            lyrics = lyrics,
            positionMs = position.toLong() * 1000L,
            trackTitle = currentTrack!!.title,
            onDismiss = { viewModel.showLyricsSheet.value = false }
        )
    }

    if (showCreatePlaylistDialog) {
        CreatePlaylistDialog(
            onDismiss = { viewModel.showCreatePlaylistDialog.value = false },
            onConfirm = { name, desc ->
                viewModel.createPlaylist(name, desc)
                viewModel.showCreatePlaylistDialog.value = false
            }
        )
    }

    trackForAddToPlaylist?.let { trk ->
        AddToPlaylistDialog(
            track = trk,
            playlists = playlists,
            onSelectPlaylist = { plId ->
                viewModel.addToPlaylist(plId, trk)
                viewModel.trackForAddToPlaylist.value = null
            },
            onCreateNewPlaylist = {
                viewModel.trackForAddToPlaylist.value = null
                viewModel.showCreatePlaylistDialog.value = true
            },
            onDismiss = { viewModel.trackForAddToPlaylist.value = null }
        )
    }
}
