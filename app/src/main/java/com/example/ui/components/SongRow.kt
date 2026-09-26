package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.model.Track
import com.example.ui.theme.PrimaryNeon
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.TextTertiary

@Composable
fun SongRow(
    track: Track,
    isPlaying: Boolean = false,
    isCurrentTrack: Boolean = false,
    isLiked: Boolean = false,
    isDownloaded: Boolean = false,
    onClick: () -> Unit,
    onToggleLike: (() -> Unit)? = null,
    onToggleDownload: (() -> Unit)? = null,
    onAddToPlaylist: (() -> Unit)? = null,
    onRemove: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    var showMenu by remember { mutableStateOf(false) }

    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .padding(horizontal = 8.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Thumbnail
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant),
            contentAlignment = Alignment.Center
        ) {
            AsyncImage(
                model = track.thumbnail,
                contentDescription = track.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
            if (isCurrentTrack) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.background.copy(alpha = 0.6f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Default.VolumeUp else Icons.Default.PlayArrow,
                        contentDescription = "Current Track Indicator",
                        tint = PrimaryNeon,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        // Title and Artist
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = track.title,
                style = MaterialTheme.typography.titleMedium,
                color = if (isCurrentTrack) PrimaryNeon else TextPrimary,
                fontWeight = if (isCurrentTrack) FontWeight.Bold else FontWeight.Medium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = track.artist,
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }

        // Actions
        if (onToggleLike != null) {
            IconButton(
                onClick = onToggleLike,
                modifier = Modifier
                    .size(40.dp)
                    .testTag("like_button_${track.videoId}")
            ) {
                Icon(
                    imageVector = if (isLiked) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                    contentDescription = if (isLiked) "Unlike" else "Like",
                    tint = if (isLiked) PrimaryNeon else TextTertiary,
                    modifier = Modifier.size(20.dp)
                )
            }
        }

        // Duration or Overflow Menu
        Box {
            IconButton(
                onClick = { showMenu = true },
                modifier = Modifier
                    .size(40.dp)
                    .testTag("track_menu_button_${track.videoId}")
            ) {
                Icon(
                    imageVector = Icons.Default.MoreVert,
                    contentDescription = "More Options",
                    tint = TextSecondary,
                    modifier = Modifier.size(20.dp)
                )
            }

            DropdownMenu(
                expanded = showMenu,
                onDismissRequest = { showMenu = false }
            ) {
                if (onAddToPlaylist != null) {
                    DropdownMenuItem(
                        text = { Text("Add to playlist") },
                        leadingIcon = { Icon(Icons.Default.PlaylistAdd, contentDescription = null) },
                        onClick = {
                            showMenu = false
                            onAddToPlaylist()
                        }
                    )
                }
                if (onToggleDownload != null) {
                    DropdownMenuItem(
                        text = { Text(if (isDownloaded) "Remove download" else "Download offline") },
                        leadingIcon = {
                            Icon(
                                if (isDownloaded) Icons.Default.DownloadDone else Icons.Default.Download,
                                contentDescription = null
                            )
                        },
                        onClick = {
                            showMenu = false
                            onToggleDownload()
                        }
                    )
                }
                if (onRemove != null) {
                    DropdownMenuItem(
                        text = { Text("Remove from playlist") },
                        leadingIcon = { Icon(Icons.Default.Delete, contentDescription = null) },
                        onClick = {
                            showMenu = false
                            onRemove()
                        }
                    )
                }
            }
        }
    }
}
