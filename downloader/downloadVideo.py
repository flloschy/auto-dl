import sys
import os
import re
import json
import pytube
import time
from logger import log

def load_data():
    with open("./data/data.json") as f:
        return json.load(f)

def save_data(data):
    with open("./data/data.json", "w") as f:
        json.dump(data, f)

def get_channel(data, yt):
    return data.get(yt.channel_id, {
        'channelId': yt.channel_id,
        'name': yt.author,
        'description': '(no description provided yet)',
        'automaticDownloading': False,
        "audioOnly": False,
        'seasons': {
            'default': {
                'seasonNum': 0,
                'seasonId': 'default',
                'name': 'unsorted',
                'description': 'the place where videos end up when no other seasons regex gets triggerd',
                'regex': '.*',
                'updated': -1,
                'deletable': False,
                'episodes': {}
            }
        }
    })

def get_season(channel, yt):
    for key in channel['seasons']:
        if key == 'default':
            continue
        regex = re.compile(channel['seasons'][key]['regex'])
        if regex.match(yt.title):
            return channel['seasons'][key]
    return channel['seasons']['default']

def create_directory(path):
    if not os.path.exists(path):
        os.mkdir(path)


def add_video(data,
              yt: pytube.YouTube,
              episodeId,
              videoPath,
              season,
              audioOnly=False):
    video = {
        "episodeId": episodeId,
        "name": yt.title,
        "youtubeLink": yt.watch_url,
        "videoId": yt.video_id,
        "length": yt.length,
        "size": int(os.path.getsize(videoPath) / 1024**2),
        "downloadDate": int(time.time()),
        "audioOnly": audioOnly
    }
    data[yt.channel_id]['seasons'][season['seasonId']]['episodes'][
        yt.video_id] = video
    data[yt.channel_id]['seasons'][season['seasonId']]['updated'] = int(
        time.time())
    save_data(data)


def main(videoId):
    log(f"Downloading: {videoId}")
    yt = pytube.YouTube(f"https://youtube.com/watch?v=" + videoId)

    if yt.channel_id is None:
        log(f"Error: Downloading: {videoId}: Invalid videoID")
        raise LookupError("Invalid youtube ID")

    data = load_data()
    channel = get_channel(data, yt)
    data[yt.channel_id] = channel
    save_data(data)

    if videoId in "".join(os.listdir("./data/temp/")):
        log(f"Error: Downloading: {videoId}: Video already in download process"
            )
        raise FileExistsError("Video already in download process")

    if videoId in open("./data/data.json").read():
        log(f"Error: Downloading: {videoId}: Video already downloaded")
        raise FileExistsError("Video already downloaded")

    season = get_season(channel, yt)

    locationPath = "./data/videos/" + channel['name']
    create_directory(locationPath)
    locationPath += '/Season ' + str(season['seasonNum']).zfill(2)
    create_directory(locationPath)

    episodeId = len(season['episodes'].keys())

    locationFile = '/S' + str(
        season['seasonNum']).zfill(2) + 'E' + str(episodeId).zfill(
            2) + ' [' + videoId + '].' + ('mp3'
                                          if channel['audioOnly'] else 'mp4')

    tmpVideoPath = f"./data/temp/video{videoId}.mp4"
    tmpAudioPath = f"./data/temp/audio{videoId}.mp3"
    if not channel['audioOnly']:
        yt.streams.order_by('resolution').last().download(
            "./data/temp/", f"video{videoId}.mp4")
        yt.streams.get_audio_only().download("./data/temp/",
                                             f"audio{videoId}.mp3")
    else:
        yt.streams.get_audio_only().download(locationPath, locationFile)
        add_video(data, yt, episodeId, locationPath + locationFile, season, True)
        log(f"Done: Downloading: {videoId}")
        exit(0)

    code = os.system(
        f'ffmpeg -i "{tmpVideoPath}" -i "{tmpAudioPath}" -c:v copy -c:a aac -strict experimental "{locationPath}{locationFile}" -loglevel quiet -y'
    )
    if not channel['audioOnly']:
        os.remove(tmpVideoPath)
        os.remove(tmpAudioPath)
    if code == 1:
        log(f"Error: Downloading: {videoId}: ffmpeg error")
        raise ChildProcessError("ffmpeg failed")
    add_video(data, yt, episodeId, locationPath + locationFile, season)
    log(f"Done: Downloading: {videoId}")

if __name__ == "__main__":
    videoId = sys.argv[1]
    main(videoId)
