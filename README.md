# Auto dl

Automatic video downloader compatible with [Jellyfin](https://jellyfin.org/) and its [jellyfin-youtube-metadata-plugin](https://github.com/ankenyr/jellyfin-youtube-metadata-plugin) downloading using [yt-dlp](https://github.com/yt-dlp/yt-dlp).

---

# Features

1. Channels and Seasons
2. Download the latest video from a channel on a interval
3. Download videos from a video ID list
4. Move videos between Seasons

# Stack

- [Svelte](https://svelte.dev/) [frontend]
- [SvelteKit](https://svelte.dev/) [backend]
- [enmap](https://www.enmap.org/) [database]
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) [downloader]
- [decAPI](https://docs.decapi.me/youtube?endpoint=latest_video) [latest video API]

# Setup

1. Clone this Repo to your Server/System
   ```sh
   git clone https://github.com/flloschy/auto-dl.git
   ```
2. Set a username and password
   - edit `/src/lib/settings.ts`
   - change `username` and `password`
3. (optional) add a discord webhook
   - create a webhook in your discord server
   - edit `/src/lib/settings.ts`
   - change paste the url into `webhook`

## Docker

`docker-compose up -d`

## Manual

### Requirements

1. [node](https://nodejs.org/en/blog/release/v20.11.1) (optimal 20.11.1)
2. [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
3. [yt-dlp](https://github.com/yt-dlp/yt-dlp)
4. [ffmpeg](https://ffmpeg.org/) + [ffprobe](https://ffmpeg.org/ffprobe.html)

### Installation

1. `npm i`
2. `npm run build`
3. `node build`

   Info: This wont run it in the background, but thats a you problem :D

# Usage

## Interval

1. Go to the Dashboard
2. Move the Interval Slider
   - anything between 1h and 7d

Info: This defined how often channels will be scanned for new Videos

## Auto

1. Go to the Dashboard
2. Click the `Checkbox` on the right of "Auto" to toggle

Info: This will enable or disabled the automatic downloading.

## Add a Channel

1. Go to the Dashboard
2. Click `Add Channel`
3. Enter the Channel ID
   1. Go to your desired Channel
   2. Go into their About page
   3. Click `Share channel`
   4. Click `Copy channel ID`
4. Enter the Display Name
   > MUST be the same name else downloads WILL fail!
5. Enter a Description
   - Thats just something for you, though this cant be empty
6. `Create`

Info: New Channels are by default excluded from auto downloading

## Edit a Channel

1. Go to `Channels`
2. Select a Channel
3. Edit Name
   1. Click on the Name
   2. Edit
   3. Press the `Enter` key
4. Edit Description
   1. Click on the Description (under the name)
   2. Edit
   3. Press the `Enter` key
5. Edit Downloading
   1. Click the `Checkbox` on the right of "Downloading" to toggle

## Add a Season

1. Go to `Channels`
2. Select a Channel
3. Click `< new >`
4. Enter name
5. Enter Regex
   - Used for selecting the destination of a video
   - Javascript Regex String
     - You can go to [regex101](https://regex101.com/) to make yourself a new Regex
     - DONT just copy the regex eg. `/[A-Z]/gm` because this wont work. `[A-Z]` is enough (no starting`/` and no `/gm`).
6. Enter Description
   - Thats just something for you, though this cant be empty

## Edit a Season

1. Go to `Channels`
2. Select a Channel
3. Select a Season
4. Edit Name
   1. Click on the Name
   2. Edit
   3. Press the `Enter` key
5. Edit Description
   1. Click on the Description (under the name)
   2. Edit
   3. Press the `Enter` key
6. Edit Regex
   1. Click on the Regex
   2. Edit
   3. Press the `Enter` key

## Edit a Video

1. Go to `Channels`
2. Select a Channel
3. Select a Season
4. Select a Video
5. Edit Name
   1. Click on the Name
   2. Edit
   3. Press the `Enter` key
6. Move to another Season
   1. Select a new season (the big blue select option (looks like a button))
   2. Press the `Transfer` Button

## Add to Waitlist

1. Go to `Waitlist`
2. Click `Add to Waitlist`
3. Enter Video Id
   - NEEDS to be JUST the ID, not the url/link!
4. CLick `Append`

Important: In order for a video to be downloaded, the [Channel](#add-a-channel) MUST exist with the CORRECT channel name, else a video cant be assigned to a channel and thus wont be downloaded.

## Reset Interval

What is this Button? Well...

The way the downloading Interval works is that a value gets increased by one every hour until the desired hours are reached. This Button will set this value back to 0.

# Import / Export

I dont know how stable this feature is when there is a huge amount of database entries.

## Export

Get all the Database Tables as a JSON string.

## Import

1.  Go to `/import`
2.  Paste the new Database in (formatted like the output of the Export)

This is ONLY an emergency option in case the database gets messed up / desynced from the file system. This can break A LOT and should only be done with all your brain cells on at least 120% +

## VERY IMPORTANT

I know placing something important this far down is nothing good but thats a you problem, again :D (only if you didnt scroll here)

NO and I mean NOT A SINGLE button has ANY kind of confirmation. So a delete button WILL execute the deleting with NO way back, NO backups NO anything!

# File Layout

```
/data
    /downloads
        /Channel-Name-1
            /Season 00
                /S00E00 [ ... ].webm
                /S00E01 [ ... ].webm
                /S00E02 [ ... ].webm
                /S00E03 [ ... ].webm
            /Season 01
                /S01E00 [ ... ].webm
                /S01E01 [ ... ].webm
            /Season 02
                /S01E00 [ ... ].webm
            /...
        /Channel-Name-2
            /Season 00
        /...
```

###### inside the square brackets (`[ ... ]`) the video ID is placed for the jellyfin-youtube-metadata-plugin.

This file layout should satisfy the [Jellyfin Shows naming Convention](https://jellyfin.org/docs/general/server/media/shows/).

# Please...

ask any creators for permission before downloading any of their content. And even more important do not (publicly) share access to your downloaded files. Out of respect to the creators as well as Legal Issues... I guess, im not a Lawyer.

# FINALLY!!! IMAGES

## Dashboard

![dashboard screenshot](/readme/dashboard.png)

## Channels

![channels screenshot](/readme/channels.png)

## Waitlist

![waitlist screenshot](/readme/waitlist.png)

## Logs

![logs screenshot](/readme/logs.png)

## Webhook

![discord webhook screenshot](/readme/webhook.png)

# Development environment

1. [Requirements](#requirements)
2. `npm i`
3. `npm run dev`
4. Type `o` and `Enter` in the console to open
