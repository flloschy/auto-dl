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
5.  Configure your settings
    - `nano data/settings.json`
    - change `systemRoot` to the path which will be used to calculate the storage usage
6.  Configure your env
    - `nano .env`
    - set a username and password for Authentifikation (`ADMIN_AUTH`) replace `username` and `password` with their respective values
    - set a port the web server should be bound on (`port`). (I use 5002 because it fits in my port naming convention of my server)
    - set the `ORIGIN` to the domain form the the webUI will be accessed from. This is required because else `POST` request wont be able to execute - which are required for key functionality -
7.  Install all npm packages
    - `npm install`

8. Give everyone permissions to execute the `.sh` files
    - `chmod +x start.sh`
    - `chmod +x start-node-server.sh`
    - `chmod +x start-python-runner.sh`

9.  At this point everything is ready to run. Though i assume you want this to start whenever your server boots up
    - `crontab -e`
    - Add a new line `@reboot cd </your/desired/parent/path>/auto-dl && ./start.sh >> ./logs/start.log 2>&1`
    - `reboot now`

And now the web interface *should* be reachable and the python "backend" *should* be running too