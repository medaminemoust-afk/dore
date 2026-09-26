package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.data.catalog.CatalogData
import com.example.ui.MainViewModel
import com.example.ui.components.SongRow
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.SurfaceVariantDark
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun AlbumDetailScreen(
    albumId: String,
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val album = remember(albumId) {
        CatalogData.ALBUMS.firstOrNull { it.albumId == albumId } ?: CatalogData.ALBUMS.first()
    }

    val currentTrack by viewModel.currentTrack.collectAsState()
    val isPlaying by viewModel.isPlaying.collectAsState()

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
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack, modifier = Modifier.testTag("album_back_button")) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = TextPrimary
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
                        .size(200.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(SurfaceVariantDark)
                ) {
                    AsyncImage(
                        model = album.thumbnail,
                        contentDescription = album.title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = album.title,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary
                )

                Text(
                    text = "${album.subtitle} · ${album.tracks.size} tracks",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary,
                    modifier = Modifier.padding(top = 4.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Button(
                        onClick = { viewModel.playTracks(album.tracks, 0) },
                        modifier = Modifier.testTag("album_play_all_button")
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Play All")
                    }

                    OutlinedButton(
                        onClick = { viewModel.shufflePlay(album.tracks) },
                        modifier = Modifier.testTag("album_shuffle_button")
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

        items(album.tracks) { track ->
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
                    onAddToPlaylist = { viewModel.trackForAddToPlaylist.value = track }
                )
            }
        }
    }
}
