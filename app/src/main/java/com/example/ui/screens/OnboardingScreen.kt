package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.MusicNote
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
import com.example.model.Artist
import com.example.ui.MainViewModel
import com.example.ui.components.ArtistTile
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.PrimaryNeon
import com.example.ui.theme.SurfaceVariantDark
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.TextTertiary

@Composable
fun OnboardingScreen(
    viewModel: MainViewModel,
    onFinish: () -> Unit
) {
    var step by remember { mutableIntStateOf(1) } // 1: Language & Region, 2: Genres & Artists

    var selectedLang by remember { mutableStateOf("en") }
    var selectedRegion by remember { mutableStateOf("GLOBAL") }
    val selectedGenres = remember { mutableStateListOf<String>() }
    val selectedArtists = remember { mutableStateListOf<String>() }

    val languages = listOf(
        "en" to "English (US)",
        "ar" to "العربية (Arabic)",
        "fr" to "Français (French)",
        "es" to "Español (Spanish)"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(horizontal = 24.dp, vertical = 20.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            // Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 16.dp, bottom = 8.dp)
            ) {
                Icon(Icons.Default.MusicNote, contentDescription = null, tint = PrimaryNeon, modifier = Modifier.size(32.dp))
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "Welcome to InnerSound",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Black,
                    color = TextPrimary
                )
            }

            Text(
                text = if (step == 1) "Personalize your language and streaming region." else "Select styles and artists to tune your feed.",
                style = MaterialTheme.typography.bodyMedium,
                color = TextSecondary,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            if (step == 1) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Text("1. Choose your language", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Spacer(modifier = Modifier.height(8.dp))
                        languages.forEach { (code, name) ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable { selectedLang = code }
                                    .testTag("onboard_lang_$code"),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (selectedLang == code) PrimaryNeon.copy(alpha = 0.2f) else SurfaceVariantDark
                                )
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(name, color = TextPrimary, fontWeight = FontWeight.Medium)
                                    if (selectedLang == code) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = PrimaryNeon)
                                    }
                                }
                            }
                        }
                    }

                    item {
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("2. Choose your music region", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Spacer(modifier = Modifier.height(8.dp))
                        CatalogData.REGIONS.forEach { r ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable { selectedRegion = r.id }
                                    .testTag("onboard_region_${r.id}"),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (selectedRegion == r.id) PrimaryNeon.copy(alpha = 0.2f) else SurfaceVariantDark
                                )
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("${r.emoji}  ${r.label}", color = TextPrimary, fontWeight = FontWeight.Medium)
                                    if (selectedRegion == r.id) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = PrimaryNeon)
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                // Step 2: Genres & Artists
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Text("Which styles do you like?", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Spacer(modifier = Modifier.height(8.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            CatalogData.GENRES.chunked(2).forEach { row ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    row.forEach { g ->
                                        val isSelected = g.id in selectedGenres
                                        Card(
                                            modifier = Modifier
                                                .weight(1f)
                                                .height(52.dp)
                                                .clip(RoundedCornerShape(12.dp))
                                                .clickable {
                                                    if (isSelected) selectedGenres.remove(g.id) else selectedGenres.add(g.id)
                                                }
                                                .testTag("onboard_genre_${g.id}"),
                                            colors = CardDefaults.cardColors(
                                                containerColor = if (isSelected) PrimaryNeon.copy(alpha = 0.25f) else SurfaceVariantDark
                                            )
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
                                                    style = MaterialTheme.typography.bodyMedium,
                                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                                    color = if (isSelected) PrimaryNeon else TextPrimary
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    item {
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Pick artists you love", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Spacer(modifier = Modifier.height(8.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            CatalogData.ARTISTS.forEach { artist ->
                                val isSelected = artist.artistId in selectedArtists
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .clickable {
                                            if (isSelected) selectedArtists.remove(artist.artistId) else selectedArtists.add(artist.artistId)
                                        }
                                        .testTag("onboard_artist_${artist.artistId}"),
                                    colors = CardDefaults.cardColors(
                                        containerColor = if (isSelected) PrimaryNeon.copy(alpha = 0.2f) else SurfaceVariantDark
                                    )
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(artist.name, color = TextPrimary, fontWeight = FontWeight.Medium)
                                        if (isSelected) {
                                            Icon(Icons.Default.Check, contentDescription = null, tint = PrimaryNeon)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Action Buttons
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (step == 2) {
                OutlinedButton(
                    onClick = { step = 1 },
                    modifier = Modifier.weight(1f).testTag("onboard_back_button")
                ) {
                    Text("Back")
                }
            }

            Button(
                onClick = {
                    if (step == 1) {
                        step = 2
                    } else {
                        // Save and finish
                        viewModel.setRegion(selectedRegion)
                        viewModel.savePreferences(
                            selectedLang,
                            selectedRegion,
                            selectedGenres.toList(),
                            true
                        )
                        // Add selected artists to favorites
                        selectedArtists.forEach { id ->
                            val a = CatalogData.ARTISTS.firstOrNull { it.artistId == id }
                            if (a != null) viewModel.toggleFavorite(a)
                        }
                        onFinish()
                    }
                },
                modifier = Modifier.weight(1f).testTag("onboard_continue_button")
            ) {
                Text(if (step == 1) "Continue" else "Start Listening")
            }
        }
    }
}
