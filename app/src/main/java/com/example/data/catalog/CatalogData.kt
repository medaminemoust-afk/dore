package com.example.data.catalog

import com.example.model.Album
import com.example.model.Artist
import com.example.model.GenreInfo
import com.example.model.LyricsLine
import com.example.model.RegionInfo
import com.example.model.Track

object CatalogData {

    val REGIONS = listOf(
        RegionInfo(
            id = "GLOBAL",
            label = "Global",
            emoji = "🌐",
            trendingQuery = "global top songs",
            artists = listOf("The Weeknd", "Bad Bunny", "Dua Lipa", "Burna Boy", "Taylor Swift", "BTS", "Ed Sheeran", "Rihanna", "Drake", "Karol G", "Coldplay", "Eminem")
        ),
        RegionInfo(
            id = "USA",
            label = "USA & Canada",
            emoji = "🇺🇸",
            trendingQuery = "top hits USA",
            artists = listOf("Drake", "Taylor Swift", "Kendrick Lamar", "The Weeknd", "Beyoncé", "SZA", "Travis Scott", "Billie Eilish", "Bruno Mars", "Post Malone", "Doja Cat", "Eminem")
        ),
        RegionInfo(
            id = "LATIN",
            label = "Latin America",
            emoji = "🌎",
            trendingQuery = "exitos latinos reggaeton",
            artists = listOf("Bad Bunny", "Karol G", "Peso Pluma", "Shakira", "Feid", "Rauw Alejandro", "Maluma", "J Balvin", "Anuel AA", "Rosalía", "Ozuna", "Grupo Frontera")
        ),
        RegionInfo(
            id = "EUROPE",
            label = "Europe",
            emoji = "🇪🇺",
            trendingQuery = "top hits Europe",
            artists = listOf("Ed Sheeran", "Dua Lipa", "Adele", "David Guetta", "Aya Nakamura", "Ninho", "Central Cee", "Måneskin", "Stromae", "Coldplay", "Rosalía", "Sfera Ebbasta")
        ),
        RegionInfo(
            id = "AFRICA",
            label = "Africa",
            emoji = "🌍",
            trendingQuery = "afrobeats hits",
            artists = listOf("Burna Boy", "Wizkid", "Davido", "Rema", "Tems", "Asake", "Ayra Starr", "Black Coffee", "Tyla", "Diamond Platnumz", "Fally Ipupa", "Amadou & Mariam")
        ),
        RegionInfo(
            id = "MENA",
            label = "North Africa & Middle East",
            emoji = "🌙",
            trendingQuery = "اغاني عربية 2025",
            artists = listOf("Saad Lamjarred", "ElGrandeToto", "Amr Diab", "Nancy Ajram", "Cheb Khaled", "Soolking", "Mohamed Ramadan", "Balti", "7-Toun", "Dystinct", "Cheb Mami", "Fairuz")
        ),
        RegionInfo(
            id = "ASIA",
            label = "Asia",
            emoji = "🌏",
            trendingQuery = "asian pop hits",
            artists = listOf("BTS", "BLACKPINK", "Arijit Singh", "NewJeans", "Jubin Nautiyal", "Stray Kids", "AR Rahman", "IU", "Diljit Dosanjh", "Anirudh Ravichander", "Yoasobi", "Sidhu Moose Wala")
        )
    )

    val GENRES = listOf(
        GenreInfo("pop", "Pop", "pop hits mix", "✨"),
        GenreInfo("hiphop", "Hip-Hop / Rap", "hip hop rap hits", "🎤"),
        GenreInfo("rnb", "R&B / Soul", "rnb soul mix", "💜"),
        GenreInfo("afrobeats", "Afrobeats", "afrobeats mix", "🥁"),
        GenreInfo("raiarab", "Rai & Arabic", "rai arabic music mix", "🌙"),
        GenreInfo("latin", "Latin / Reggaeton", "reggaeton latino mix", "💃"),
        GenreInfo("electronic", "Electronic / EDM", "edm electronic mix", "🎛️"),
        GenreInfo("rock", "Rock", "rock classics mix", "🎸"),
        GenreInfo("kpop", "K-Pop", "kpop hits mix", "🩷"),
        GenreInfo("chill", "Chill / Lofi", "lofi chill beats", "🌙"),
        GenreInfo("jazz", "Jazz", "smooth jazz mix", "🎷"),
        GenreInfo("classical", "Classical", "classical music mix", "🎻"),
        GenreInfo("amapiano", "Amapiano", "amapiano mix", "🔊"),
        GenreInfo("indie", "Indie", "indie hits mix", "🌿")
    )

