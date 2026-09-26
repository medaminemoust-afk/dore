package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
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
import com.example.model.Track
import com.example.ui.MainViewModel
import com.example.ui.components.SongRow
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.PrimaryNeon
import com.example.ui.theme.SurfaceVariantDark
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun PlaylistDetailScreen(
    playlistId: String,
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val playlists by viewModel.playlists.collectAsState()
    val playlist = remember(playlistId, playlists) {
        playlists.firstOrNull { it.id == playlistId }
    }

    val tracksState = remember(playlistId) {
        viewModel.getPlaylistTracks(playlistId)
    }.collectAsState(initial = emptyList())

    val tracks = tracksState.value
    val currentTrack by viewModel.currentTrack.collectAsState()
    val isPlaying by viewModel.isPlaying.collectAsState()

    var showDeleteConfirm by remember { mutableStateOf(false) }

    if (playlist == null) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(BackgroundDark),
            contentAlignment = Alignment.Center
        ) {
            Text("Playlist not found", color = TextSecondary)
        }
        return
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("Delete Playlist?", color = TextPrimary) },
            text = { Text("Are you sure you want to delete \"${playlist.name}\"?", color = TextSecondary) },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteConfirm = false
                        viewModel.deletePlaylist(playlist.id)
                        onBack()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark),
        contentPadding = PaddingValues(bottom = 120.dp)
    ) {
        // App bar
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack, modifier = Modifier.testTag("playlist_back_button")) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = TextPrimary
                    )
                }

                IconButton(
                    onClick = { showDeleteConfirm = true },
                    modifier = Modifier.testTag("playlist_delete_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete Playlist",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }
        }

        // Header
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(180.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(SurfaceVariantDark),
                    contentAlignment = Alignment.Center
                ) {
                    if (playlist.cover != null) {
                        AsyncImage(
                            model = playlist.cover,
                            contentDescription = playlist.name,
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.PlaylistPlay,
                            contentDescription = null,
                            tint = PrimaryNeon,
                            modifier = Modifier.size(64.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = playlist.name,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary
                )

                if (playlist.description.isNotEmpty()) {
                    Text(
                        text = playlist.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }

                Text(
                    text = "${tracks.size} tracks",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                    modifier = Modifier.padding(top = 4.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Button(
                        onClick = { viewModel.playTracks(tracks, 0) },
                        enabled = tracks.isNotEmpty(),
                        modifier = Modifier.testTag("playlist_play_all_button")
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Play All")
                    }

                    OutlinedButton(
                        onClick = { viewModel.shufflePlay(tracks) },
                        enabled = tracks.isNotEmpty(),
                        modifier = Modifier.testTag("playlist_shuffle_button")
                    ) {
                        Icon(Icons.Default.Shuffle, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Shuffle")
                    }
                }
            }
        }

        item {
            Text(
                text = "Tracks",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                modifier = Modifier.padding(start = 20.dp, top = 24.dp, bottom = 8.dp)
            )
        }

        if (tracks.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No tracks in this playlist yet. Add songs from Search or Home!", color = TextSecondary)
                }
            }
        } else {
            items(tracks) { track ->
                Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                    SongRow(
                        track = track,
                        isCurrentTrack = currentTrack?.videoId == track.videoId,
                        isPlaying = isPlaying,
                        isLiked = viewModel.isLiked(track.videoId),
                        isDownloaded = viewModel.isDownloaded(track.videoId),
                        onClick = { viewModel.playTrack(track) },
                        onToggleLike = { viewModel.toggleLike(track) },
                        onToggleDownload = { viewModel.toggleDownload(track) },
                        onRemove = { viewModel.removeFromPlaylist(playlist.id, track.videoId) }
                    )
                }
            }
        }
    }
}
