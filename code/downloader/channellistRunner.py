import json, requests
from downloadVideo import main
from logger import log

def getLatestVideo(channelid):
    ID = requests.get(f"https://decapi.me/youtube/latest_video?id={channelid}&format=" + "{id}").content.decode("ascii")

    if len(ID) > 15:
        return False
    return ID

def runChannellist():
    log("Running: Channellist")
    data = json.load(open("./data/data.json"))

    for channelId in data.keys():
        if data[channelId]['automaticDownloading']:
            log(f"Channellist: Checking: {data[channelId]['name']}")
            videoId = getLatestVideo(channelId)
            if videoId:
                log(f"Channellist: Downloading: {videoId}")
                try:
                    main(videoId)
                    log(f"Done: Channellist: Downloading: {videoId}")
                except:
                    log(f"Error: Channellist: Downloading: {videoId}: Downloader exited early")
                
    log("Done: Running: Channellist")
                
if __name__ == '__main__': runChannellist()