    val ARTISTS = listOf(
        Artist(
            artistId = "the-weeknd",
            name = "The Weeknd",
            thumbnail = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
            region = "USA",
            subtitle = "Pop / R&B superstar",
            bio = "Abel Makkonen Tesfaye, known professionally as The Weeknd, is a Canadian singer, songwriter, and record producer known for his sonic versatility and dark lyricism."
        ),
        Artist(
            artistId = "bad-bunny",
            name = "Bad Bunny",
            thumbnail = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
            region = "LATIN",
            subtitle = "Latin Trap & Reggaeton Pioneer",
            bio = "Benito Antonio Martínez Ocasio, known professionally as Bad Bunny, is a Puerto Rican rapper, singer, and songwriter hailed as the King of Latin Trap."
        ),
        Artist(
            artistId = "burna-boy",
            name = "Burna Boy",
            thumbnail = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60",
            region = "AFRICA",
            subtitle = "African Giant · Afrofusion",
            bio = "Damini Ebunoluwa Ogulu, known professionally as Burna Boy, is a Nigerian singer, songwriter and record producer leading the global Afro-fusion movement."
        ),
        Artist(
            artistId = "dua-lipa",
            name = "Dua Lipa",
            thumbnail = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
            region = "EUROPE",
            subtitle = "Disco-pop Queen",
            bio = "Dua Lipa is an English and Albanian singer and songwriter possessing a mezzo-soprano vocal range and celebrated for her modern disco-pop records."
        ),
        Artist(
            artistId = "saad-lamjarred",
            name = "Saad Lamjarred",
            thumbnail = "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60",
            region = "MENA",
            subtitle = "Moroccan Pop Icon",
            bio = "Saad Lamjarred is a Moroccan pop singer-songwriter, multi-instrumentalist, dancer, singer and actor who redefined modern Arabic pop music across the globe."
        ),
        Artist(
            artistId = "elgrandetoto",
            name = "ElGrandeToto",
            thumbnail = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=60",
            region = "MENA",
            subtitle = "King of Maghreb Hip-Hop",
            bio = "Taha Fahssi, known as ElGrandeToto, is a Moroccan rapper who became the most streamed artist in the Arab world with chart-topping Moroccan Darija anthems."
        ),
        Artist(
            artistId = "bts",
            name = "BTS",
            thumbnail = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60",
            region = "ASIA",
            subtitle = "Global K-Pop Phenomenon",
            bio = "BTS is a South Korean boy band formed in 2010 that achieved unprecedented worldwide acclaim, bridging cultures through dynamic choreography and storytelling."
        ),
        Artist(
            artistId = "taylor-swift",
            name = "Taylor Swift",
            thumbnail = "https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=500&auto=format&fit=crop&q=60",
            region = "USA",
            subtitle = "Acclaimed Songwriter",
            bio = "Taylor Alison Swift is an American singer-songwriter whose narrative songwriting and genre transitions have earned unmatched commercial and critical milestones."
        )
    )

