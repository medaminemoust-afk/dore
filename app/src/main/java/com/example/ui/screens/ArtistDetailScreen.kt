package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
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
import com.example.ui.components.AlbumCard
import com.example.ui.components.SongRow
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.PrimaryNeon
import com.example.ui.theme.SurfaceVariantDark
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.TextTertiary

@Composable
fun ArtistDetailScreen(
    artistId: String,
    viewModel: MainViewModel,
    onBack: () -> Unit,
    onNavigateToAlbum: (String) -> Unit
) {
    val artist = remember(artistId) {
        CatalogData.ARTISTS.firstOrNull { it.artistId == artistId }
            ?: CatalogData.ARTISTS.first()
    }

    val artistTracks = remember(artistId) {
        CatalogData.TRACKS.filter { it.artistId == artist.artistId || it.artist.contains(artist.name, ignoreCase = true) }
            .ifEmpty { CatalogData.TRACKS.take(4) }
    }

    val artistAlbums = remember(artistId) {
        CatalogData.ALBUMS.filter { it.subtitle.contains(artist.name, ignoreCase = true) }
    }

    val currentTrack by viewModel.currentTrack.collectAsState()
    val isPlaying by viewModel.isPlaying.collectAsState()
    val isFav = viewModel.isFavorite(artist.artistId)

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
                IconButton(onClick = onBack, modifier = Modifier.testTag("artist_back_button")) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = TextPrimary
                    )
                }
            }
        }

        // Hero header
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(160.dp)
                        .clip(CircleShape)
                        .background(SurfaceVariantDark),
                    contentAlignment = Alignment.Center
                ) {
                    AsyncImage(
                        model = artist.thumbnail,
                        contentDescription = artist.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = artist.name,
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary
                )

                if (artist.subtitle != null) {
                    Text(
                        text = artist.subtitle,
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }

                if (artist.bio != null) {
                    Text(
                        text = artist.bio,
                        style = MaterialTheme.typography.bodySmall,
                        color = TextTertiary,
                        modifier = Modifier.padding(top = 8.dp, start = 16.dp, end = 16.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Button(
                        onClick = { viewModel.playTracks(artistTracks, 0) },
                        modifier = Modifier.testTag("artist_play_all_button")
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Play Top Songs")
                    }

                    OutlinedButton(
                        onClick = { viewModel.toggleFavorite(artist) },
                        modifier = Modifier.testTag("artist_favorite_button")
                    ) {
                        Icon(
                            imageVector = if (isFav) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = null,
                            tint = if (isFav) PrimaryNeon else TextPrimary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (isFav) "Favorited" else "Favorite")
                    }
                }
            }
        }

        // Top Songs Section
        item {
            Text(
                text = "Popular Songs",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                modifier = Modifier.padding(start = 20.dp, top = 24.dp, bottom = 8.dp)
            )
        }

        items(artistTracks) { track ->
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

        // Albums Section
        if (artistAlbums.isNotEmpty()) {
            item {
                Text(
                    text = "Albums & Singles",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary,
                    modifier = Modifier.padding(start = 20.dp, top = 24.dp, bottom = 8.dp)
                )
            }
            item {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(artistAlbums) { album ->
                        AlbumCard(
                            album = album,
                            onClick = { onNavigateToAlbum(album.albumId) }
                        )
                    }
                }
            }
        }
    }
}
