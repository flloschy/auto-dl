import json, os, time, requests, pytube

waitTime = 0       # waiting time between operations
tmpFolder = ""     # temporary folder
dlFolder = ""      # download folder
chFile = ""        # channel list
dlFile = ""        # downloaded list
wlFile = ""        # wait list
instructions = []  # instructions
minLength = 0      # minimum video length in seconds

INFO = "\x1b[0;36m"
DEBUG = "\x1b[0;33m"
FAIL = "\x1b[0;31m"
DONE = "\x1b[0;32m"
RESET = "\x1b[0m"

def info(text, end="\n"):
    print(f"{INFO} [i] {text}{RESET}", end=end, flush=True)
def debug(text, end="\n"):
    print(f"{DEBUG} [d] {text}{RESET}", end=end, flush=True)
def done():
    print(f"{DONE} done{RESET}", flush=True)
def fail():
    print(f"{FAIL} failed{RESET}", flush=True)

def rmdir(path):
    try: os.remove(path + "/audio.mp3")
    except: pass
    try: os.remove(path + "/video.mp4")
    except: pass
    try: os.rmdir(path)
    except: pass
    
def loadConf():
    info("loading config", "")

    global waitTime, tmpFolder, dlFolder, chFile, dlFile, wlFile, instructions, minLength
    conf = json.load(open("./config.json"))
    tmpFolder = conf["folder"]["temporary"]
    dlFolder = conf["folder"]["downloads"]
    chFile = conf["files"]["channelList"]
    dlFile = conf["files"]["downloadedList"]
    wlFile = conf["files"]["waitList"]
    waitTime = conf["waitTimeMinutes"]
    minLength = conf["minimumVideoLengthSeconds"]
    instructions = list(conf["instructions"].replace(" ", ""))

    done()

    if not os.path.exists(tmpFolder):
        os.mkdir(tmpFolder)
        debug(f"created temp folder at {tmpFolder}")
    if not os.path.exists(dlFolder):
        os.mkdir(dlFolder)
        debug(f"created download folder at {dlFolder}")
    if not os.path.isfile(chFile):
        with open(chFile, "x") as f: f.write("")
        debug(f"created channel list file at {chFile}")
    if not os.path.isfile(dlFile):
        with open(dlFile, "x") as f: f.write("")
        debug(f"created download list file at {dlFile}")
    if not os.path.isfile(wlFile):
        with open(wlFile, "x") as f: f.write("")
        debug(f"created wait list file at {wlFile}")
    if waitTime <= 0:
        waitTime = 30
        debug(f"invalid wait time, defaulting to 30 minutes")
    if len(instructions) <= 0:
        instructions = ["d", "w", "c", "w"]
        debug(f"invalid instructions, defaulting to \"d w c w\"")
    if len("".join(instructions).replace("d", "").replace("w", "").replace("c", "")) != 0:
        instructions = ["d", "w", "c", "w"]
        debug(f"invalid instructions, defaulting to \"d w c w\"")
    if minLength < 0:
        minLength = 100
        debug(f"invalid minimum video length, defaulting to 100 seconds")


    debug("importing instructions", "")

    instructionsC = instructions.copy()
    instructions.clear()
    for inst in instructionsC:
        if inst == "d": instructions.append(downloadFromChannelList)
        elif inst == "w": instructions.append(wait)
        elif inst == "c": instructions.append(downloadFromCustomList)

    done()

def getLatestVideo(channel):
    debug(f"getting latest Video with https://decapi.me/youtube/latest_video?id={channel}&format=" + "{id}", "")
    ID = requests.get(f"https://decapi.me/youtube/latest_video?id={channel}&format=" + "{id}").content.decode("ascii")

    if len(ID) > 15:
        fail()
        debug(f"invalid response: {ID}")
        return False
    done()
    return ID

def download(ID, channelName, lengthCheck=True):
    try:
        debug("loading Youtube object", "")
        yt = pytube.YouTube(f"http://youtube.com/watch?v={ID}")
    except:
        fail()
        return False
    done()

    debug("checking video length", "")
    if (yt.length < minLength) and lengthCheck:
        fail()
        open(dlFile, "a").write(ID + "\n")
        return False
    done()

    path = f"{tmpFolder}/{ID}"

    os.mkdir(path)

    try:
        debug("downloading video", "")
        yt.streams.order_by("resolution").last().download(path, "video.mp4")
    except:
        fail()
        return False
    done()


    try:
        debug("downloading audio", "")
        yt.streams.get_audio_only().download(path, "audio.mp3")
    except:
        fail()
        return False
    done()

    if not os.path.exists(f"{dlFolder}/{channelName}"):
        os.mkdir(f"{dlFolder}/{channelName}")

    debug("combining video and audio", "") 
    code = os.system(f'ffmpeg -i "{path}/video.mp4" -i "{path}/audio.mp3" -c:v copy -c:a aac -strict experimental "{dlFolder}/{channelName}/S00E{len(os.listdir(f"{dlFolder}/{channelName}"))} [{ID}].mp4" -loglevel quiet -y')

    if code == 1:
        fail()
        return False
    done()

    return True

def downloadFromChannelList():
    channelList = [line.split(" - ") for line in open(chFile, "r").read().splitlines()]
    downloaded = open(dlFile, "r").read()
    for channelID, channelName in channelList:
        ID = getLatestVideo(channelID)
        debug("validating video ID", "")
        if not ID:
            fail()
            debug("... invalid ID value")
            continue
        if ID in downloaded:
            fail()
            debug("... already downloaded")
            continue
        done()

        info(f"starting download for {ID} by {channelID}")
        if download(ID, channelName):
            debug("adding ID to downloaded list", "")
            open(dlFile, "a").write(ID + "\n")
            done()
        else:
            pass

        rmdir(f"{tmpFolder}/{ID}")

def downloadFromCustomList():
    waitlist = open(wlFile, "r").read().splitlines()
    for ID in waitlist:
        info(f"downloading {ID} from custom list")
        if download(ID, False):
            debug("adding ID to downloaded list", "")
            open(dlFile, "a").write(ID + "\n")
            done()
        else:
            pass

        rmdir(f"{tmpFolder}/{ID}")

def cleanup():
    for folder in os.listdir(tmpFolder):
        rmdir(f"{tmpFolder}/{folder}")

def wait():
    info(f"sleeping for {waitTime} minutes")
    time.sleep(waitTime*60)
    done()

def loop():
    while True:
        for inst in instructions:
            inst()

loadConf()
cleanup()
loop()