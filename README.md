# AutoDL

An media manager made to work with jellyfin via. NFO metadata!

## Made with...

1. [SvelteKit](https://svelte.dev/) for Front/Back-end
2. [Typescript](https://www.typescriptlang.org/) for everything that would be javascript
3. [TailwindCSS](https://tailwindcss.com/) for... CSS!
4. [fast-xml-parser](https://www.npmjs.com/package/fast-xml-parser) for XML parsing (NFO files are in XML format)
5. [music-metadata](https://www.npmjs.com/package/music-metadata) to get metadata from mp3 files :O
6. [realtimecolors](https://www.realtimecolors.com/?colors=050315-fbfbfe-2f27ce-dedcff-433bff&fonts=Inter-Inter) for the color theme
7. Google [Fonts & Icons](https://fonts.google.com/)
8. [SCSS](https://sass-lang.com/documentation/syntax/) for styles
9. [ytdlp](https://github.com/yt-dlp/yt-dlp) & [spotdl](https://github.com/spotDL/spotify-downloader) for downloading
10. ❤️

## Features

1. ytdlp
   ..download video
   ..download playlist
2. spotdl
   ..download song
   ..download playlist
   ..sync playlist
3. create NFO files out of thin air
4. delete things
5. live display of running tasks
6. Docker
7. Mobile
8. Made to work with jellyfin
9. Edit Metadata & Lyrics
10. Reordering of Episodes and Seasons

## Filesystem

```
.
├── data/       .............................persistent non media data
│   └── password       ......................write your password in here
├── web/       ..............................the server and frontend ..sveltekit project
├── storage/       ..........................this folder needs to be accessible by jellyfin
│   ├── music/       ........................add with library type: Albums
│   │   ├── playlist-1/       ...............name of your playlist
│   │   │   ├── album.nfo       .............metadata for the playlist
│   │   │   ├── episode1.mp3       ..........episode
│   │   │   ├── episode2.mp3       ..........episode
│   │   │   └── ...       ...................what ever else you will have here
│   │   ├── playlist-2/       ...............name of your playlist
│   │   │   └── ...       ...................what ever else you will have here
│   │   └── ...       .......................more playlists
│   ├── podcast/       ......................add with library type: albums
│   │   ├── podcast-1/       ................podcast ..just like a playlist
│   │   │   ├── album.nfo       .............metadata for the podcast
│   │   │   ├── episode1.mp3       ..........episode 1 audio file
│   │   │   ├── episode1.nfo       ..........episode 1 metadata
│   │   │   ├── episode2.mp3       ..........episode 2 audio file
│   │   │   ├── episode2.nfo       ..........episode 2 metadata
│   │   │   └── ...       ...................more episodes
│   │   └── ...       .......................more podcasts
│   └── video/       ........................add with library type: TV Shows
│       ├── show-1/       ...................a show
│       │   ├── tvshow.nfo       ............metadata of the show
│       │   ├── season-00/       ............a season of the show
│       │   │   ├── season.nfo       ........the show metadata
│       │   │   ├── episode1.webm       .....episode 1 video file
│       │   │   ├── episode1.nfo       ......episode 1 metadata
│       │   │   ├── episode2.webm       .....episode 2 video file
│       │   │   ├── episode2.nfo       ......episode 2 metadata
│       │   │   └── ...       ...............more episodes
│       │   └── ...       ...................more seasons
│       └── ...       .......................more shows
├── Dockerfile       ........................the docker image
└── docker-compose.yml       ................for docker compose users :)
```
