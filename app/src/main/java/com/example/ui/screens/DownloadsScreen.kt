package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DownloadDone
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ui.MainViewModel
import com.example.ui.components.SongRow
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.SecondaryTeal
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun DownloadsScreen(viewModel: MainViewModel) {
    val downloads by viewModel.downloads.collectAsState()
    val currentTrack by viewModel.currentTrack.collectAsState()
    val isPlaying by viewModel.isPlaying.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.DownloadDone,
                    contentDescription = null,
                    tint = SecondaryTeal,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Offline Downloads",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary
                )
            }
            Text(
                text = "${downloads.size} tracks · Ready for offline playback",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        if (downloads.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = { viewModel.playTracks(downloads, 0) },
                    modifier = Modifier.weight(1f).testTag("play_all_downloads_button")
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Play All")
                }
                OutlinedButton(
                    onClick = { viewModel.shufflePlay(downloads) },
                    modifier = Modifier.weight(1f).testTag("shuffle_downloads_button")
                ) {
                    Icon(Icons.Default.Shuffle, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Shuffle")
                }
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 120.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            if (downloads.isEmpty()) {
                item {
                    EmptyLibraryView(
                        title = "No Downloads Saved",
                        message = "You can download any song to listen without an internet connection."
                    )
                }
            } else {
                items(downloads) { track ->
                    SongRow(
                        track = track,
                        isCurrentTrack = currentTrack?.videoId == track.videoId,
                        isPlaying = isPlaying,
                        isLiked = viewModel.isLiked(track.videoId),
                        isDownloaded = true,
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
