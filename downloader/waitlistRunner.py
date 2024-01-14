from downloadVideo import main
from logger import log
import re
regex = r'((?<=(v|V)\/)|(?<=be\/)|(?<=(\?|\&)v=)|(?<=embed\/))([\w-]+)'

def runWaitlist():
    with open("./data/waitlist.txt", "r") as f:
        for line in f.read().splitlines():
            videoId = re.search(regex, line).group(0)
            log(f"Waitlist: Downloading: {videoId}")
            try:
                main(videoId)
                log(f"Done: Waitlist: Downloading: {videoId}")
            except Exception as e:
                log(f"Error: Waitlist: Downloading: {videoId}: Downloader exited early: {e}")
                pass

            # overwrite the file but remove the current line
            with open("./data/waitlist.txt", "w") as f:
                for line in f.read().splitlines():
                    if line != videoId:
                        f.write(line)

if __name__ == '__main__': runWaitlist()
