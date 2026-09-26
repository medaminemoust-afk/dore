package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.catalog.CatalogData
import com.example.ui.MainViewModel
import com.example.ui.components.AlbumCard
import com.example.ui.components.ArtistTile
import com.example.ui.components.SongRow
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.PrimaryNeon
import com.example.ui.theme.SurfaceVariantDark
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun SearchScreen(
    viewModel: MainViewModel,
    initialQuery: String = "",
    onNavigateToArtist: (String) -> Unit,
    onNavigateToAlbum: (String) -> Unit
) {
    val searchQuery by viewModel.searchQuery.collectAsState()
    val searchTab by viewModel.searchTab.collectAsState()
    val searchResults by viewModel.searchResults.collectAsState()
    val currentTrack by viewModel.currentTrack.collectAsState()
    val isPlaying by viewModel.isPlaying.collectAsState()

    LaunchedEffect(initialQuery) {
        if (initialQuery.isNotEmpty()) {
            viewModel.onSearchQueryChanged(initialQuery)
        }
    }

    val (songs, artists, albums) = searchResults

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
    ) {
        // Search bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { viewModel.onSearchQueryChanged(it) },
            placeholder = { Text("Songs, artists, albums…") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextSecondary) },
            trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = { viewModel.onSearchQueryChanged("") }) {
                        Icon(Icons.Default.Clear, contentDescription = "Clear search", tint = TextSecondary)
                    }
                }
            },
            shape = RoundedCornerShape(24.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = SurfaceVariantDark,
                unfocusedContainerColor = SurfaceVariantDark,
                focusedBorderColor = PrimaryNeon,
                unfocusedBorderColor = SurfaceVariantDark
            ),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
                .testTag("search_input_field")
        )

        // Filter tabs
        val tabs = listOf("all" to "All", "songs" to "Songs", "artists" to "Artists", "albums" to "Albums")
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.padding(bottom = 8.dp)
        ) {
            items(tabs) { (id, label) ->
                FilterChip(
                    selected = searchTab == id,
                    onClick = { viewModel.setSearchTab(id) },
                    label = { Text(label) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = PrimaryNeon,
                        selectedLabelColor = BackgroundDark,
                        containerColor = SurfaceVariantDark,
                        labelColor = TextPrimary
                    ),
                    modifier = Modifier.testTag("search_tab_$id")
                )
            }
        }

        // Search Results / Explorer
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 120.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // If empty search query, display popular genres
            if (searchQuery.isEmpty()) {
                item {
                    Text(
                        text = "Browse Genres",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary,
                        modifier = Modifier.padding(vertical = 12.dp)
                    )
                }

                item {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        CatalogData.GENRES.chunked(2).forEach { rowGenres ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                rowGenres.forEach { g ->
                                    Card(
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(56.dp)
                                            .clip(RoundedCornerShape(12.dp))
                                            .clickable { viewModel.onSearchQueryChanged(g.label) },
                                        colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark)
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxSize()
                                                .padding(horizontal = 12.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(g.emoji)
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = g.label,
                                                style = MaterialTheme.typography.titleMedium,
                                                color = TextPrimary,
                                                fontWeight = FontWeight.SemiBold
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                // Artists section in search
                if ((searchTab == "all" || searchTab == "artists") && artists.isNotEmpty()) {
                    item {
                        Text(
                            text = "Artists",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            modifier = Modifier.padding(top = 12.dp, bottom = 4.dp)
                        )
                    }
                    item {
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            items(artists) { artist ->
                                ArtistTile(
                                    artist = artist,
                                    onClick = { onNavigateToArtist(artist.artistId) }
                                )
                            }
                        }
                    }
                }

                // Albums section in search
                if ((searchTab == "all" || searchTab == "albums") && albums.isNotEmpty()) {
                    item {
                        Text(
                            text = "Albums",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            modifier = Modifier.padding(top = 12.dp, bottom = 4.dp)
                        )
                    }
                    item {
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            items(albums) { album ->
                                AlbumCard(
                                    album = album,
                                    onClick = { onNavigateToAlbum(album.albumId) }
                                )
                            }
                        }
                    }
                }

                // Songs section in search
                if (searchTab == "all" || searchTab == "songs") {
                    item {
                        Text(
                            text = "Songs",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            modifier = Modifier.padding(top = 12.dp, bottom = 4.dp)
                        )
                    }
                    items(songs) { track ->
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

                if (songs.isEmpty() && artists.isEmpty() && albums.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 48.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "No results found for \"$searchQuery\"",
                                color = TextSecondary
                            )
                        }
                    }
                }
            }
        }
    }
}
