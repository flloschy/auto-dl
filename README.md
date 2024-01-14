# This is *still* not fully tested

# installation

1. preinstalling stuff
   1. `apt install python3 python3-pip ffmpeg`
   2. `python -m pip install git+https://github.com/pytube/pytube`
2. go to your desired destination, eg. `cd ~`
3. `git clone https://github.com/flloschy/auto-dl.git`
4. edit `data/settings.json`
   1. change `systemRoot` to a path you want, eg. `~/auto-dl`
   2. change `pythonCommand` if your python *cant* be called by `python3`
5. edit `.env`
   1. `ADMIN_AUTH=username:password` this will be your login, eg. `ADMIN_AUTH=admin:securePassword1234`
   2. `PORT=5002` this will be the port the site will be hosted on, i use 5002 because it fits my port selection scheme 
   3. `ORIGN=http(s)://your.domain` this must fit to the origin your request will come form. eg. `https://downloader.example.com`, if not set no post request will be allowed which are required for full functionality 
6. `npm install`
7. `npm run start`

But now you must keep your terminal open
I use crontab to start this process automatically on boot
via. `@reboot cd ~/auto-dl && npm run start`

and everything *should* work