import time, json
from channellistRunner import runChannellist
from waitlistRunner import runWaitlist
from logger import log

log("Logger started")
interval = 5

while True:
    with open("./data/latest.txt") as f:
        last = f.read()
    channelList, waitList = last.split(",")
    channelList, waitList = int(channelList), int(waitList)
    
    settings = json.load(open("./data/settings.json")) 
    now = time.time()
    if now - channelList > settings['channelListIntervalTime'] and settings['autoDownloadingEnabled']:
        with open("./data/latest.txt", "w") as f:
            f.write(f"{int(now)},{waitList}")
        runChannellist()
    if now - waitList > settings['waitListIntervalTime'] and settings['autoDownloadingEnabled']:
        with open("./data/latest.txt", "w") as f:
            f.write(f"{channelList},{int(now)}")
        runWaitlist()
    time.sleep(interval * 60)


