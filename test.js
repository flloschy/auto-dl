// const fs = require('fs');
// const ytdl = require('ytdl-core');
// ytdl('http://www.youtube.com/watch?v=aqz-KE-bpKQ')
//   .pipe(fs.createWriteStream('video.mp4'));

async function t() {
  let f = await fetch("https://decapi.me/youtube/latest_video?id=UCB5zZAm0b5-EqWkOEwHBE_A&format={url}")
  return await f.text()
}
let resp = ""

await t().then(console.log).then(v => resp = v)

console.log(":) " + resp)