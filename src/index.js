const cron = require('node-cron');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const {exec} = require("child_process");

const getLatest = async (channel) => {
    const response = await fetch(`https://decapi.me/youtube/latest_video?id=${channel}&format={id}`)
    const id = await response.text()
    return id
}

const dlAudio = (id) => {
    let stream = ytdl(id, {quality: 'highestaudio'});
    let start = Date.now();
    console.log("starting audio download")
    return ffmpeg(stream)
        .audioBitrate(128)
        .save(`./downloadedVideos/downloading[${id}]audio.mp3`)
        .on('end', () => {
            console.log(`\naudio done in ${(Date.now() - start) / 1000}s`);
        });
}

const dlVideo = (id) => {
    let start = Date.now()
    return ytdl(id, {quality:'highestvideo'})
        .pipe(fs.createWriteStream(`./downloadedVideos/downloading[${id}]video.mp4`))
        .on('ready', () => console.log("starting video download"))
        .on('finish', () => console.log(`video done in ${(Date.now() - start) / 1000}s`))
}

const combineAudioAndVideo = (id) => {
    let start = Date.now()
    console.log("starting combining")
    return exec(
        `ffmpeg -i "./downloadedVideos/downloading[${id}]video.mp4" -i "./downloadedVideos/downloading[${id}]audio.mp3" -c:v copy -c:a aac "./downloadedVideos/[${id}].mp4"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`combining done in ${(Date.now() - start) / 1000}s`)
      })
}

const removeTmpFiles = (id) => {
    console.log("deleting temporary files")
    let start = Date.now()
    try {fs.rm(`./downloadedVideos/downloading[${id}]video.mp4`, (err) => {if (err) console.log(err)})}
    catch (e) {}
    try {fs.rm(`./downloadedVideos/downloading[${id}]audio.mp3`, (err) => {if (err) console.log(err)})}
    catch (e) {}
    console.log(`deleting done in ${(Date.now() - start) / 1000}s`)
}

const addDownloaded = (id) => {
    console.log(`adding ${id} to downloaded list`)
    fs.appendFile("./downloaded.txt", id + "\n", (err) => {if (err) console.log(err)})
}

const download = async (id) => {
    dlVideo(id)
        .on("finish", () =>
            dlAudio(id)
                .on('end', () =>
                    combineAudioAndVideo(id)
                        .on('error', () =>
                            removeTmpFiles(id)
                        )
                        .on('close', () => {
                                removeTmpFiles(id)
                                addDownloaded(id)
                            }
                        )
                        .on('exit', () => 
                            removeTmpFiles(id)
                        )
                        .on('disconnect', () =>
                            removeTmpFiles(id)
                        )
                    )
                .on('error', () =>
                    removeTmpFiles(id)
                )
        )
        .on('error', () =>
            removeTmpFiles(id)
        )
}

const dlChannels = async () => {
    await fs.readFile("./channels.txt", async (err, dataChannels) => {
        if (err) return
        await fs.readFile("./downloaded.txt", async (err, dataDownloaded) => {
            if (err) {console.log(err); return}
            const downloaded = dataDownloaded.toString().split("\n")
            const channels = dataChannels.toString().split("\n").map(v => v.split(" - ")[0])
            channels.forEach(async v => {
                let id = await getLatest(v)
                console.log(`latest video by ${v}: ${id}`)
                if (id.length > 15) {
                    console.log(`invalid video id`)
                    return
                }
                if (downloaded.includes(id)) {
                    console.log("already downloaded")
                    return
                }
                await download(id)
            })
        })
    })
}

const dlWait = async () => {
    await fs.readFile("./waitlist.txt", async (err, dataVideos) => {
        if (err) return
        const videos = dataVideos.toString().split("\n")
        videos.forEach(async id => {
            await download(id)
        })
        await fs.writeFile("./waitlist.txt", "", () => {if (err) console.log(err)})
    })
}

dlChannels()

// every 30min
cron.schedule('30 * * * *', () => {
    dlChannels()
});
cron.schedule('0 * * * *', () => {
    dlWait()
});

