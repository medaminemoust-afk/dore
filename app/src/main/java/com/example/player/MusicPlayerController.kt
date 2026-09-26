package com.example.player

import com.example.data.catalog.CatalogData
import com.example.model.LyricsLine
import com.example.model.RepeatMode
import com.example.model.Track
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class MusicPlayerController(
    private val scope: CoroutineScope,
    private val onTrackPlayed: (Track) -> Unit
) {

    private val _currentTrack = MutableStateFlow<Track?>(null)
    val currentTrack: StateFlow<Track?> = _currentTrack.asStateFlow()

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _playbackPosition = MutableStateFlow(0)
    val playbackPosition: StateFlow<Int> = _playbackPosition.asStateFlow()

    private val _duration = MutableStateFlow(180)
    val duration: StateFlow<Int> = _duration.asStateFlow()

    private val _queue = MutableStateFlow<List<Track>>(emptyList())
    val queue: StateFlow<List<Track>> = _queue.asStateFlow()

    private val _currentIndex = MutableStateFlow(0)
    val currentIndex: StateFlow<Int> = _currentIndex.asStateFlow()

    private val _shuffle = MutableStateFlow(false)
    val shuffle: StateFlow<Boolean> = _shuffle.asStateFlow()

    private val _repeatMode = MutableStateFlow(RepeatMode.OFF)
    val repeatMode: StateFlow<RepeatMode> = _repeatMode.asStateFlow()

    private val _lyrics = MutableStateFlow<List<LyricsLine>>(emptyList())
    val lyrics: StateFlow<List<LyricsLine>> = _lyrics.asStateFlow()

    private var progressJob: Job? = null

    fun playTracks(tracks: List<Track>, startIndex: Int = 0, autoPlay: Boolean = true) {
        if (tracks.isEmpty()) return
        val validIndex = startIndex.coerceIn(0, tracks.lastIndex)
        _queue.value = tracks
        _currentIndex.value = validIndex
        loadTrack(tracks[validIndex], autoPlay)
    }

    fun playTrack(track: Track) {
        val currentQueue = _queue.value.toMutableList()
        val existingIndex = currentQueue.indexOfFirst { it.videoId == track.videoId }
        if (existingIndex >= 0) {
            _currentIndex.value = existingIndex
            loadTrack(track, true)
        } else {
            currentQueue.add(track)
            _queue.value = currentQueue
            _currentIndex.value = currentQueue.lastIndex
            loadTrack(track, true)
        }
    }

    private fun loadTrack(track: Track, autoPlay: Boolean) {
        _currentTrack.value = track
        _playbackPosition.value = 0
        _duration.value = if (track.duration > 0) track.duration else 180
        _lyrics.value = CatalogData.getLyrics(track)
        onTrackPlayed(track)
        if (autoPlay) {
            _isPlaying.value = true
            startProgressTicker()
        } else {
            _isPlaying.value = false
            stopProgressTicker()
        }
    }

    fun togglePlayPause() {
        if (_currentTrack.value == null && _queue.value.isNotEmpty()) {
            loadTrack(_queue.value.first(), true)
            return
        }
        val willPlay = !_isPlaying.value
        _isPlaying.value = willPlay
        if (willPlay) {
            startProgressTicker()
        } else {
            stopProgressTicker()
        }
    }

    fun next() {
        val q = _queue.value
        if (q.isEmpty()) return

        if (_repeatMode.value == RepeatMode.ONE) {
            _playbackPosition.value = 0
            return
        }

        val nextIndex = if (_shuffle.value) {
            (0 until q.size).random()
        } else {
            val idx = _currentIndex.value + 1
            if (idx >= q.size) {
                if (_repeatMode.value == RepeatMode.ALL) 0 else return
            } else {
                idx
            }
        }

        _currentIndex.value = nextIndex
        loadTrack(q[nextIndex], true)
    }

    fun previous() {
        val q = _queue.value
        if (q.isEmpty()) return

        if (_playbackPosition.value > 3) {
            _playbackPosition.value = 0
            return
        }

        val prevIndex = (_currentIndex.value - 1).coerceAtLeast(0)
        _currentIndex.value = prevIndex
        loadTrack(q[prevIndex], true)
    }

    fun seekTo(seconds: Int) {
        _playbackPosition.value = seconds.coerceIn(0, _duration.value)
    }

    fun toggleShuffle() {
        _shuffle.value = !_shuffle.value
    }

    fun cycleRepeat() {
        _repeatMode.value = when (_repeatMode.value) {
            RepeatMode.OFF -> RepeatMode.ALL
            RepeatMode.ALL -> RepeatMode.ONE
            RepeatMode.ONE -> RepeatMode.OFF
        }
    }

    fun addToQueue(track: Track) {
        _queue.value = _queue.value + track
    }

    fun addNext(track: Track) {
        val currentQueue = _queue.value.toMutableList()
        val insertIndex = (_currentIndex.value + 1).coerceAtMost(currentQueue.size)
        currentQueue.add(insertIndex, track)
        _queue.value = currentQueue
    }

    fun removeFromQueue(index: Int) {
        val currentQueue = _queue.value.toMutableList()
        if (index in currentQueue.indices) {
            currentQueue.removeAt(index)
            _queue.value = currentQueue
            if (index < _currentIndex.value) {
                _currentIndex.value = (_currentIndex.value - 1).coerceAtLeast(0)
            }
        }
    }

    private fun startProgressTicker() {
        progressJob?.cancel()
        progressJob = scope.launch(Dispatchers.Main) {
            while (isActive && _isPlaying.value) {
                delay(1000L)
                val current = _playbackPosition.value
                val dur = _duration.value
                if (current + 1 >= dur) {
                    next()
                } else {
                    _playbackPosition.value = current + 1
                }
            }
        }
    }

    private fun stopProgressTicker() {
        progressJob?.cancel()
        progressJob = null
    }
}