    val TRACKS = listOf(
        Track(
            videoId = "track-1",
            title = "Blinding Lights",
            artist = "The Weeknd",
            artistId = "the-weeknd",
            thumbnail = "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60",
            duration = 200,
            album = "After Hours"
        ),
        Track(
            videoId = "track-2",
            title = "Starboy",
            artist = "The Weeknd",
            artistId = "the-weeknd",
            thumbnail = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
            duration = 230,
            album = "Starboy"
        ),
        Track(
            videoId = "track-3",
            title = "Monaco",
            artist = "Bad Bunny",
            artistId = "bad-bunny",
            thumbnail = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
            duration = 267,
            album = "Nadie Sabe Lo Que Va a Pasar Mañana"
        ),
        Track(
            videoId = "track-4",
            title = "Tití Me Preguntó",
            artist = "Bad Bunny",
            artistId = "bad-bunny",
            thumbnail = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=60",
            duration = 243,
            album = "Un Verano Sin Ti"
        ),
        Track(
            videoId = "track-5",
            title = "City Boys",
            artist = "Burna Boy",
            artistId = "burna-boy",
            thumbnail = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=60",
            duration = 153,
            album = "I Told Them..."
        ),
        Track(
            videoId = "track-6",
            title = "Last Last",
            artist = "Burna Boy",
            artistId = "burna-boy",
            thumbnail = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=60",
            duration = 175,
            album = "Love, Damini"
        ),
        Track(
            videoId = "track-7",
            title = "Houdini",
            artist = "Dua Lipa",
            artistId = "dua-lipa",
            thumbnail = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
            duration = 186,
            album = "Radical Optimism"
        ),
        Track(
            videoId = "track-8",
            title = "Levitating",
            artist = "Dua Lipa",
            artistId = "dua-lipa",
            thumbnail = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60",
            duration = 203,
            album = "Future Nostalgia"
        ),
        Track(
            videoId = "track-9",
            title = "Lm3allem",
            artist = "Saad Lamjarred",
            artistId = "saad-lamjarred",
            thumbnail = "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60",
            duration = 245,
            album = "Single"
        ),
        Track(
            videoId = "track-10",
            title = "Love Nwantiti",
            artist = "ElGrandeToto",
            artistId = "elgrandetoto",
            thumbnail = "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60",
            duration = 192,
            album = "Caméléon"
        ),
        Track(
            videoId = "track-11",
            title = "Dynamite",
            artist = "BTS",
            artistId = "bts",
            thumbnail = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60",
            duration = 199,
            album = "BE"
        ),
        Track(
            videoId = "track-12",
            title = "Cruel Summer",
            artist = "Taylor Swift",
            artistId = "taylor-swift",
            thumbnail = "https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=500&auto=format&fit=crop&q=60",
            duration = 178,
            album = "Lover"
        )
    )

    val ALBUMS = listOf(
        Album(
            albumId = "album-after-hours",
            title = "After Hours",
            subtitle = "The Weeknd · 2020",
            thumbnail = "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60",
            tracks = listOf(TRACKS[0], TRACKS[1]),
            year = "2020"
        ),
        Album(
            albumId = "album-un-verano",
            title = "Un Verano Sin Ti",
            subtitle = "Bad Bunny · 2022",
            thumbnail = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
            tracks = listOf(TRACKS[2], TRACKS[3]),
            year = "2022"
        ),
        Album(
            albumId = "album-future-nostalgia",
            title = "Future Nostalgia",
            subtitle = "Dua Lipa · 2020",
            thumbnail = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
            tracks = listOf(TRACKS[6], TRACKS[7]),
            year = "2020"
        )
    )

    fun getLyrics(track: Track): List<LyricsLine> {
        return listOf(
            LyricsLine(0L, "[Instrumental Intro]"),
            LyricsLine(12000L, "Yeah, here we go into the sound..."),
            LyricsLine(25000L, "I've been on my own for long enough"),
            LyricsLine(38000L, "Maybe you can show me how to love, maybe"),
            LyricsLine(52000L, "I'm going through withdrawals"),
            LyricsLine(64000L, "You don't even have to do too much"),
            LyricsLine(78000L, "You can turn me on with just a touch, baby"),
            LyricsLine(92000L, "I look around and Sin City's cold and empty"),
            LyricsLine(105000L, "No one's around to judge me"),
            LyricsLine(118000L, "I can't see clearly when you're gone"),
            LyricsLine(132000L, "I said, ooh, I'm blinded by the lights"),
            LyricsLine(146000L, "No, I can't sleep until I feel your touch"),
            LyricsLine(160000L, "I said, ooh, I'm drowning in the night"),
            LyricsLine(175000L, "Oh, when I'm like this, you're the one I trust"),
            LyricsLine(190000L, "[Music continues with vibrant beats]")
        )
    }
}
