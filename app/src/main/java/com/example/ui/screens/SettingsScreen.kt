package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.RestartAlt
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
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.PrimaryNeon
import com.example.ui.theme.SurfaceVariantDark
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun SettingsScreen(
    viewModel: MainViewModel,
    onRestartOnboarding: () -> Unit
) {
    val preferences by viewModel.preferences.collectAsState()
    val downloads by viewModel.downloads.collectAsState()
    val likedSongs by viewModel.likedSongs.collectAsState()
    val playlists by viewModel.playlists.collectAsState()

    var currentLang by remember(preferences) {
        mutableStateOf(preferences?.language ?: "en")
    }
    var currentRegion by remember(preferences) {
        mutableStateOf(preferences?.region ?: "GLOBAL")
    }

    val languages = listOf(
        "en" to "English (US)",
        "ar" to "العربية (Arabic)",
        "fr" to "Français (French)",
        "es" to "Español (Spanish)"
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark),
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 16.dp, bottom = 120.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Settings",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Black,
                color = TextPrimary
            )
        }

        // Language Section
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Language, contentDescription = null, tint = PrimaryNeon)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Language",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))

                    languages.forEach { (code, name) ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .clickable {
                                    currentLang = code
                                    viewModel.savePreferences(
                                        code,
                                        currentRegion,
                                        preferences?.genresCsv?.split(",") ?: emptyList(),
                                        true
                                    )
                                }
                                .padding(vertical = 10.dp, horizontal = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = currentLang == code,
                                onClick = {
                                    currentLang = code
                                    viewModel.savePreferences(
                                        code,
                                        currentRegion,
                                        preferences?.genresCsv?.split(",") ?: emptyList(),
                                        true
                                    )
                                },
                                colors = RadioButtonDefaults.colors(selectedColor = PrimaryNeon),
                                modifier = Modifier.testTag("lang_radio_$code")
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(name, color = TextPrimary)
                        }
                    }
                }
            }
        }

        // Region Section
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Public, contentDescription = null, tint = PrimaryNeon)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Music Streaming Region",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))

                    CatalogData.REGIONS.forEach { r ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .clickable {
                                    currentRegion = r.id
                                    viewModel.setRegion(r.id)
                                    viewModel.savePreferences(
                                        currentLang,
                                        r.id,
                                        preferences?.genresCsv?.split(",") ?: emptyList(),
                                        true
                                    )
                                }
                                .padding(vertical = 8.dp, horizontal = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = currentRegion == r.id,
                                onClick = {
                                    currentRegion = r.id
                                    viewModel.setRegion(r.id)
                                    viewModel.savePreferences(
                                        currentLang,
                                        r.id,
                                        preferences?.genresCsv?.split(",") ?: emptyList(),
                                        true
                                    )
                                },
                                colors = RadioButtonDefaults.colors(selectedColor = PrimaryNeon),
                                modifier = Modifier.testTag("region_radio_${r.id}")
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("${r.emoji} ${r.label}", color = TextPrimary)
                        }
                    }
                }
            }
        }

        // Library Stats
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Storage & Statistics",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Playlists: ${playlists.size}", color = TextSecondary)
                    Text("Liked Songs: ${likedSongs.size}", color = TextSecondary)
                    Text("Offline Tracks: ${downloads.size}", color = TextSecondary)
                }
            }
        }

        // Restart Onboarding
        item {
            OutlinedButton(
                onClick = onRestartOnboarding,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("restart_onboarding_button")
            ) {
                Icon(Icons.Default.RestartAlt, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Re-run Onboarding Setup")
            }
        }
    }
}
