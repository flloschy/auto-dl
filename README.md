# This is *still* not fully tested nor fully feature complete

# installation

1. Install required packages
    - `apt install git python3 python3-pip ffmpeg`
    - `python3 -m pip install git+https://github.com/pytube/pytube`

2. Got/Create your desired parent path
    - `cd </your/desired/parent/path>`

3.  Clone the downloader
    - `git clone https://github.com/flloschy/auto-dl.git`

4.  Go into the downloader
    - `cd auto-dl`

5.  Give the execution permissions to `start.sh` and `setup.sh`
    - `chmod +x start.sh`
    - `chmod +x setup.sh`
6. Create data files
    - `./setup.sh`

7.  Configure your settings
    - `nano data/settings.json`
    - change `systemRoot` to the path which will be used to calculate the storage usage

8.  Configure your env
    - `nano .env`
    - set a username and password for Authentifikation (`ADMIN_AUTH`) replace `username` and `password` with their respective values
    - set a port the web server should be bound on (`port`). (I use 5002 because it fits in my port naming convention of my server)
    - set the `ORIGIN` to the domain form the the webUI will be accessed from. This is required because else `POST` request wont be able to execute - which are required for key functionality -
9.  Install all npm packages
    - `npm install`


10. At this point everything is ready to run. Though i assume you want this to start whenever your server boots up
    - `crontab -e`
    - Add a new line to the bottom `@reboot sleep 60 && cd </your/desired/parent/path>/auto-dl && ./start.sh >> ./logs/start.log 2>&1`
    - `reboot now`

And now the web interface *should* be reachable and the python "backend" *should* be running too