package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.model.RepeatMode
import com.example.model.Track
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExpandedPlayerSheet(
    track: Track,
    isPlaying: Boolean,
    positionSeconds: Int,
    durationSeconds: Int,
    isLiked: Boolean,
    isDownloaded: Boolean,
    shuffle: Boolean,
    repeatMode: RepeatMode,
    onDismiss: () -> Unit,
    onPlayPause: () -> Unit,
    onNext: () -> Unit,
    onPrevious: () -> Unit,
    onSeek: (Int) -> Unit,
    onToggleLike: () -> Unit,
    onToggleDownload: () -> Unit,
    onToggleShuffle: () -> Unit,
    onCycleRepeat: () -> Unit,
    onOpenQueue: () -> Unit,
    onOpenLyrics: () -> Unit,
    onAddToPlaylist: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = BackgroundDark,
        dragHandle = {
            BottomSheetDefaults.DragHandle(color = TextTertiary)
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
                .padding(bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header: Collapse button and title
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier.size(48.dp).testTag("close_player_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = "Collapse Player",
                        tint = TextPrimary,
                        modifier = Modifier.size(32.dp)
                    )
                }

                Text(
                    text = "NOW PLAYING",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary,
                    fontWeight = FontWeight.Bold
                )

                IconButton(
                    onClick = onAddToPlaylist,
                    modifier = Modifier.size(48.dp).testTag("player_add_playlist_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.PlaylistAdd,
                        contentDescription = "Add to Playlist",
                        tint = TextPrimary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Big Artwork
            Box(
                modifier = Modifier
                    .size(280.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(SurfaceVariantDark),
                contentAlignment = Alignment.Center
            ) {
                AsyncImage(
                    model = track.thumbnail,
                    contentDescription = track.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Title & Artist + Like & Download
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = track.title,
                        style = MaterialTheme.typography.headlineSmall,
                        color = TextPrimary,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = track.artist,
                        style = MaterialTheme.typography.titleMedium,
                        color = TextSecondary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Row {
                    IconButton(
                        onClick = onToggleDownload,
                        modifier = Modifier.size(48.dp).testTag("player_download_button")
                    ) {
                        Icon(
                            imageVector = if (isDownloaded) Icons.Default.DownloadDone else Icons.Default.Download,
                            contentDescription = if (isDownloaded) "Downloaded" else "Download",
                            tint = if (isDownloaded) SecondaryTeal else TextTertiary
                        )
                    }

                    IconButton(
                        onClick = onToggleLike,
                        modifier = Modifier.size(48.dp).testTag("player_like_button")
                    ) {
                        Icon(
                            imageVector = if (isLiked) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = if (isLiked) "Unlike" else "Like",
                            tint = if (isLiked) PrimaryNeon else TextTertiary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Seekbar
            Column(modifier = Modifier.fillMaxWidth()) {
                val dur = if (durationSeconds > 0) durationSeconds else 180
                var isDragging by remember { mutableStateOf(false) }
                var dragPosition by remember { mutableFloatStateOf(0f) }

                Slider(
                    value = if (isDragging) dragPosition else positionSeconds.toFloat(),
                    onValueChange = {
                        isDragging = true
                        dragPosition = it
                    },
                    onValueChangeFinished = {
                        isDragging = false
                        onSeek(dragPosition.toInt())
                    },
                    valueRange = 0f..dur.toFloat(),
                    colors = SliderDefaults.colors(
                        thumbColor = PrimaryNeon,
                        activeTrackColor = PrimaryNeon,
                        inactiveTrackColor = SurfaceVariantDark
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("player_seek_slider")
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    val currentSec = if (isDragging) dragPosition.toInt() else positionSeconds
                    Text(
                        text = formatTime(currentSec),
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextTertiary
                    )
                    Text(
                        text = formatTime(dur),
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextTertiary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Main Playback Controls
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Shuffle
                IconButton(
                    onClick = onToggleShuffle,
                    modifier = Modifier.size(48.dp).testTag("player_shuffle_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Shuffle,
                        contentDescription = "Shuffle",
                        tint = if (shuffle) PrimaryNeon else TextTertiary
                    )
                }

                // Previous
                IconButton(
                    onClick = onPrevious,
                    modifier = Modifier.size(52.dp).testTag("player_prev_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.SkipPrevious,
                        contentDescription = "Previous",
                        tint = TextPrimary,
                        modifier = Modifier.size(36.dp)
                    )
                }

                // Play / Pause (Big Circular Button)
                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .clip(CircleShape)
                        .background(PrimaryNeon),
                    contentAlignment = Alignment.Center
                ) {
                    IconButton(
                        onClick = onPlayPause,
                        modifier = Modifier.size(68.dp).testTag("player_big_play_pause_button")
                    ) {
                        Icon(
                            imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = if (isPlaying) "Pause" else "Play",
                            tint = Color.Black,
                            modifier = Modifier.size(36.dp)
                        )
                    }
                }

                // Next
                IconButton(
                    onClick = onNext,
                    modifier = Modifier.size(52.dp).testTag("player_next_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.SkipNext,
                        contentDescription = "Next",
                        tint = TextPrimary,
                        modifier = Modifier.size(36.dp)
                    )
                }

                // Repeat
                IconButton(
                    onClick = onCycleRepeat,
                    modifier = Modifier.size(48.dp).testTag("player_repeat_button")
                ) {
                    Icon(
                        imageVector = when (repeatMode) {
                            RepeatMode.ONE -> Icons.Default.RepeatOne
                            RepeatMode.ALL -> Icons.Default.Repeat
                            RepeatMode.OFF -> Icons.Default.Repeat
                        },
                        contentDescription = "Repeat",
                        tint = if (repeatMode != RepeatMode.OFF) PrimaryNeon else TextTertiary
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Footer: Lyrics & Queue buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                OutlinedButton(
                    onClick = onOpenLyrics,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary),
                    modifier = Modifier.weight(1f).padding(end = 8.dp).testTag("player_lyrics_button")
                ) {
                    Icon(Icons.Default.Mic, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Lyrics")
                }

                OutlinedButton(
                    onClick = onOpenQueue,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary),
                    modifier = Modifier.weight(1f).padding(start = 8.dp).testTag("player_queue_button")
                ) {
                    Icon(Icons.Default.QueueMusic, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Queue")
                }
            }
        }
    }
}

fun formatTime(seconds: Int): String {
    val mins = seconds / 60
    val secs = seconds % 60
    return "$mins:${if (secs < 10) "0$secs" else secs}"
}
