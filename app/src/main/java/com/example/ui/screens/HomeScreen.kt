package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.catalog.CatalogData
import com.example.model.Album
import com.example.model.Artist
import com.example.model.Track
import com.example.ui.MainViewModel
import com.example.ui.components.AlbumCard
import com.example.ui.components.ArtistTile
import com.example.ui.components.Shelf
import com.example.ui.components.SongCard
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.PrimaryNeon
import com.example.ui.theme.SurfaceVariantDark
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun HomeScreen(
    viewModel: MainViewModel,
    onNavigateToArtist: (String) -> Unit,
    onNavigateToAlbum: (String) -> Unit,
    onNavigateToSearchWithGenre: (String) -> Unit
) {
    val selectedRegion by viewModel.selectedRegion.collectAsState()
    val history by viewModel.history.collectAsState()

    val currentRegionInfo = remember(selectedRegion) {
        CatalogData.REGIONS.firstOrNull { it.id == selectedRegion } ?: CatalogData.REGIONS.first()
    }

    val regionalArtists = remember(selectedRegion) {
        val names = currentRegionInfo.artists
        CatalogData.ARTISTS.filter { it.name in names || it.region == selectedRegion }
            .ifEmpty { CatalogData.ARTISTS }
    }

    val trendingTracks = remember(selectedRegion) {
        val regionArtistIds = regionalArtists.map { it.artistId }.toSet()
        val match = CatalogData.TRACKS.filter { it.artistId in regionArtistIds }
        if (match.isNotEmpty()) match else CatalogData.TRACKS
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark),
        contentPadding = PaddingValues(bottom = 120.dp)
    ) {
        // App Header
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "InnerSound",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Black,
                        color = TextPrimary
                    )
                    Text(
                        text = "Your music, your region, your vibe.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                }
            }
        }

        // Region selector chips
        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                items(CatalogData.REGIONS) { r ->
                    val isSelected = r.id == selectedRegion
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.setRegion(r.id) },
                        label = {
                            Text("${r.emoji} ${r.label}")
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryNeon,
                            selectedLabelColor = BackgroundDark,
                            containerColor = SurfaceVariantDark,
                            labelColor = TextPrimary
                        ),
                        modifier = Modifier.testTag("region_chip_${r.id}")
                    )
                }
            }
        }

        // Trending Tracks Shelf
        item {
            Shelf(
                title = "Trending Now",
                subtitle = "${currentRegionInfo.emoji} ${currentRegionInfo.label} · ${currentRegionInfo.trendingQuery}",
                items = trendingTracks
            ) { track ->
                SongCard(
                    track = track,
                    onClick = { viewModel.playTrack(track) }
                )
            }
        }

        // Top Regional Artists Shelf
        item {
            Shelf(
                title = "Top Artists",
                subtitle = "Popular in ${currentRegionInfo.label}",
                items = regionalArtists
            ) { artist ->
                ArtistTile(
                    artist = artist,
                    onClick = { onNavigateToArtist(artist.artistId) }
                )
            }
        }

        // Recently Played Shelf (if any)
        if (history.isNotEmpty()) {
            item {
                Shelf(
                    title = "Recently Played",
                    subtitle = "Jump back in",
                    items = history.take(10)
                ) { track ->
                    SongCard(
                        track = track,
                        onClick = { viewModel.playTrack(track) }
                    )
                }
            }
        }

        // Featured Albums Shelf
        item {
            Shelf(
                title = "Featured Albums",
                subtitle = "Handpicked records",
                items = CatalogData.ALBUMS
            ) { album ->
                AlbumCard(
                    album = album,
                    onClick = { onNavigateToAlbum(album.albumId) }
                )
            }
        }

        // Explore Genres Shelf
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Text(
                    text = "Explore Styles",
                    style = MaterialTheme.typography.headlineSmall,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(12.dp))

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(CatalogData.GENRES) { genre ->
                        Card(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { onNavigateToSearchWithGenre(genre.id) }
                                .testTag("genre_card_${genre.id}"),
                            colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = genre.emoji, fontSize = 20.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = genre.label,
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
}
