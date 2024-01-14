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
            
            with open("./data/waitlist.txt", "w") as f2:
                f2.write("\n".join([line for line in f.read().replace(line, '').split('\n') if line.strip()]))

if __name__ == '__main__': runWaitlist()