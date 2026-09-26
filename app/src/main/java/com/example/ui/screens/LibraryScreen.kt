package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.PlaylistPlay
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.ui.MainViewModel
import com.example.ui.components.ArtistTile
import com.example.ui.components.SongRow
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.PrimaryNeon
import com.example.ui.theme.SurfaceVariantDark
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.TextTertiary

@Composable
fun LibraryScreen(
    viewModel: MainViewModel,
    onNavigateToPlaylist: (String) -> Unit,
    onNavigateToArtist: (String) -> Unit
) {
    val playlists by viewModel.playlists.collectAsState()
    val likedSongs by viewModel.likedSongs.collectAsState()
    val favoriteArtists by viewModel.favoriteArtists.collectAsState()
    val history by viewModel.history.collectAsState()
    val currentTrack by viewModel.currentTrack.collectAsState()
    val isPlaying by viewModel.isPlaying.collectAsState()

    var selectedTab by remember { mutableStateOf("playlists") }
    val tabs = listOf(
        "playlists" to "Playlists",
        "liked" to "Liked Songs",
        "artists" to "Artists",
        "history" to "History"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
    ) {
        // Library Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Your Library",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Black,
                color = TextPrimary
            )

            if (selectedTab == "playlists") {
                IconButton(
                    onClick = { viewModel.showCreatePlaylistDialog.value = true },
                    modifier = Modifier.testTag("new_playlist_header_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "New Playlist",
                        tint = PrimaryNeon
                    )
                }
            }
        }

        // Tabs
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.padding(bottom = 8.dp)
        ) {
            items(tabs) { (id, label) ->
                FilterChip(
                    selected = selectedTab == id,
                    onClick = { selectedTab = id },
                    label = { Text(label) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = PrimaryNeon,
                        selectedLabelColor = BackgroundDark,
                        containerColor = SurfaceVariantDark,
                        labelColor = TextPrimary
                    ),
                    modifier = Modifier.testTag("library_tab_$id")
                )
            }
        }

        // Tab Content
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 120.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            when (selectedTab) {
                "playlists" -> {
                    if (playlists.isEmpty()) {
                        item {
                            EmptyLibraryView(
                                title = "No Playlists Yet",
                                message = "Create custom playlists to organize your favorite songs.",
                                actionText = "Create Playlist",
                                onAction = { viewModel.showCreatePlaylistDialog.value = true }
                            )
                        }
                    } else {
                        items(playlists) { pl ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable { onNavigateToPlaylist(pl.id) }
                                    .testTag("playlist_item_${pl.id}"),
                                colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark)
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(56.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(BackgroundDark),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (pl.cover != null) {
                                            AsyncImage(
                                                model = pl.cover,
                                                contentDescription = pl.name,
                                                modifier = Modifier.fillMaxSize()
                                            )
                                        } else {
                                            Icon(
                                                imageVector = Icons.Default.PlaylistPlay,
                                                contentDescription = null,
                                                tint = PrimaryNeon,
                                                modifier = Modifier.size(32.dp)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.width(16.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = pl.name,
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = TextPrimary
                                        )
                                        if (pl.description.isNotEmpty()) {
                                            Text(
                                                text = pl.description,
                                                style = MaterialTheme.typography.bodyMedium,
                                                color = TextSecondary
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                "liked" -> {
                    if (likedSongs.isEmpty()) {
                        item {
                            EmptyLibraryView(
                                title = "No Liked Songs",
                                message = "Tap the heart icon on any song to add it to your favorites."
                            )
                        }
                    } else {
                        item {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 8.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Button(
                                    onClick = { viewModel.playTracks(likedSongs, 0) },
                                    modifier = Modifier.weight(1f).testTag("play_all_liked_button")
                                ) {
                                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Play All (${likedSongs.size})")
                                }
                                OutlinedButton(
                                    onClick = { viewModel.shufflePlay(likedSongs) },
                                    modifier = Modifier.weight(1f).testTag("shuffle_liked_button")
                                ) {
                                    Icon(Icons.Default.Shuffle, contentDescription = null)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Shuffle")
                                }
                            }
                        }
                        items(likedSongs) { track ->
                            SongRow(
                                track = track,
                                isCurrentTrack = currentTrack?.videoId == track.videoId,
                                isPlaying = isPlaying,
                                isLiked = true,
                                isDownloaded = viewModel.isDownloaded(track.videoId),
                                onClick = { viewModel.playTrack(track) },
                                onToggleLike = { viewModel.toggleLike(track) },
                                onToggleDownload = { viewModel.toggleDownload(track) },
                                onAddToPlaylist = { viewModel.trackForAddToPlaylist.value = track }
                            )
                        }
                    }
                }

                "artists" -> {
                    if (favoriteArtists.isEmpty()) {
                        item {
                            EmptyLibraryView(
                                title = "No Favorite Artists",
                                message = "Follow artists by tapping the star or favorite icon on their profiles."
                            )
                        }
                    } else {
                        items(favoriteArtists) { artist ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable { onNavigateToArtist(artist.artistId) }
                                    .testTag("fav_artist_${artist.artistId}"),
                                colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark)
                            ) {
                                Row(
                                    modifier = Modifier.padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    ArtistTile(
                                        artist = artist,
                                        onClick = { onNavigateToArtist(artist.artistId) },
                                        modifier = Modifier.size(64.dp)
                                    )
                                    Spacer(modifier = Modifier.width(16.dp))
                                    Column {
                                        Text(
                                            text = artist.name,
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = TextPrimary
                                        )
                                        if (artist.region != null) {
                                            Text(
                                                text = artist.region,
                                                style = MaterialTheme.typography.bodyMedium,
                                                color = TextSecondary
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                "history" -> {
                    if (history.isEmpty()) {
                        item {
                            EmptyLibraryView(
                                title = "No Listening History",
                                message = "Songs you play will appear here for easy playback."
                            )
                        }
                    } else {
                        items(history) { track ->
                            SongRow(
                                track = track,
                                isCurrentTrack = currentTrack?.videoId == track.videoId,
                                isPlaying = isPlaying,
                                isLiked = viewModel.isLiked(track.videoId),
                                isDownloaded = viewModel.isDownloaded(track.videoId),
                                onClick = { viewModel.playTrack(track) },
                                onToggleLike = { viewModel.toggleLike(track) },
                                onToggleDownload = { viewModel.toggleDownload(track) },
                                onAddToPlaylist = { viewModel.trackForAddToPlaylist.value = track }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun EmptyLibraryView(
    title: String,
    message: String,
    actionText: String? = null,
    onAction: (() -> Unit)? = null
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 48.dp, horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        if (actionText != null && onAction != null) {
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = onAction) {
                Text(actionText)
            }
        }
    }
}
